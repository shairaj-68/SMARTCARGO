import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db';
import { initializeSocket } from './socket/index';

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'].filter(Boolean) as string[];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 200 : 1000,
  message: 'Too many requests from this IP, please try again later.',
  skip: () => process.env.NODE_ENV !== 'production',
});
app.use('/api', limiter);

connectDB();
initializeSocket(io);

app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import containerRoutes from './routes/container.routes';
import bookingRoutes from './routes/booking.routes';
import paymentRoutes from './routes/payment.routes';
import messageRoutes from './routes/message.routes';
import notificationRoutes from './routes/notification.routes';
import documentRoutes from './routes/document.routes';
import reviewRoutes from './routes/review.routes';
import disputeRoutes from './routes/dispute.routes';
import adminRoutes from './routes/admin.routes';
import analyticsRoutes from './routes/analytics.routes';
import customerRoutes from './routes/customer.routes';
import logisticsRoutes from './routes/logistics.routes';
import aiRoutes from './routes/ai.routes';
import mlRoutes from './routes/ml.routes';
import assistantRoutes from './routes/assistant.routes';
import insightsRoutes from './routes/insights.routes';
import optimizerRoutes from './routes/optimizer.routes';
import complianceRoutes from './routes/compliance.routes';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/containers', containerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', messageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/optimizer', optimizerRoutes);
app.use('/api/compliance', complianceRoutes);

import { errorHandler, notFound } from './middleware/errorHandler';
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
