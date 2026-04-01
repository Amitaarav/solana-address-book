import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRoutes from './routes/api';

const app = express();
const PORT = 3000;

// Security Middlewares
app.use(helmet());
app.use(cors());

// Request Parsing
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Solana Address Book API is running on http://localhost:${PORT}`);
});
