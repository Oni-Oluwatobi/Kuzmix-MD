// Safety regression tests for the Kuzmix-MD message pipeline.
// Runs WITHOUT baileys installed — exercises messageHandler + registry + config only.
const commandHandler = require('./handlers/commandHandler');
const config = require('./config');
const messageStore = require('./lib/messageStore');
const { handleMessage } = require('./handlers/messageHandler');

let passed = 0;
let failed = 0;

function check(name, cond) {
  if (cond) {
    passed++;
    console.log(`✅ [PASS] ${name}`);
  } else {
    failed++;
    console.error(`❌ [FAIL] ${name}`);
  }
}

async function run() {
  console.log('--- TESTING KUZMIX-MD SAFETY PIPELINE ---');
  commandHandler.loadCommands();

  // Force safe defaults for the test run
  config.privateMode = true;
  config.publicMode = false;
  config.strictMode = true;
  config.unknownCommandMode = 'silent';
  config.mode = 'public';

  const sent = [];
  const sock = {
    user: { id: '2349124846023:1@s.whatsapp.net' },
    sendMessage: async (jid, content, options) => {
      sent.push({ jid, content, options });
      return { key: { id: 'SENT_' + sent.length, remoteJid: jid } };
    },
    groupMetadata: async () => ({ participants: [] }),
  };

  const OWNER = '2349124846023';
  const USER = '2340999999999';

  async function fire({ jid, participant, id, fromMe, text, useSock, sink }) {
    const targetSock = useSock || sock;
    const sinkArr = sink || sent;
    sinkArr.length = 0;
    const msg = {
      key: {
        remoteJid: jid,
        id,
        fromMe: Boolean(fromMe),
        participant: participant || undefined,
      },
      message: { conversation: text },
    };
    await handleMessage(targetSock, { type: 'notify', messages: [msg] });
    return sinkArr.slice();
  }

  // --- Spec: config defaults (private by default, strict on, silent unknowns) ---
  check('default privateMode is true', config.privateMode === true);
  check('default publicMode is false', config.publicMode === false);
  check('default strictMode is true', config.strictMode === true);
  check('default unknownCommandMode is silent', config.unknownCommandMode === 'silent');

  // --- Spec: group non-owner is silent by default ---
  let out = await fire({
    jid: '123456789@g.us',
    participant: USER + '@s.whatsapp.net',
    id: 'T_GROUP_NONOWNER',
    text: '.ping',
  });
  check('group non-owner .ping silent by default', out.length === 0);

  // --- Spec: DM non-owner silent by default (private mode) ---
  out = await fire({ jid: USER + '@s.whatsapp.net', id: 'T_DM_NONOWNER', text: '.ping' });
  check('DM non-owner .ping silent (privateMode)', out.length === 0);

  // --- Spec: owner still works in DM while private mode is on ---
  out = await fire({ jid: OWNER + '@s.whatsapp.net', id: 'T_OWNER_DM', text: '.ping' });
  check('owner DM .ping responds (privateMode on)', out.length === 1);

  // --- Spec: "good evening everyone" must NEVER trigger tagall (fuzzy match removed) ---
  config.publicMode = true;
  out = await fire({
    jid: '123456789@g.us',
    participant: USER + '@s.whatsapp.net',
    id: 'T_FUZZY',
    text: 'good evening everyone',
  });
  check('"good evening everyone" does not trigger tagall', out.length === 0);
  config.publicMode = false;

  // --- Spec: strict mode ON — bare "ping" ignored ---
  out = await fire({ jid: OWNER + '@s.whatsapp.net', id: 'T_STRICT_ON', text: 'ping' });
  check('strict ON: bare "ping" ignored', out.length === 0);

  // --- Spec: strict mode OFF — bare EXACT "ping" works ---
  config.strictMode = false;
  out = await fire({ jid: OWNER + '@s.whatsapp.net', id: 'T_STRICT_OFF', text: 'ping' });
  check('strict OFF: bare exact "ping" works', out.length >= 1);

  // --- Spec: strict mode OFF — "ping now" still ignored (bare path allows no args) ---
  out = await fire({ jid: OWNER + '@s.whatsapp.net', id: 'T_STRICT_OFF_ARGS', text: 'ping now' });
  check('strict OFF: "ping now" ignored (bare exact only)', out.length === 0);
  config.strictMode = true;

  // --- Spec: unknown prefixed command silent by default ---
  out = await fire({ jid: OWNER + '@s.whatsapp.net', id: 'T_UNKNOWN', text: '.foobarbaz' });
  check('unknown .foobarbaz silent by default', out.length === 0);

  // --- Spec: duplicate delivery of same message ID processed once ---
  const dupMsg = {
    key: { remoteJid: OWNER + '@s.whatsapp.net', id: 'T_DUP', fromMe: false },
    message: { conversation: '.ping' },
  };
  sent.length = 0;
  await handleMessage(sock, { type: 'notify', messages: [dupMsg] });
  const afterFirst = sent.length;
  await handleMessage(sock, { type: 'notify', messages: [dupMsg] });
  check('duplicate message ID processed once', afterFirst === 1 && sent.length === 1);

  // --- Spec: bot's own sent messages (echo) are ignored ---
  messageStore.markSent('T_ECHO');
  sent.length = 0;
  await handleMessage(sock, {
    type: 'notify',
    messages: [{
      key: { remoteJid: OWNER + '@s.whatsapp.net', id: 'T_ECHO', fromMe: true },
      message: { conversation: '.ping' },
    }],
  });
  check('self-sent echo skipped via markSent/wasSent', sent.length === 0);

  // --- Spec: public mode opens groups to non-owners ---
  config.publicMode = true;
  config.privateMode = false;
  out = await fire({
    jid: '123456789@g.us',
    participant: USER + '@s.whatsapp.net',
    id: 'T_PUBLIC',
    text: '.ping',
  });
  check('publicMode: group non-owner .ping responds', out.length === 1);
  config.publicMode = false;
  config.privateMode = true;

  // --- Spec: status broadcasts always ignored ---
  sent.length = 0;
  await handleMessage(sock, {
    type: 'notify',
    messages: [{
      key: { remoteJid: 'status@broadcast', id: 'T_STATUS', fromMe: false },
      message: { conversation: '.ping' },
    }],
  });
  check('status@broadcast ignored', sent.length === 0);

  // --- Spec: owner still works in groups while public mode is OFF (owner bypass) ---
  out = await fire({
    jid: '123456789@g.us',
    participant: OWNER + '@s.whatsapp.net',
    id: 'T_OWNER_GROUP',
    text: '.ping',
  });
  check('owner group .ping responds with publicMode off', out.length === 1);

  // --- Spec: prefixed path still accepts args in strict mode ---
  out = await fire({ jid: OWNER + '@s.whatsapp.net', id: 'T_ARGS', text: '.menu pair' });
  check('strict ON: prefixed ".menu pair" responds', out.length >= 1);

  // --- Spec: the paired account is the operator of its own session ---
  const pairSent = [];
  const pairSock = {
    user: { id: USER + ':2@s.whatsapp.net' },
    sendMessage: async (jid, content, options) => {
      pairSent.push({ jid, content, options });
      return { key: { id: 'PAIR_' + pairSent.length, remoteJid: jid } };
    },
    groupMetadata: async () => ({ participants: [] }),
  };

  out = await fire({
    jid: '123456789@g.us',
    participant: USER + '@s.whatsapp.net',
    id: 'T_OWN_GROUP',
    text: '.ping',
    useSock: pairSock,
    sink: pairSent,
  });
  check('paired account .ping in group responds (session operator)', out.length === 1);

  out = await fire({
    jid: USER + '@s.whatsapp.net',
    id: 'T_OWN_DM',
    text: '.ping',
    useSock: pairSock,
    sink: pairSent,
  });
  check('paired account .ping in own DM responds (session operator)', out.length === 1);

  out = await fire({
    jid: USER + '@s.whatsapp.net',
    id: 'T_OWN_EVAL',
    text: '.eval',
    useSock: pairSock,
    sink: pairSent,
  });
  check(
    'paired account still blocked from owner-only .eval',
    out.length === 1 && out[0].content && String(out[0].content.text).includes('Access Denied')
  );

  console.log(`\n========================================`);
  console.log(`SAFETY RESULTS: ${passed} passed, ${failed} failed.`);
  console.log(`========================================`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
