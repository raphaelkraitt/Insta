import { query } from '../db';

export class EconomyService {
    static async getBalance(userId: number): Promise<number> {
        const res = await query('SELECT balance FROM users WHERE id = $1', [userId]);
        return res.rows[0]?.balance || 0;
    }

    static async addBalance(userId: number, amount: number, type: string): Promise<void> {
        await query('BEGIN');
        try {
            await query('UPDATE users SET balance = balance + $1 WHERE id = $2', [amount, userId]);
            await query(
                'INSERT INTO transactions (to_user_id, amount, type) VALUES ($1, $2, $3)',
                [userId, amount, type]
            );
            await query('COMMIT');
        } catch (e) {
            await query('ROLLBACK');
            throw e;
        }
    }

    static async deductBalance(userId: number, amount: number, type: string): Promise<void> {
        await query('BEGIN');
        try {
            const res = await query('SELECT balance FROM users WHERE id = $1 FOR UPDATE', [userId]);
            const balance = res.rows[0]?.balance || 0;

            if (balance < amount) {
                throw new Error('Insufficient funds');
            }

            await query('UPDATE users SET balance = balance - $1 WHERE id = $2', [amount, userId]);
            await query(
                'INSERT INTO transactions (from_user_id, amount, type) VALUES ($1, $2, $3)',
                [userId, amount, type]
            );
            await query('COMMIT');
        } catch (e) {
            await query('ROLLBACK');
            throw e;
        }
    }

    static async transfer(fromId: number, toId: number, amount: number, type: string): Promise<void> {
        await query('BEGIN');
        try {
            const res = await query('SELECT balance FROM users WHERE id = $1 FOR UPDATE', [fromId]);
            const balance = res.rows[0]?.balance || 0;

            if (balance < amount) {
                throw new Error('Insufficient funds');
            }

            await query('UPDATE users SET balance = balance - $1 WHERE id = $2', [amount, fromId]);
            await query('UPDATE users SET balance = balance + $1 WHERE id = $2', [amount, toId]);

            await query(
                'INSERT INTO transactions (from_user_id, to_user_id, amount, type) VALUES ($1, $2, $3, $4)',
                [fromId, toId, amount, type]
            );
            await query('COMMIT');
        } catch (e) {
            await query('ROLLBACK');
            throw e;
        }
    }

    static async earn(userId: number): Promise<{ success: boolean; message: string; amount?: number; streak?: number }> {
        await query('BEGIN');
        try {
            const res = await query('SELECT last_earn_date, streak FROM users WHERE id = $1 FOR UPDATE', [userId]);
            const user = res.rows[0];

            const now = new Date();
            const lastEarn = user.last_earn_date ? new Date(user.last_earn_date) : null;

            // Check if already earned today
            if (lastEarn && lastEarn.toDateString() === now.toDateString()) {
                await query('ROLLBACK');
                return { success: false, message: 'You have already earned your daily reward today!' };
            }

            let streak = user.streak || 0;

            // Check if streak continues (yesterday)
            if (lastEarn) {
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                if (lastEarn.toDateString() === yesterday.toDateString()) {
                    streak++;
                } else {
                    streak = 1; // Reset streak
                }
            } else {
                streak = 1; // First time
            }

            const baseAmount = 100;
            const bonus = streak * 10;
            const totalAmount = baseAmount + bonus;

            await query('UPDATE users SET balance = balance + $1, last_earn_date = $2, streak = $3 WHERE id = $4', [totalAmount, now, streak, userId]);

            await query(
                'INSERT INTO transactions (to_user_id, amount, type) VALUES ($1, $2, $3)',
                [userId, totalAmount, 'daily_earn']
            );

            await query('COMMIT');
            return { success: true, message: `Earned $${totalAmount} (Streak: ${streak} days)`, amount: totalAmount, streak };
        } catch (e) {
            await query('ROLLBACK');
            throw e;
        }
    }
}
