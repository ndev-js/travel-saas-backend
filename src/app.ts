import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { isDatabaseHealthy } from './lib/prisma';
import { config } from '@/config';

export const app = express();

// --- Core middleware ---
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.isDev ? 'dev' : 'combined'));

// --- Health check ---
// Split into liveness (is the process up) vs readiness (is the DB reachable)
// because orchestrators (Docker/K8s/load balancers) treat these differently:
// a failed liveness check restarts the pod, a failed readiness check just
// stops routing traffic to it without restarting.
app.get('/health/live', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/health/ready', async (_req: Request, res: Response) => {
  const dbHealthy = await isDatabaseHealthy();
  if (!dbHealthy) {
    return res.status(503).json({ status: 'error', database: 'unreachable' });
  }
  res.status(200).json({ status: 'ok', database: 'connected' });
});

// --- Routes will be mounted here as the app grows ---
// e.g. app.use('/api/v1/leads', leadsRouter);

// --- 404 handler ---
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// --- Centralized error handler ---
// Keeping this here, even minimal, matters early: without it, any thrown
// error in an async route handler crashes the process instead of returning
// a clean 500. As routes grow, this is where you'll map custom error classes
// (e.g. NotFoundError, ValidationError) to proper status codes.
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({
    error: config.isDev ? err.message : 'Internal server error',
  });
});
