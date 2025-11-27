import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const resetUsers = async () => {
    try {
        console.log('🗑️  Resetting database users...');

        // Delete in order due to foreign key constraints
        await pool.query('DELETE FROM transactions');
        await pool.query('DELETE FROM bids');
        await pool.query('DELETE FROM listings');
        await pool.query('DELETE FROM user_items');
        await pool.query('DELETE FROM auctions');
        await pool.query('DELETE FROM users');

        console.log('✅ All users and related data have been deleted!');
        console.log('   You can now test user creation with fresh accounts.');
    } catch (err) {
        console.error('❌ Error resetting users:', err);
    } finally {
        await pool.end();
    }
};

resetUsers();
