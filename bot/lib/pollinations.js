const { getJson, getBuffer } = require('./httpClient');

const MODELS_ENDPOINT = 'https://gen.pollinations.ai/image/models';
const IMAGE_API = 'https://image.pollinations.ai';
const VIDEO_API = 'https://gen.pollinations.ai/video';
const CACHE_TTL = 30 * 60 * 1000;
const MAX_RETRIES = 3;

let registryCache = null;
let registryTimestamp = 0;

const FREE_IMAGE_MODELS = [
  'tongyi-mai/z-image-turbo',
  'openai/gpt-image-2',
  'black-forest-labs/flux.2-klein-4b',
  'black-forest-labs/flux.1-schnell',
  'black-forest-labs/flux.1-kontext-pro',
  'openai/gpt-image-1.5',
  'openai/gpt-image-1-mini',
  'amazon/nova-canvas-v1',
  'lykon/dreamshaper-8-lcm',
  'microsoft/mai-image-2.5-flash',
];

const PAID_IMAGE_MODELS = [
  'bytedance/seedream-5.0-pro',
  'bytedance/seedream-5.0-lite',
  'black-forest-labs/flux.2-max',
  'black-forest-labs/flux.2-pro',
  'black-forest-labs/flux.2-flex',
  'google/gemini-3.1-flash-image',
  'google/gemini-3-pro-image',
  'openai/gpt-image-2.5-flare',
  'openai/gpt-image-2.5-sunburst',
  'ideogram-ai/ideogram-v4-quality',
  'ideogram-ai/ideogram-v4-turbo',
  'ideogram-ai/ideogram-v4-balanced',
  'x-ai/grok-imagine-image',
  'x-ai/grok-imagine-image-quality',
  'x-ai/grok-imagine-image-2.0',
  'qwen/qwen-image-3',
  'qwen/qwen-image',
  'bytedance/seedream-4.5',
  'bytedance/seedream-4.0',
  'google/gemini-2.5-flash-image',
  'google/gemini-3.1-flash-lite-image',
  'alibaba/wan-2.7-image',
  'alibaba/wan-2.7-image-pro',
  'krea/krea-2-medium',
  'recraft/recraft-v4.1-vector',
  'prunaai/p-image',
  'prunaai/p-image-edit',
];

const FREE_VIDEO_MODELS = [
  'amazon/nova-reel-v1',
];

const PAID_VIDEO_MODELS = [
  'google/veo-3.1-fast',
  'bytedance/seedance-2.5',
  'bytedance/seedance-2.0',
  'bytedance/seedance-2.0-fast',
  'bytedance/seedance-2.0-mini',
  'bytedance/seedance-1-pro-fast',
  'alibaba/wan-3.0',
  'alibaba/wan-2.7',
  'alibaba/wan-2.6',
  'alibaba/wan-2.2-fast',
  'alibaba/happyhorse-1.1',
  'x-ai/grok-imagine-video',
  'x-ai/grok-imagine-video-1.5',
  'minimax/minimax-h3',
  'minimax/minimax-h3-max-turbo',
  'google/gemini-omni-1.1-flash',
  'prunaai/p-video',
];

const IMAGE_ALIASES = {
  'seedream': 'bytedance/seedream-5.0-pro',
  'seedream-lite': 'bytedance/seedream-5.0-lite',
  'flux-max': 'black-forest-labs/flux.2-max',
  'flux-pro': 'black-forest-labs/flux.2-pro',
  'flux-klein': 'black-forest-labs/flux.2-klein-4b',
  'flux-schnell': 'black-forest-labs/flux.1-schnell',
  'gemini-image': 'google/gemini-3.1-flash-image',
  'gemini-pro': 'google/gemini-3-pro-image',
  'gpt-image': 'openai/gpt-image-2',
  'gpt-flare': 'openai/gpt-image-2.5-flare',
  'ideogram': 'ideogram-ai/ideogram-v4-quality',
  'grok-image': 'x-ai/grok-imagine-image',
  'qwen-image': 'qwen/qwen-image-3',
  'zimage': 'tongyi-mai/z-image-turbo',
  'nova-canvas': 'amazon/nova-canvas-v1',
};

const VIDEO_ALIASES = {
  'veo': 'google/veo-3.1-fast',
  'seedance': 'bytedance/seedance-2.5',
  'seedance-fast': 'bytedance/seedance-2.0-fast',
  'wan': 'alibaba/wan-3.0',
  'wan-fast': 'alibaba/wan-2.2-fast',
  'grok-video': 'x-ai/grok-imagine-video-1.5',
  'nova-reel': 'amazon/nova-reel-v1',
};

const IMAGE_QUALITY_TIERS = [
  ['openai/gpt-image-2.5-flare', 'bytedance/seedream-5.0-pro', 'black-forest-labs/flux.2-max', 'google/gemini-3-pro-image'],
  ['openai/gpt-image-2', 'black-forest-labs/flux.2-pro', 'ideogram-ai/ideogram-v4-quality', 'x-ai/grok-imagine-image', 'qwen/qwen-image-3'],
  ['black-forest-labs/flux.2-klein-4b', 'google/gemini-3.1-flash-image', 'tongyi-mai/z-image-turbo', 'openai/gpt-image-1.5'],
  ['black-forest-labs/flux.1-schnell', 'openai/gpt-image-1-mini', 'lykon/dreamshaper-8-lcm', 'amazon/nova-canvas-v1'],
];

const VIDEO_QUALITY_TIERS = [
  ['google/veo-3.1-fast'],
  ['bytedance/seedance-2.5', 'x-ai/grok-imagine-video-1.5', 'alibaba/wan-3.0'],
  ['bytedance/seedance-2.0', 'alibaba/wan-2.7', 'minimax/minimax-h3'],
  ['amazon/nova-reel-v1'],
];

const ALL_FREE_IMAGE_MODELS = new Set(FREE_IMAGE_MODELS);
const ALL_FREE_VIDEO_MODELS = new Set(FREE_VIDEO_MODELS);

function isFreeModel(modelId) {
  return ALL_FREE_IMAGE_MODELS.has(modelId) || ALL_FREE_VIDEO_MODELS.has(modelId);
}

async function getRegistry() {
  const now = Date.now();
  if (registryCache && (now - registryTimestamp) < CACHE_TTL) {
    return registryCache;
  }

  try {
    const models = await getJson(MODELS_ENDPOINT, { timeout: 15000 });
    const registry = { image: [], video: [] };

    for (const model of models) {
      const id = model.id || model.name;
      const modalities = (model.outputModalities || model.output_modalities || []).map(m => m.toLowerCase());
      const entry = {
        id,
        name: model.name || id,
        paid_only: model.paid_only || model.paidOnly || false,
        cost: model.cost || null,
      };

      if (modalities.includes('video')) {
        registry.video.push(entry);
      } else {
        registry.image.push(entry);
      }
    }

    registryCache = registry;
    registryTimestamp = now;
    console.log('[Pollinations] Registry refreshed: ' + registry.image.length + ' image, ' + registry.video.length + ' video models');
    return registry;
  } catch (err) {
    console.warn('[Pollinations] Failed to fetch registry, using hardcoded fallback: ' + err.message);
    const fallback = {
      image: [
        ...FREE_IMAGE_MODELS.map(id => ({ id, name: id, paid_only: false, cost: null })),
        ...PAID_IMAGE_MODELS.map(id => ({ id, name: id, paid_only: true, cost: null })),
      ],
      video: [
        ...FREE_VIDEO_MODELS.map(id => ({ id, name: id, paid_only: false, cost: null })),
        ...PAID_VIDEO_MODELS.map(id => ({ id, name: id, paid_only: true, cost: null })),
      ],
    };
    registryCache = fallback;
    registryTimestamp = now;
    return fallback;
  }
}

function resolveModel(aliasOrId, type) {
  const aliases = type === 'video' ? VIDEO_ALIASES : IMAGE_ALIASES;
  if (aliases[aliasOrId]) return aliases[aliasOrId];

  const models = type === 'video' ? FREE_VIDEO_MODELS : FREE_IMAGE_MODELS;
  const paidModels = type === 'video' ? PAID_VIDEO_MODELS : PAID_IMAGE_MODELS;
  if (models.includes(aliasOrId) || paidModels.includes(aliasOrId)) return aliasOrId;

  return null;
}

function isValidModel(modelId, type) {
  if (type === 'image') return FREE_IMAGE_MODELS.includes(modelId) || PAID_IMAGE_MODELS.includes(modelId);
  return FREE_VIDEO_MODELS.includes(modelId) || PAID_VIDEO_MODELS.includes(modelId);
}

function getModelInfo(modelId) {
  const all = [...FREE_IMAGE_MODELS, ...PAID_IMAGE_MODELS, ...FREE_VIDEO_MODELS, ...PAID_VIDEO_MODELS];
  if (!all.includes(modelId)) return null;
  const name = modelId.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return { id: modelId, name, paid_only: !isFreeModel(modelId) };
}

function selectModel(type, mode, preferredAlias) {
  mode = mode || 'auto';
  preferredAlias = preferredAlias || null;

  if (preferredAlias) {
    const resolved = resolveModel(preferredAlias, type);
    if (resolved) {
      if (mode === 'free' && !isFreeModel(resolved)) {
        // Fall through to default selection
      } else {
        return resolved;
      }
    }
  }

  const tiers = type === 'video' ? VIDEO_QUALITY_TIERS : IMAGE_QUALITY_TIERS;

  if (mode === 'free' || mode === 'auto') {
    for (const tier of tiers) {
      for (const modelId of tier) {
        if (isFreeModel(modelId)) return modelId;
      }
    }
  }

  // PREMIUM or fallback: pick best quality overall
  for (const tier of tiers) {
    if (tier.length > 0) return tier[0];
  }

  return type === 'video' ? 'amazon/nova-reel-v1' : 'black-forest-labs/flux.1-schnell';
}

function getFallbackChain(type, mode, excludeIds) {
  mode = mode || 'auto';
  excludeIds = excludeIds || [];
  const exclude = new Set(excludeIds);
  const tiers = type === 'video' ? VIDEO_QUALITY_TIERS : IMAGE_QUALITY_TIERS;
  const chain = [];

  for (const tier of tiers) {
    for (const modelId of tier) {
      if (exclude.has(modelId)) continue;
      if (mode === 'free' && !isFreeModel(modelId)) continue;
      chain.push(modelId);
    }
  }

  return chain;
}

function buildImageUrl(prompt, modelId, width, height, seed) {
  const params = new URLSearchParams();
  params.set('model', modelId);
  params.set('width', String(width));
  params.set('height', String(height));
  params.set('seed', String(seed));
  params.set('nologo', 'true');
  return IMAGE_API + '/prompt/' + encodeURIComponent(prompt) + '?' + params.toString();
}

function buildVideoUrl(prompt, modelId, width, height, duration, seed, apiKey) {
  const params = new URLSearchParams();
  params.set('model', modelId);
  params.set('width', String(width));
  params.set('height', String(height));
  params.set('duration', String(duration));
  params.set('seed', String(seed));
  if (apiKey) params.set('key', apiKey);
  return VIDEO_API + '/' + encodeURIComponent(prompt) + '?' + params.toString();
}

function classifyError(msg) {
  if (msg.includes('402')) return 'Model requires payment';
  if (msg.includes('429')) return 'Rate limited';
  if (msg.includes('timeout') || msg.includes('abort')) return 'Request timed out';
  if (msg.includes('400')) return 'Invalid request or prompt';
  return msg;
}

async function generateImage(prompt, opts) {
  opts = opts || {};
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt is required and must be a string');
  }
  if (prompt.trim().length === 0) {
    throw new Error('Prompt cannot be empty');
  }

  const preferredModel = opts.model || null;
  const width = opts.width || 1024;
  const height = opts.height || 1024;
  const seed = opts.seed != null ? opts.seed : Math.floor(Math.random() * 999999);
  const mode = opts.mode || 'auto';

  let modelId;
  if (preferredModel) {
    modelId = resolveModel(preferredModel, 'image');
    if (!modelId) modelId = selectModel('image', mode);
  } else {
    modelId = selectModel('image', mode);
  }

  const errors = [];
  const tried = new Set();

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (!tried.has(modelId)) {
      tried.add(modelId);

      const url = buildImageUrl(prompt, modelId, width, height, seed);
      console.log('[Pollinations] Image attempt ' + (attempt + 1) + ': model=' + modelId);

      try {
        const buffer = await getBuffer(url, { timeout: 90000 });
        if (buffer && buffer.length > 1000) {
          return { buffer, model: modelId, seed };
        }
        errors.push({ model: modelId, error: 'Response too small or empty' });
      } catch (err) {
        const msg = classifyError(err.message || String(err));
        errors.push({ model: modelId, error: msg });
        console.warn('[Pollinations] Image model ' + modelId + ' failed: ' + msg);
      }
    }

    const chain = getFallbackChain('image', mode, Array.from(tried));
    if (chain.length === 0) break;
    modelId = chain[0];
  }

  const summary = errors.map(function(e) { return e.model + ': ' + e.error; }).join('; ');
  throw new Error('All image models failed. Attempts: ' + summary);
}

const HF_VIDEO_MODELS = [
  'Wan-AI/Wan2.1-T2V-14B',
  'tencent/HunyuanVideo',
  'genmo/mochi-1-preview',
  'SulphurAI/Sulphur-2-base',
];

async function generateWithHuggingFace(prompt, opts) {
  const hfToken = opts.hfToken || process.env.HUGGINGFACE_API_KEY || '';
  if (!hfToken) {
    throw new Error(
      'HuggingFace backend requires HUGGINGFACE_API_KEY.\n' +
      '1. Go to huggingface.co/settings/tokens\n' +
      '2. Create a free token (Read access)\n' +
      '3. Set HUGGINGFACE_API_KEY in Render environment'
    );
  }

  const width = opts.width || 720;
  const height = opts.height || 1280;
  const modelId = opts.hfModel || HF_VIDEO_MODELS[0];

  const url = `https://router.huggingface.co/hf-inference/models/${modelId}`;
  console.log('[HuggingFace] Video request: model=' + modelId);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hfToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { width, height },
    }),
    signal: AbortSignal.timeout(300000),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => response.statusText);
    throw new Error(`HuggingFace HTTP ${response.status}: ${errText.slice(0, 200)}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = await response.json();
    if (json.error) throw new Error(json.error);
    if (json[0]?.url) {
      const videoBuffer = await getBuffer(json[0].url, { timeout: 120000 });
      return { buffer: videoBuffer, model: modelId, seed: 0 };
    }
    throw new Error('Unexpected JSON response from HuggingFace');
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer || buffer.length < 1000) {
    throw new Error('Received empty video from HuggingFace');
  }

  return { buffer, model: modelId, seed: 0 };
}

async function generateWithPollinations(prompt, opts) {
  const apiKey = opts.apiKey || process.env.POLLINATIONS_API_KEY || '';
  if (!apiKey) {
    throw new Error(
      'Pollinations backend requires POLLINATIONS_API_KEY.\n' +
      'Register free at enter.pollinations.ai/keys\n' +
      'Then set POLLINATIONS_API_KEY in Render environment.'
    );
  }

  const mode = opts.mode || 'auto';

  if (mode === 'free' || mode === 'auto') {
    throw new Error(
      'Pollinations video has no free models available.\n' +
      'Switch to HuggingFace backend: `.videobackend huggingface`\n' +
      'Or set VIDEO_BACKEND=huggingface in Render.'
    );
  }

  const preferredModel = opts.model || null;
  const width = opts.width || 720;
  const height = opts.height || 1280;
  const duration = opts.duration || 5;
  const seed = opts.seed != null ? opts.seed : Math.floor(Math.random() * 999999);

  let modelId;
  if (preferredModel) {
    modelId = resolveModel(preferredModel, 'video');
    if (!modelId) modelId = selectModel('video', mode);
  } else {
    modelId = selectModel('video', mode);
  }

  const errors = [];
  const tried = new Set();

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (!tried.has(modelId)) {
      tried.add(modelId);

      const url = buildVideoUrl(prompt, modelId, width, height, duration, seed, apiKey);
      console.log('[Pollinations] Video attempt ' + (attempt + 1) + ': model=' + modelId);

      try {
        const buffer = await getBuffer(url, { timeout: 180000 });
        if (buffer && buffer.length > 1000) {
          return { buffer, model: modelId, seed };
        }
        errors.push({ model: modelId, error: 'Response too small or empty' });
      } catch (err) {
        const msg = classifyError(err.message || String(err));
        errors.push({ model: modelId, error: msg });
        console.warn('[Pollinations] Video model ' + modelId + ' failed: ' + msg);
      }
    }

    const chain = getFallbackChain('video', mode, Array.from(tried));
    if (chain.length === 0) break;
    modelId = chain[0];
  }

  const summary = errors.map(function(e) { return e.model + ': ' + e.error; }).join('; ');
  throw new Error('All Pollinations video models failed. Attempts: ' + summary);
}

async function generateVideo(prompt, opts) {
  opts = opts || {};
  if (!prompt || typeof prompt !== 'string') throw new Error('Prompt is required');
  if (prompt.trim().length === 0) throw new Error('Prompt cannot be empty');

  const backend = opts.backend || process.env.VIDEO_BACKEND || 'huggingface';

  if (backend === 'pollinations') {
    return generateWithPollinations(prompt, opts);
  }
  return generateWithHuggingFace(prompt, opts);
}

module.exports = {
  getRegistry,
  resolveModel,
  isValidModel,
  isFreeModel,
  getModelInfo,
  selectModel,
  getFallbackChain,
  generateImage,
  generateVideo,
  generateWithHuggingFace,
  generateWithPollinations,
  HF_VIDEO_MODELS,
  IMAGE_ALIASES,
  VIDEO_ALIASES,
  FREE_IMAGE_MODELS,
  FREE_VIDEO_MODELS,
};
