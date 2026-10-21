import app from './app.js';
import { PORT, NODE_ENV } from './config/env.js';

const server = app.listen(PORT, () => {
  console.log(`[IIITBH API] Server running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`[IIITBH API] Health check endpoint: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown lifecycle handlers
const shutdown = (signal) => {
  console.log(`\n[IIITBH API] Received ${signal}. Closing HTTP server gracefully...`);
  server.close(() => {
    console.log('[IIITBH API] HTTP server closed cleanly. Exiting process.');
    process.exit(0);
  });

  // Force close after 10 seconds if lingering connections exist
  setTimeout(() => {
    console.error('[IIITBH API] Could not close connections in time, forcefully shutting down.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default server;
