import { Router } from 'express';
import { register, login, me } from '../controllers/auth.controller';
import middlewareAuth from '../middleware/middlewareAuth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', middlewareAuth, me);

export default router;
