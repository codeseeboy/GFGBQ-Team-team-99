import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import verificationRoute from './route/verification.route.js';

const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '1mb' }));

app.use('/api', verificationRoute);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Unexpected error' });
});

export default app;
