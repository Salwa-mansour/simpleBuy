// routes/webhookRoutes.js
import express from 'express';
import { handleShippoWebhook } from '../controllers/webhookController.js';

const router = express.Router();

// Middleware to retain raw body string for crypto verification
const captureRawBody = express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
});

// Endpoint exposed to Shippo
router.post('/shippo', captureRawBody, handleShippoWebhook);

export default router;