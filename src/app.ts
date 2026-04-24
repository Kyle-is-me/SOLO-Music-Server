import express from 'express';
import cors from 'cors';
import { logger } from './middlewares/logger';
import { errorHandler } from './middlewares/errorHandler';
import v1Router from './routes/index';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logger);

app.use('/api/v1', v1Router);

app.use((_req, res) => {
  res.status(404).json({ code: 404, data: null, message: 'Not Found' });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`SoloMusic Server is running on http://localhost:${port}`);
});

export default app;
