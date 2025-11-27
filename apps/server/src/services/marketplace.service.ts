import { query } from '../db';
import { EconomyService } from './economy.service';

export class MarketplaceService {
    static async createListing(userId: number, itemId: number, price: number): Promise<void> {
        // Verify ownership
        const ownership = await query(
            'SELECT id FROM user_items WHERE user_id = $1 AND item_id = $2',
            [userId, itemId]
        );

        if (ownership.rows.length === 0) {
            throw new Error('User does not own this item');
        }

        // Create listing
        await query(
            'INSERT INTO listings (seller_id, item_id, price) VALUES ($1, $2, $3)',
            [userId, itemId, price]
        );
    }

    static async buyListing(buyerId: number, listingId: number): Promise<void> {
        await query('BEGIN');
        try {
            const listingRes = await query(
                'SELECT * FROM listings WHERE id = $1 AND status = \'active\' FOR UPDATE',
                [listingId]
            );

            if (listingRes.rows.length === 0) {
                throw new Error('Listing not found or not active');
            }

            const listing = listingRes.rows[0];

            if (listing.seller_id === buyerId) {
                throw new Error('Cannot buy your own item');
            }

            // Process payment
            await EconomyService.transfer(buyerId, listing.seller_id, listing.price, 'buy_item');

            // Transfer item
            // Remove from seller (or just update owner? schema has user_items table)
            // We need to update the user_id in user_items? No, user_items links user and item.
            // If items are unique instances, we update user_items.
            // If items are types, we delete from seller and add to buyer.
            // Assuming unique instances for now based on "User Inventory" schema having `id` as PK.
            // Wait, `user_items` has `id` PK, `user_id`, `item_id`.
            // If `item_id` refers to `items` table (types), then we need to find the specific `user_items` row.
            // But `listings` has `item_id`. Is that the `items` ID or `user_items` ID?
            // Schema says `item_id INTEGER REFERENCES items(id)`. This is the item TYPE.
            // So we need to find ONE instance of that item owned by the seller.

            const userItemRes = await query(
                'SELECT id FROM user_items WHERE user_id = $1 AND item_id = $2 LIMIT 1 FOR UPDATE',
                [listing.seller_id, listing.item_id]
            );

            if (userItemRes.rows.length === 0) {
                throw new Error('Seller no longer has the item');
            }

            const userItemId = userItemRes.rows[0].id;

            await query('UPDATE user_items SET user_id = $1 WHERE id = $2', [buyerId, userItemId]);

            // Update listing status
            await query('UPDATE listings SET status = \'sold\' WHERE id = $1', [listingId]);

            await query('COMMIT');
        } catch (e) {
            await query('ROLLBACK');
            throw e;
        }
    }
}
