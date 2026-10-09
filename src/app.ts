import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { isDatabaseHealthy } from './lib/prisma';
import { config } from '@/config';
import { notFoundHandler } from '@/middlewares/not-found';
import { errorHandler } from '@/middlewares/error-handler';
import { platformAuthRouter } from '@/modules/platform/auth/auth.routes';
import { tenantRoutes } from '@/modules/platform/tenants/tenants.routes';
import { tenantUserRoutes } from './modules/platform/users/users.routes';
import { leadRoutes } from '@/modules/leads/leads.routes';

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

// --- Routes ---
app.use('/api/v1/platform/auth', platformAuthRouter);
app.use('/api/v1', tenantRoutes);
app.use('/api/v1', tenantUserRoutes);
app.use('/api/v1', leadRoutes);

// --- 404 handler ---
// Must come after all routes: anything unmatched falls through to here.
app.use(notFoundHandler);

// --- Centralized error handler ---
// Must be the last app.use(). Express 5 forwards rejected promises from
// async handlers here automatically. Maps AppError/Zod/Prisma/JWT errors
// (and anything else) to the same { success, error: { code, message } }
// envelope used across the API.
app.use(errorHandler);
