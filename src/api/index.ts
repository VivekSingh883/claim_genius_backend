import express from 'express';
import { getHealthStatus } from './v1/controllers/health-controller';
import { requestHandler } from '../middlewares/request-handler';
import ticketRoutes from './v1/routes/ticket-routes';
import authRoutes from './v1/routes/auth-routes';
import { authMiddleware } from '../middlewares/auth-middleware';
import departmentRoutes from './v1/routes/department-routes';
import commonIssueRouter from './v1/routes/commonIssue-routes';
import profileRoutes from './v1/routes/user-routes';
import commentRoutes from './v1/routes/comment-routes';
import adminRoutes from './v1/routes/admin-routes';

const app = express();

app.use('/health', requestHandler(getHealthStatus));
app.use('/tickets', authMiddleware, ticketRoutes);
app.use('/auth', authRoutes);
app.use('/department', departmentRoutes);
app.use('/common-issues', commonIssueRouter);
app.use('/profile', authMiddleware, profileRoutes);
app.use('/comments', authMiddleware, commentRoutes);
app.use('/admin', authMiddleware, adminRoutes);

export default app;
