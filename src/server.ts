import { app } from './app';
import { config } from '@/config';
import { connectDB, disconnectDB } from '@/lib/prisma';

async function main() {
  await connectDB();

  const server = app.listen(config.PORT, () => {
    console.log(`Server listening on port ${config.PORT}`);
  });

  const shutdown = async () => {
    server.close();
    await disconnectDB();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
