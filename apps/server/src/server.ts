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
import adminRoutes from './routes/admin.routes';
import inventoryRoutes from './routes/inventory.routes';

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

// Readiness state
let isReady = false;

// Health check endpoint (always returns 200 if server is up)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: isReady ? 'ready' : 'initializing',
        timestamp: new Date().toISOString()
    });
});

// Middleware to reject requests until ready (except health check)
app.use((req, res, next) => {
    if (!isReady && req.path !== '/health') {
        return res.status(503).json({ error: 'Server is initializing, please try again shortly' });
    }
    next();
});

app.use('/auth', authRoutes);
app.use('/webhooks', webhookRoutes);
app.use('/admin', adminRoutes);
app.use('/inventory', inventoryRoutes);

app.get('/', (req, res) => {
    res.send(isReady ? 'Instagram Economy Game Server is running!' : 'Server is initializing...');
});

const startServer = async () => {
    // Start listening IMMEDIATELY to satisfy Railway's health check/port binding
    httpServer.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT} (Initialization pending...)`);
    });

    try {
        console.log('Starting background initialization...');

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

        isReady = true;
        console.log('✅ Server is fully ready and accepting requests!');
    } catch (err) {
        console.error('❌ Critical initialization error:', err);
        // We don't exit process here so logs can be read in Railway
    }
};

startServer();
