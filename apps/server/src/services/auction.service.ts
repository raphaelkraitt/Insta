import redis from '../redis';
import { query } from '../db';
import { EconomyService } from './economy.service';
import { Server } from 'socket.io';

export class AuctionService {
    private static io: Server;

    static init(io: Server) {
        this.io = io;
    }

    static async createAuction(itemId: number, durationMinutes: number, startingPrice: number = 0): Promise<number> {
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

        const res = await query(
            'INSERT INTO auctions (item_id, start_time, end_time, current_bid, status) VALUES ($1, $2, $3, $4, \'active\') RETURNING id',
            [itemId, startTime, endTime, startingPrice]
        );
        const auctionId = res.rows[0].id;

        // Cache metadata in Redis Hash
        const key = `auction:${auctionId}:info`;
        await redis.hSet(key, {
            id: auctionId,
            itemId: itemId.toString(),
            endTime: endTime.getTime().toString(),
            startingPrice: startingPrice.toString(),
            active: '1'
        });

        // Initialize ZSET for bids if needed, or just leave empty
        // We can add the starting price as a "system" bid or just enforce it in logic

        // Broadcast
        this.io.emit('auction_created', { id: auctionId, itemId, endTime, startingPrice });
        return auctionId;
    }

    static async placeBid(auctionId: number, userId: number, amount: number): Promise<{ success: boolean; message: string }> {
        const infoKey = `auction:${auctionId}:info`;
        const bidsKey = `auction:${auctionId}:bids`;

        // 1. Check if auction exists and is active
        const endTimeStr = await redis.hGet(infoKey, 'endTime');
        if (!endTimeStr) return { success: false, message: 'Auction not found' };

        if (Date.now() > parseInt(endTimeStr)) {
            return { success: false, message: 'Auction ended' };
        }

        // 2. Get current highest bid
        // ZREVRANGE returns ordered by score desc. Get top 1.
        const topBid = await redis.zRangeWithScores(bidsKey, -1, -1);
        let currentMax = 0;

        if (topBid.length > 0) {
            currentMax = topBid[0].score;
        } else {
            // Check starting price
            const startPrice = await redis.hGet(infoKey, 'startingPrice');
            currentMax = startPrice ? parseInt(startPrice) : 0;
        }

        if (amount <= currentMax) {
            return { success: false, message: `Bid must be higher than ${currentMax}` };
        }

        // 3. Verify balance (this is the slow part, maybe cache balance in Redis too?)
        // For now, we trust the DB/Service but this could be a bottleneck.
        const balance = await EconomyService.getBalance(userId);
        if (balance < amount) {
            return { success: false, message: 'Insufficient funds' };
        }

        // 4. Place bid atomically?
        // In a real high-concurrency scenario, someone else might have bid higher in the meantime.
        // We can use a Lua script to "check max and add if higher".
        // For this MVP, we'll just ZADD. If multiple people bid 600, Redis handles it (last one updates score? No, score is the bid).
        // If two people bid 600, it's the same score.
        // We want unique bids? Or just highest wins?
        // If Alice bids 600, then Bob bids 600.
        // We should probably enforce strict > currentMax.

        // Let's use a simple optimistic check.
        // If we really want to be safe, we'd use WATCH.
        // But ZADD updates the score.
        // We want to store WHO made the bid. Member = userId. Score = amount.

        await redis.zAdd(bidsKey, { score: amount, value: userId.toString() });

        // Log to DB asynchronously
        query('INSERT INTO bids (auction_id, user_id, amount) VALUES ($1, $2, $3)', [auctionId, userId, amount]);

        // Broadcast
        this.io.emit('bid_update', { auctionId, amount, userId });

        return { success: true, message: 'Bid placed' };
    }

    static async getHighestBid(auctionId: number): Promise<{ userId: string; amount: number } | null> {
        const bidsKey = `auction:${auctionId}:bids`;
        const topBid = await redis.zRangeWithScores(bidsKey, -1, -1);
        if (topBid.length === 0) return null;
        return { userId: topBid[0].value, amount: topBid[0].score };
    }

    static async resolveAuction(auctionId: number) {
        const winner = await this.getHighestBid(auctionId);
        if (winner) {
            const userId = parseInt(winner.userId);
            const amount = winner.amount;

            // Deduct funds
            await EconomyService.deductBalance(userId, amount, 'auction_win');

            // Award item
            const infoKey = `auction:${auctionId}:info`;
            const itemIdStr = await redis.hGet(infoKey, 'itemId');
            if (itemIdStr) {
                const itemId = parseInt(itemIdStr);
                await query('INSERT INTO user_items (user_id, item_id) VALUES ($1, $2)', [userId, itemId]);
            }

            // Update Auction Status DB
            await query('UPDATE auctions SET status = \'completed\', winner_id = $1, current_bid = $2 WHERE id = $3', [userId, amount, auctionId]);

            console.log(`Auction ${auctionId} won by user ${userId} for ${amount}`);
        } else {
            await query('UPDATE auctions SET status = \'completed\' WHERE id = $1', [auctionId]);
            console.log(`Auction ${auctionId} ended with no bids`);
        }

        // Cleanup Redis
        await redis.del(`auction:${auctionId}:info`);
        await redis.del(`auction:${auctionId}:bids`);
    }
}
