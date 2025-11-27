import { UserService } from './user.service';
import { AuctionService } from './auction.service';
import { EconomyService } from './economy.service';
import { query } from '../db';

export interface CommandResult {
    success: boolean;
    message: string;
}

export class CommandProcessor {
    static async process(username: string, text: string, auctionId?: number): Promise<CommandResult> {
        const parts = text.trim().toLowerCase().split(/\s+/);
        const command = parts[0];
        const args = parts.slice(1);

        let newUserMessage = '';
        // Ensure user exists - create if doesn't exist
        try {
            await UserService.createAccount(username);
            console.log(`✅ Created new user: ${username} (No password set yet)`);
            newUserMessage = ' (Welcome! Go to the website to set your password.)';
        } catch (e: any) {
            // Only ignore if user already exists, otherwise log the error
            if (e.message === 'User already exists') {
                console.log(`ℹ️  User ${username} already exists, continuing...`);
            } else {
                console.error(`❌ Failed to create user ${username}:`, e);
                // Continue anyway - maybe user was created in a previous request
            }
        }

        const result = await this.dispatch(command, username, args, auctionId);
        if (newUserMessage) {
            result.message += newUserMessage;
        }
        return result;
    }

    private static async dispatch(command: string, username: string, args: string[], auctionId?: number): Promise<CommandResult> {
        switch (command) {
            case 'bid':
                return this.handleBid(username, args, auctionId);
            case 'buy':
                return this.handleBuy(username, args);
            case 'sell':
                return this.handleSell(username, args);
            case 'balance':
                return this.handleBalance(username);
            case 'earn':
                return this.handleEarn(username);
            case 'help':
                return this.handleHelp();
            default:
                return { success: false, message: 'Unknown command. Type "help" for commands.' };
        }
    }

    private static async handleBid(username: string, args: string[], auctionId?: number): Promise<CommandResult> {
        const amount = parseInt(args[0]);
        if (isNaN(amount)) return { success: false, message: 'Invalid bid amount' };

        if (!auctionId) {
            return { success: false, message: 'No auction specified. Please comment on a specific auction post.' };
        }

        try {
            const userRes = await query('SELECT id FROM users WHERE username = $1', [username]);
            if (userRes.rows.length === 0) return { success: false, message: 'User not found' };
            const userId = userRes.rows[0].id;

            const result = await AuctionService.placeBid(auctionId, userId, amount);
            return result;
        } catch (e: any) {
            return { success: false, message: e.message || 'Bid failed' };
        }
    }

    private static async handleBuy(username: string, args: string[]): Promise<CommandResult> {
        return { success: false, message: 'Buy command not implemented yet.' };
    }

    private static async handleSell(username: string, args: string[]): Promise<CommandResult> {
        return { success: false, message: 'Sell command not implemented yet.' };
    }

    private static async handleBalance(username: string): Promise<CommandResult> {
        try {
            const userRes = await query('SELECT id, balance FROM users WHERE username = $1', [username]);
            if (userRes.rows.length === 0) return { success: false, message: 'User not found' };
            const balance = userRes.rows[0].balance;
            return { success: true, message: `Balance for @${username}: $${balance}` };
        } catch (e) {
            return { success: false, message: 'Failed to fetch balance' };
        }
    }

    private static async handleEarn(username: string): Promise<CommandResult> {
        try {
            const userRes = await query('SELECT id FROM users WHERE username = $1', [username]);
            if (userRes.rows.length === 0) return { success: false, message: 'User not found' };
            const userId = userRes.rows[0].id;

            const result = await EconomyService.earn(userId);
            return { success: result.success, message: result.message };
        } catch (e) {
            console.error(e);
            return { success: false, message: 'Failed to process earn command' };
        }
    }

    private static async handleHelp(): Promise<CommandResult> {
        return {
            success: true,
            message: 'Commands: bid <amount>, balance, earn, help. (Buy/Sell coming soon)'
        };
    }
}
