import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const resetDb = async () => {
    try {
        console.log('🗑️  Dropping all tables...');

        // Drop tables in order
        await pool.query('DROP TABLE IF EXISTS transactions CASCADE');
        await pool.query('DROP TABLE IF EXISTS bids CASCADE');
        await pool.query('DROP TABLE IF EXISTS auctions CASCADE');
        await pool.query('DROP TABLE IF EXISTS listings CASCADE');
        await pool.query('DROP TABLE IF EXISTS user_items CASCADE');
        await pool.query('DROP TABLE IF EXISTS items CASCADE');
        await pool.query('DROP TABLE IF EXISTS instagram_tokens CASCADE');
        await pool.query('DROP TABLE IF EXISTS users CASCADE');

        console.log('✅ Tables dropped.');

        // Delete credentials file
        const credentialsPath = path.join(__dirname, '../credentials.csv');
        if (fs.existsSync(credentialsPath)) {
            fs.unlinkSync(credentialsPath);
            console.log('🗑️  Deleted old credentials.csv');
        }

        console.log('🏗️  Re-initializing database schema...');
        const schemaPath = path.join(__dirname, '../src/db/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schemaSql);

        console.log('✅ Database reset and initialized with new schema!');
    } catch (err) {
        console.error('❌ Error resetting database:', err);
    } finally {
        await pool.end();
    }
};

resetDb();
