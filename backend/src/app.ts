import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler, notFound } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import researchRoutes from './routes/research';
import eventRoutes from './routes/events';
import applicationRoutes from './routes/applications';
import announcementRoutes from './routes/announcements';
import contactRoutes from './routes/contact';
import partnershipRoutes from './routes/partnerships';

const app = express();

app.set('trust proxy', 1);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: env.isProd,
  })
);

app.use(compression());

if (env.isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many contact submissions, please try again later.' },
});

app.use('/api', globalLimiter);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'The Invisible Algorithm API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/contact', contactLimiter, contactRoutes);
app.use('/api/partnerships', partnershipRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
