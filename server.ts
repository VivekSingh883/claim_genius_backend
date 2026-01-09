import express from 'express';
import { errorHandler } from './src/middlewares/error-handler';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import http from 'http';
import { setupPassport } from './src/utils/passport';
import apiRoutes from './src/api/index';

const app = express();

app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'https://myfrontend.com',
    'http://localhost:5173',
  ];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(cookieParser());

app.use(express.json());
app.use(errorHandler);
setupPassport(); // loads Google strategy etc.
app.use(passport.initialize());

const httpServer = http.createServer(app);

app.use('/api/v1', apiRoutes);

export { app, httpServer };
