import { Router } from 'express';
import { changePassword, getCurrentUser, login } from '../controllers/authController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.get('/me', requireAdmin, getCurrentUser);
router.put('/change-password', requireAdmin, changePassword);

export default router;

