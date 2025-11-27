import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const initDb = async () => {
    try {
        console.log(`Attempting to connect to DB at: ${process.env.DATABASE_URL?.split('@')[1] || 'localhost'}`); // Log host only for security
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        console.log('Executing schema.sql...');
        await pool.query(schemaSql);
        console.log('Database initialized successfully');
    } catch (err) {
        console.error('Error initializing database:', err);
        throw err; // Re-throw so server knows it failed
    }
};

export default pool;
