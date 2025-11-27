import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.log('Redis Client Error', err));

export const connectRedis = async () => {
    console.log(`Attempting to connect to Redis at: ${process.env.REDIS_URL?.split('@')[1] || 'localhost'}`);
    try {
        await client.connect();
        console.log('Connected to Redis');
    } catch (err) {
        console.error('Redis connection failed:', err);
        throw err;
    }
};

export default client;
