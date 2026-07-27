import { v2 as cloudinary } from 'cloudinary';
import catchAsync from '../utils/catchAsyncError.js';

// Configure Cloudinary once
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const generateUploadSignture = catchAsync(async (req, res, next) => {
  const timestamp = Math.round(new Date().getTime() / 1000);

  // Exact parameters that MUST match what React sends in FormData
  const paramsToSign = {
    folder: 'simleBuy',
    timestamp: timestamp,
    transformation: 'w_400,c_limit',
  };

  // Generate signature using Cloudinary SDK
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  res.status(200).json({
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
});