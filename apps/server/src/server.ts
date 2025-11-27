import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { initDb } from './db';
import { connectRedis } from './redis';
import { AuctionService } from './services/auction.service';
import { AuctionScheduler } from './services/auction.scheduler';
import authRoutes from './routes/auth.routes';
import webhookRoutes from './routes/webhook.routes';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

import adminRoutes from './routes/admin.routes';
import inventoryRoutes from './routes/inventory.routes';

app.use('/auth', authRoutes);
app.use('/webhooks', webhookRoutes);
app.use('/admin', adminRoutes);
app.use('/inventory', inventoryRoutes);

app.get('/', (req, res) => {
    res.send('Instagram Economy Game Server is running!');
});

const startServer = async () => {
    console.log('Starting server initialization...');

    console.log('Initializing Database...');
    await initDb();
    console.log('Database initialized.');

    console.log('Connecting to Redis...');
    await connectRedis();
    console.log('Redis connected.');

    console.log('Initializing Auction Service...');
    AuctionService.init(io);
    AuctionScheduler.start();
    console.log('Auction Service initialized.');

    httpServer.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
