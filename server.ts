/**
 * Server Entry Point for Magnaci Casino
 * Binds to port 3000 and host 0.0.0.0
 * Mounts Express routes and Vite middleware for full-stack SPA support.
 */

import './server/suppressLogs.js';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { router as apiRouter } from './server/routes.js';
import { db } from './server/db.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));
app.use('/avatars', express.static(path.join(process.cwd(), 'public', 'avatars')));

// API Routes FIRST
app.use('/api', apiRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', casino: 'Magnaci Casino Online', time: new Date().toISOString() });
});

async function startServer() {
  console.log('🔄 Initializing Magnaci Casino database and cloud storage...');
  await db.waitForReady();
  console.log('✅ Database persistent storage ready!');

  if (process.env.NODE_ENV !== 'production') {
    // Vite middleware for development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎲 Magnaci Casino Server running on http://0.0.0.0:${PORT}`);
    console.log(`🍌 Default Admin: Sebastian | PIN: 707878`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
