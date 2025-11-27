import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import { User } from '@insta-game/shared';

import crypto from 'crypto';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const ENCRYPTION_KEY = process.env.PASSWORD_ENCRYPTION_KEY || 'default_secret_key_must_be_32_bytes_long'; // Must be 32 chars
const IV_LENGTH = 16;

export class UserService {
    private static encrypt(text: string): string {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }

    static decrypt(text: string): string {
        if (!text) return 'Not available';
        try {
            const textParts = text.split(':');
            const iv = Buffer.from(textParts.shift()!, 'hex');
            const encryptedText = Buffer.from(textParts.join(':'), 'hex');
            const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
            let decrypted = decipher.update(encryptedText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted.toString();
        } catch (e) {
            return 'Error decrypting';
        }
    }

    static async createAccount(username: string): Promise<{ user: User; passwordRaw: string }> {
        // Check if user exists
        const existing = await query('SELECT * FROM users WHERE username = $1', [username]);
        if (existing.rows.length > 0) {
            throw new Error('User already exists');
        }

        // Generate random password
        const passwordRaw = Math.random().toString(36).slice(-8);
        const passwordHash = await bcrypt.hash(passwordRaw, SALT_ROUNDS);
        const passwordEncrypted = this.encrypt(passwordRaw);

        // Insert user
        const result = await query(
            'INSERT INTO users (username, password_hash, password_encrypted, balance) VALUES ($1, $2, $3, $4) RETURNING id, username, balance',
            [username, passwordHash, passwordEncrypted, 0]
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
