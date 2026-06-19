import './config/env';
import app from './app';
import connectDB from './config/database';
import { env } from './config/env';
import { User } from './models/User';

const bootstrapAdmin = async (): Promise<void> => {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) return;

  const existingAdmin = await User.findOne({ role: 'super_admin' });
  if (existingAdmin) return;

  await User.create({
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
    firstName: env.ADMIN_FIRST_NAME,
    lastName: env.ADMIN_LAST_NAME,
    role: 'super_admin',
    isActive: true,
    isEmailVerified: true,
  });

  console.log(`Super admin created: ${env.ADMIN_EMAIL}`);
};

const start = async (): Promise<void> => {
  try {
    await connectDB();
    await bootstrapAdmin();

    const server = app.listen(env.PORT, () => {
      console.log(`\n🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      console.log(`   Health: http://localhost:${env.PORT}/api/health\n`);
    });

    const shutdown = (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (err: Error) => {
      console.error('Unhandled Promise Rejection:', err.message);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
