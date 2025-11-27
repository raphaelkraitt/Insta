import { Router } from 'express';
import { query } from '../db';
import { UserService } from '../services/user.service';

const router = Router();

// Middleware to get user from token (Mock for now or use real auth)
// In a real app, we'd extract userId from JWT
const getUserId = (req: any) => {
    // TODO: Extract from req.user
    // For now, we might need to pass userId in body for testing or use a fixed one
    return req.body.userId || 1;
};

// Get Inventory
router.get('/', async (req, res) => {
    try {
        const userId = req.query.userId || 1; // Hack for testing
        const result = await query(
            `SELECT ui.*, i.name, i.image_url, i.category, i.slot_type 
             FROM user_items ui 
             JOIN items i ON ui.item_id = i.id 
             WHERE ui.user_id = $1`,
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

// Equip Item
router.post('/equip', async (req, res) => {
    try {
        const { userItemId, location, slotId } = req.body;
        const userId = getUserId(req);

        // Check if item belongs to user
        const itemCheck = await query('SELECT * FROM user_items WHERE id = $1 AND user_id = $2', [userItemId, userId]);
        if (itemCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        // Check if slot is occupied?
        // Optional: Unequip existing item in that slot
        await query(
            'UPDATE user_items SET is_equipped = FALSE WHERE user_id = $1 AND location = $2 AND slot_id = $3',
            [userId, location, slotId]
        );

        // Equip new item
        await query(
            'UPDATE user_items SET is_equipped = TRUE, location = $1, slot_id = $2 WHERE id = $3',
            [location, slotId, userItemId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to equip item' });
    }
});

// Unequip Item
router.post('/unequip', async (req, res) => {
    try {
        const { userItemId } = req.body;
        const userId = getUserId(req);

        await query(
            'UPDATE user_items SET is_equipped = FALSE, location = NULL, slot_id = NULL WHERE id = $1 AND user_id = $2',
            [userItemId, userId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to unequip item' });
    }
});

export default router;
