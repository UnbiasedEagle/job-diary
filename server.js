import express from 'express';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';

const app = express();
import 'express-async-errors';

import dotenv from 'dotenv';
dotenv.config();
const port = process.env.PORT || 5000;

import connectDB from './db/connect.js';
import morgan from 'morgan';

import authRouter from './routes/authRoutes.js';
import jobsRouter from './routes/jobsRouter.js';

import notFoundMiddleware from './middlewares/not-found.js';
import errorHandlerMiddleware from './middlewares/error-handler.js';
import authenticateUser from './middlewares/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.resolve(__dirname, './client/build')));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(xss());
app.use(helmet());
app.use(mongoSanitize());
app.use(cookieParser());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobsRouter);

app.use('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './client/build', 'index.html'));
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);

    app.listen(port, () =>
      console.log(`Server is listening on http://localhost:${port}`)
    );
  } catch (error) {
    console.log(error);
  }
};
start();
