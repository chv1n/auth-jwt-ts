import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import authRoutes from './routes/auth';

const app = express();
app.use(cookieParser());
app.use(cors());
app.use(express.json());

app.get('/healthz', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRoutes);

export default app;
