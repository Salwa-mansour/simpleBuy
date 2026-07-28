import dotenv from 'dotenv';
dotenv.config(); 

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import dns from 'node:dns/promises';
dns.setServers(['1.1.1.1', '8.8.8.8']);

import passport from 'passport';

import connectDB from './config/dbConnection.js';
import authRouter from './routes/authRouter.js';
import categoryRouter from './routes/categoryRouter.js';
import productRouter from './routes/productRouter.js';
import orderRouter from "./routes/orderRouter.js";
import userRouter from "./routes/userRouter.js";
import paymentRouter from "./routes/paymentRouter.js";
import './config/passport.js';

const app = express();

// Initialize DB connection
connectDB();

// CORS configuration
const allowedOrigins = ['http://localhost:5173'];
const corsOptions = {
  origin: allowedOrigins, 
  credentials: true,                
  optionsSuccessStatus: 200         
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());

// --- ROUTES ---
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the API server!" });
});

app.use("/auth", authRouter);
app.use("/category",categoryRouter);
app.use("/product",productRouter);
app.use("/order",orderRouter);
app.use("/user",userRouter);
app.use("/payment",paymentRouter);

// --- 1. 404 CATCH-ALL HANDLER (Must be after defined routes) ---
app.use('/{*splat}', (req, res) => {
  res.status(404).json({ message: `Path ${req.originalUrl} not found` });
});

// --- 2. GLOBAL ERROR MIDDLEWARE (Must be dead last!) ---
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  console.error(`💥 Error [${statusCode}]: ${err.message}`);

  res.status(statusCode).json({
    status: 'error',
    error: err.message || 'Internal Server Error'
  });
});

// --- SERVER STARTUP ---
const PORT = process.env.PORT || 3000;

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB!');
  app.listen(PORT, () => {
    console.log(`🚀 Express app listening on port ${PORT}!`);
  });
});