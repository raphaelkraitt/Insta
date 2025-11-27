import { Router } from 'express';
import { query } from '../db';
import { AuctionService } from '../services/auction.service';

const router = Router();

// Middleware to check admin status (TODO: Implement real auth)
const adminCheck = (req: any, res: any, next: any) => {
    // For now, just allow all or check a header
    // if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) return res.sendStatus(403);
    next();
};

router.use(adminCheck);

// Helper for users accessing the API directly
router.get('/', (req, res) => {
    res.send('Admin API is running. Access the dashboard at <a href="http://localhost:5173/admin">http://localhost:5173/admin</a>');
});

// Create new item
router.post('/items', async (req, res) => {
    try {
        const { name, description, image_url, rarity, base_price, category, slot_type } = req.body;

        const result = await query(
            `INSERT INTO items (name, description, image_url, rarity, base_price, category, slot_type)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [name, description, image_url, rarity, base_price, category, slot_type]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create item' });
    }
});

// Start auction
router.post('/auctions', async (req, res) => {
    try {
        const { itemId, durationMinutes, startingPrice } = req.body;

        const auctionId = await AuctionService.createAuction(itemId, durationMinutes, startingPrice);

        res.json({ success: true, auctionId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to start auction' });
    }
});

// End auction manually
router.post('/auctions/:id/end', async (req, res) => {
    try {
        const auctionId = parseInt(req.params.id);
        await AuctionService.resolveAuction(auctionId);
        res.json({ success: true, message: 'Auction ended manually' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to end auction' });
    }
});

// Get all items with active auction info
router.get('/items', async (req, res) => {
    try {
        const result = await query(`
            SELECT i.*, a.id as active_auction_id 
            FROM items i 
            LEFT JOIN auctions a ON i.id = a.item_id AND a.status = 'active' 
            ORDER BY i.id DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});

export default router;
