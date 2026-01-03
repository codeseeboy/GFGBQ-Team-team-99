import dotenv from 'dotenv';
import app from './app.js';
import { connectToDatabase } from './config/db.js';

dotenv.config();

const port = process.env.PORT || 4000;

const start = async () => {
  await connectToDatabase();
  app.listen(port, () => {
    console.log(`API running on :${port}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
