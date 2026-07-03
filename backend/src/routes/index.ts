import { Router } from 'express';
import authRoutes from './authRoutes';
import accountRoutes from './accountRoutes';
import categoryRoutes from './categoryRoutes';
import transactionRoutes from './transactionRoutes';
import goalRoutes from './goalRoutes';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use('/auth', authRoutes);
router.use('/accounts', authMiddleware, accountRoutes);
router.use('/categories', authMiddleware, categoryRoutes);
router.use('/transactions', authMiddleware, transactionRoutes);
router.use('/goals', authMiddleware, goalRoutes);

export default router;
