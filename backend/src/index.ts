import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import apiRoutes from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Trusted frontend origins
const allowedOrigins = new Set([
  'https://solana-address-book.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

// Add origins configured through Render environment variables
const configuredOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

configuredOrigins.forEach((origin) => allowedOrigins.add(origin));

// CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header (e.g. server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/+$/, '');

      if (allowedOrigins.has(normalizedOrigin)) {
        return callback(null, true);
      }

      console.warn(`[CORS] Blocked origin: ${origin}`);
      return callback(null, false);
    },

    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    allowedHeaders: ['Content-Type', 'Authorization'],

    maxAge: 86400,
  })
);

// Request Parsing with strict 16KB payload limit to prevent buffer exhaustion
app.use(express.json({ limit: '16kb' }));

// API Routes
app.use('/api', apiRoutes);

// Serve Frontend (checks frontend/dist first, or frontend/ directly)
const frontendDist = path.resolve(process.cwd(), '../frontend/dist');
const frontendStatic = path.resolve(process.cwd(), '../frontend');
const rootPublic = path.resolve(process.cwd(), 'public');

app.use(express.static(frontendDist));
app.use(express.static(frontendStatic));
app.use(express.static(rootPublic));

// Fallback for SPA routing without path-to-regexp wildcards (Express 5 compatible)
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api')) {
    return next();
  }

  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (!err) return;
    res.sendFile(path.join(frontendStatic, 'index.html'), (err2) => {
      if (!err2) return;
      res.sendFile(path.join(rootPublic, 'index.html'), (err3) => {
        if (!err3) return;
        next();
      });
    });
  });
});

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start Server (only when executed directly, not when invoked as a serverless function)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Solana Address Book Server running on http://localhost:${PORT}`);
    console.log(`API endpoints accessible at http://localhost:${PORT}/api/contacts`);
  });
}

export default app;
export { app };

