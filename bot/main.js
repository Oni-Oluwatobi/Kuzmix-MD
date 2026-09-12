const { startBot } = require('./bot');

process.on('uncaughtException', (err) => {
  console.error('[KUZMIX CRITICAL ERROR]', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[KUZMIX UNHANDLED PROMISE]', reason);
});

startBot().catch((err) => {
  console.error('[KUZMIX FATAL ERROR ON STARTUP]', err);
});
