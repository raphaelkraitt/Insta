import cron from 'node-cron';
import { query } from '../db';
import { AuctionService } from './auction.service';

export class AuctionScheduler {
    static start() {
        // Run every minute to check for expired auctions
        cron.schedule('* * * * *', async () => {
            try {
                const result = await query(
                    `SELECT id FROM auctions 
                     WHERE status = 'active' 
                     AND end_time <= NOW()`
                );

                for (const row of result.rows) {
                    console.log(`Auto-resolving auction ${row.id}`);
                    await AuctionService.resolveAuction(row.id);
                }
            } catch (error) {
                console.error('Error in auction scheduler:', error);
            }
        });

        console.log('✅ Auction scheduler started (runs every minute)');
    }
}
