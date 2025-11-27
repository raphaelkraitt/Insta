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
    await initDb();
    await connectRedis();
    AuctionService.init(io);
    AuctionScheduler.start();

    httpServer.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();
