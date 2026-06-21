import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import paymentHandler from './api/payment.js';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 5000;

app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    next();
});

// Wrapper to handle Vercel-style handlers in Express
const vercelWrapper = (handler) => async (req, res) => {
    try {
        await handler(req, res);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

import imagekitAuthHandler from './api/imagekit-auth.js';
import sendInvoiceHandler from './api/send-invoice.js';
import sitemapHandler from './api/sitemap.js';

app.post('/api/payment', vercelWrapper(paymentHandler));
app.get('/api/imagekit-auth', vercelWrapper(imagekitAuthHandler));
app.post('/api/send-invoice', vercelWrapper(sendInvoiceHandler));
app.get('/api/sitemap', vercelWrapper(sitemapHandler));
app.listen(PORT, () => {
    console.log(`API Server running on http://localhost:${PORT}`);
});
