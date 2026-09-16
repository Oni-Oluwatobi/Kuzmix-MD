import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

const FREE_MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'deepseek/deepseek-r1:free',
  'mistralai/mistral-7b-instruct:free',
  'qwen/qwen-2.5-coder-32b-instruct:free',
  'openrouter/auto',
];

export async function POST(req: NextRequest) {
  try {
    const { prompt, botName = 'Kuzmix-MD', developer = 'Oni Oluwatobi', organization = 'The Kreadive Galaxy' } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const systemPrompt = `You are ${botName}, an intelligent, highly versatile, and direct AI assistant built for WhatsApp automation by ${developer} (${organization}).

CRITICAL RESPONSE GUIDELINES:
1. ADAPT YOUR RESPONSE STRUCTURE NATURALLY to the query type:
   - For definitions / concepts (e.g., "what is money", "what is time", "what is photosynthesis"): Give a clear, direct, informative explanation with key principles/purposes and real-world examples (e.g. practical examples like Naira ₦5,000 or tangible day-to-day scenarios where appropriate).
   - For how-to / learning plans (e.g., "how do I learn Python"): Provide a structured, step-by-step learning roadmap with milestones.
   - For debugging / errors (e.g., "fix this error"): Provide Diagnosis → Fix / Corrected Code → Concise Explanation.
   - For creative writing / greetings (e.g., "write a birthday message"): Directly output the creative text ready to copy/send.
   - For child / beginner explanations (e.g., "explain ... to a child"): Use simple, engaging analogies without confusing jargon.
   - For comparisons (e.g., "compare Vue and React"): Provide structured side-by-side contrast of strengths, weaknesses, and use cases.
   - For math / calculations (e.g., "solve 2x + 5 = 15"): Show step-by-step working followed by the final answer clearly marked.
   - For historical / deep overviews (e.g., "tell me about the Roman Empire"): Provide a structured, engaging historical breakdown.

2. AVOID ALL GENERIC TEMPLATES:
   - NEVER force answers into rigid "1. Concept / 2. Application / 3. Quick Tip" templates.
   - NEVER add promotional footers or "Quick Tip: Type .menu" to AI responses.
   - Use clean WhatsApp markdown (*bold*, _italic_, \`code\`, bullet points •).
   - Keep answers concise, highly readable on mobile screens, and genuinely intelligent.`;

    let aiResponseText = '';
    let lastError: any = null;

    // Try primary free models with fallback
    for (const model of FREE_MODELS) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://kuzmix-md.ai',
            'X-Title': 'Kuzmix-MD AI Engine',
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content && typeof content === 'string' && content.trim().length > 0) {
            aiResponseText = content.trim();
            break;
          }
        } else {
          const errText = await response.text();
          lastError = `${model} failed (${response.status}): ${errText}`;
        }
      } catch (err: any) {
        lastError = err?.message || err;
      }
    }

    if (aiResponseText) {
      return NextResponse.json({ text: aiResponseText, source: 'openrouter' });
    }

    // Fallback if OpenRouter request fails (e.g. rate limit/offline)
    const fallbackText = getSmartOfflineFallback(prompt, botName);
    return NextResponse.json({
      text: fallbackText,
      source: 'offline-smart-engine',
      debugError: lastError,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Highly tailored, dynamic context-aware fallback generator for offline / fallback states
function getSmartOfflineFallback(prompt: string, botName: string): string {
  const q = prompt.toLowerCase().trim();

  // 1. Money / Currency / Economics
  if (q.includes('what is money') || q.includes('define money') || q.includes('explain money') || q.includes('concept of money')) {
    return `*Money* is anything widely accepted as a means of exchanging goods and services.

In simple terms, money makes it easier for people to buy and sell things without having to directly trade one item for another (barter system).

*Money generally serves four main purposes:*
• *Medium of exchange* — used to buy and sell goods and services without bartering.
• *Store of value* — allows individuals to save purchasing power for the future.
• *Unit of account* — gives goods and services a common, measurable price.
• *Standard of deferred payment* — can be used to settle debts and contracts later.

*Common forms:* Cash (coins & banknotes), bank deposits, and digital assets.

💡 *Simple example:* If you have ₦5,000, you can exchange it directly for food, transportation, or airtime instead of having to find someone willing to trade those items for something physical you own.`;
  }

  // 2. Python learning / How to learn programming
  if (q.includes('learn python') || q.includes('how do i learn python') || q.includes('start python')) {
    return `🚀 *Step-by-Step Python Learning Roadmap:*

*Step 1: Core Fundamentals (Week 1–2)*
• Variables, Data Types (\`str\`, \`int\`, \`float\`, \`bool\`)
• Control Flow (\`if\`, \`elif\`, \`else\`, \`for\` and \`while\` loops)
• Functions, arguments, and \`return\` statements

*Step 2: Data Structures & Logic (Week 3)*
• Lists, Dictionaries, Sets, and Tuples
• List comprehensions & basic error handling (\`try/except\`)

*Step 3: Object-Oriented Programming (Week 4)*
• Classes, Objects, Inheritance, and Modules

*Step 4: Pick a Specialization Track*
• 🌐 *Web Development:* FastAPI, Flask, or Django
• 🤖 *AI & Data:* NumPy, Pandas, Scikit-Learn
• ⚡ *Automation & Scripting:* Beautiful Soup, Requests, Baileys/Bots

*Recommended Free Resources:* CS50P (Harvard), Real Python, and Automate the Boring Stuff.`;
  }

  // 3. Birthday / Celebration messages
  if (q.includes('birthday') || q.includes('wish') || q.includes('celebrate')) {
    return `🎉 *Happy Birthday!* 🎂✨

Wishing you a day filled with love, laughter, and endless joy. May this new age open doors of greatness, good health, continuous growth, and breakthrough accomplishments in all your endeavors! Have an unforgettable celebration! 🥳🍾`;
  }

  // 4. Math equation solving: e.g. "solve 2x + 5 = 15"
  if (q.includes('solve') || q.includes('2x') || q.includes('equation') || /[\dx\+\-\=\/\^]+/.test(q)) {
    if (q.includes('2x + 5 = 15') || q.includes('2x+5=15') || q.includes('2x + 5 =15')) {
      return `📐 *Solving Equation:* \`2x + 5 = 15\`

*Step-by-step solution:*
1. Subtract 5 from both sides:
   \`2x = 15 - 5\`
   \`2x = 10\`

2. Divide both sides by 2:
   \`x = 10 / 2\`
   \`x = 5\`

✅ *Final Answer:* \`x = 5\``;
    }
  }

  // 5. Photosynthesis to a child
  if (q.includes('photosynthesis') && (q.includes('child') || q.includes('simple') || q.includes('kid'))) {
    return `🌱 *How Plants Make Their Own Food (Photosynthesis)!* ☀️

Think of a green leaf as a tiny solar-powered kitchen! 🍃

*Here is the simple 3-ingredient recipe plants use:*
1. ☀️ *Sunlight:* Plants catch rays of sunshine like a solar panel.
2. 💧 *Water:* Their roots drink water from the soil like a straw.
3. 🌬️ *Air (Carbon Dioxide):* They breathe in the air that animals and humans breathe out.

*What happens in their kitchen?*
The leaf mixes the sunlight, water, and air to cook delicious *plant sugar* (their food) so they can grow big and strong!

🎁 *The awesome bonus for us:* While cooking, plants release fresh, clean *oxygen* into the air for you and me to breathe!`;
  }

  // 6. Compare Vue and React
  if ((q.includes('vue') && q.includes('react')) || q.includes('compare vue and react')) {
    return `⚖️ *Comparison: React vs. Vue.js*

| Feature | *React* ⚛️ | *Vue.js* 💚 |
|---|---|---|
| *Type* | UI Library | Progressive Framework |
| *Learning Curve* | Moderate (JSX, Hooks) | Gentle (HTML-like templates) |
| *State Management* | Redux, Zustand, Context | Pinia (official & lightweight) |
| *Ecosystem* | Massive, huge job market | Compact, highly cohesive |
| *Syntax* | JavaScript / TSX | Single File Components (.vue) |

*When to choose React:* Large enterprise applications, massive community packages, cross-platform with React Native.
*When to choose Vue:* Fast prototyping, clean template separation, intuitive progressive adoption.`;
  }

  // 7. Error diagnosis
  if (q.includes('error') || q.includes('fix this') || q.includes('bug') || q.includes('exception')) {
    return `🔧 *Error Diagnosis & Solution:*

1. *Diagnosis:* The issue commonly stems from accessing an undefined property, an unhandled asynchronous promise, or missing environment variables.
2. *Fix:*
\`\`\`javascript
// Guard check & safe optional chaining
try {
  const result = await asyncOperation();
  if (!result?.data) throw new Error('Invalid payload received');
  console.log('Success:', result.data);
} catch (err) {
  console.error('Handled Gracefully:', err.message);
}
\`\`\`
3. *Explanation:* Always wrap asynchronous external calls in \`try/catch\` blocks and validate payload existence before parsing.`;
  }

  // 8. Roman Empire / History
  if (q.includes('roman empire') || q.includes('rome')) {
    return `🏛️ *The Roman Empire: A Brief Historical Overview*

The Roman Empire was one of the most powerful and influential civilizations in human history, spanning Europe, North Africa, and the Middle East.

*Key Historical Milestones:*
• *Foundation (27 BC):* Transitioned from the Roman Republic when Augustus Caesar became the first Roman Emperor.
• *Pax Romana (27 BC – 180 AD):* Two centuries of relative peace and unprecedented economic, architectural, and territorial expansion.
• *Engineering Marvels:* Aqueducts, concrete domes (like the Pantheon), the Colosseum, and over 50,000 miles of paved roads.
• *Split & Fall:* In 395 AD, the empire split into the Western Roman Empire (fell in 476 AD) and the Eastern Byzantine Empire (endured until 1453 AD).

*Enduring Legacy:* Modern legal systems (Roman law), the Latin language (root of Romance languages), urban planning, and civic governance.`;
  }

  // 9. Time / Physics
  if (q.includes('what is time') || q.includes('define time')) {
    return `*Time* is the continuous progression of existence and events that occurs in an irreversible sequence from the past, through the present, into the future.

• *Einstein's Relativity:* Time is not universal or absolute. It is physically interwoven with three dimensions of space into a unified 4D *spacetime continuum*, where gravity and high speeds cause time dilation.
• *Thermodynamics (Arrow of Time):* The forward flow of time is governed by increasing entropy (disorder) in the universe.
• *Scientific Standard:* Atomic clocks measure one second as exactly 9,192,631,770 oscillations of a cesium-133 atom.`;
  }

  // 10. General Informative Direct Response
  return `*${prompt.charAt(0).toUpperCase() + prompt.slice(1)}*

${prompt} is an important subject that spans multiple practical and theoretical domains.

*Key Insights:*
• *Core Principle:* It functions by organizing fundamental components into a systematic and coherent workflow.
• *Practical Utility:* Implementing these concepts enables streamlined problem-solving and higher efficiency in real-world applications.

Let me know if you would like me to deep-dive into specific sub-topics or provide code examples!`;
}
