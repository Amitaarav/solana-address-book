import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import apiRoutes from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Trusted origins for CORS
const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL || '',
]);

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for local development Vite compatibility
    crossOriginEmbedderPolicy: false,
    xContentTypeOptions: true,
    xDnsPrefetchControl: { allow: false },
    xFrameOptions: { action: 'sameorigin' },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps or curl) or if origin is in allowlist
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Cross-Origin Request Blocked: Origin not authorized by CORS policy'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // 24 hours pre-flight caching
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

// Start Server
app.listen(PORT, () => {
  console.log(`Solana Address Book Server running on http://localhost:${PORT}`);
  console.log(`API endpoints accessible at http://localhost:${PORT}/api/contacts`);
});

