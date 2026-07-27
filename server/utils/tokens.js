import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import RefreshToken from '../models/RefreshToken.js';

// 🌟 Explicit Named Export
export const generateAndSendTokens = async (user, res) => {
  const jti = uuidv4();

  const tokenPayload = { 
    jti,
    userId: user._id, 
    email: user.email, 
    username: user.name,
    roles: user.roles
  };

  const refreshToken = jwt.sign(
    tokenPayload,
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  const accessToken = jwt.sign(
    tokenPayload,
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  await RefreshToken.create({
    jti,
    userId: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", 
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  return accessToken;
};