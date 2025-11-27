import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import { User } from '@insta-game/shared';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export class UserService {
    static async createAccount(username: string): Promise<{ user: User; passwordRaw: string }> {
        // Check if user exists
        const existing = await query('SELECT * FROM users WHERE username = $1', [username]);
        if (existing.rows.length > 0) {
            throw new Error('User already exists');
        }

        // Generate random password
        const passwordRaw = Math.random().toString(36).slice(-8);
        const passwordHash = await bcrypt.hash(passwordRaw, SALT_ROUNDS);

        // Insert user
        const result = await query(
            'INSERT INTO users (username, password_hash, balance) VALUES ($1, $2, $3) RETURNING id, username, balance',
            [username, passwordHash, 0]
        );

        const user = result.rows[0];
        return { user, passwordRaw };
    }

    static async validateCredentials(username: string, password: string): Promise<User | null> {
        const result = await query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) return null;

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) return null;

        return { id: user.id, username: user.username, balance: user.balance };
    }

    static generateToken(user: User): string {
        return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    }

    static async getUser(id: string): Promise<User | null> {
        const result = await query('SELECT id, username, balance FROM users WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
}
