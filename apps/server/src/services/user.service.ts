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

    static async createAccount(username: string): Promise<User> {
        // Check if user exists
        const existing = await query('SELECT * FROM users WHERE username = $1', [username]);
        if (existing.rows.length > 0) {
            throw new Error('User already exists');
        }

        // Insert user with NULL password
        const result = await query(
            'INSERT INTO users (username, balance) VALUES ($1, $2) RETURNING id, username, balance',
            [username, 0]
        );

        return result.rows[0];
    }

    static async checkUserStatus(username: string): Promise<{ exists: boolean; hasPassword: boolean }> {
        const result = await query('SELECT password_hash FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return { exists: false, hasPassword: false };
        }
        return { exists: true, hasPassword: !!result.rows[0].password_hash };
    }

    static async setPassword(username: string, password: string): Promise<void> {
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const passwordEncrypted = this.encrypt(password);
        await query(
            'UPDATE users SET password_hash = $1, password_encrypted = $2 WHERE username = $3',
            [passwordHash, passwordEncrypted, username]
        );
    }

    static async validateCredentials(username: string, password: string): Promise<User | null> {
        const result = await query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) return null;

        const user = result.rows[0];

        // If user has no password, they cannot login this way (must set password first)
        if (!user.password_hash) return null;

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
