import { Router } from 'express';
import { CommandProcessor } from '../services/command.processor';

const router = Router();

// Simulate Instagram Webhook
router.post('/instagram', async (req, res) => {
    const { username, text, auctionId } = req.body;

    if (!username || !text) {
        return res.status(400).json({ error: 'Missing username or text' });
    }

    console.log(`Received comment from ${username}: ${text} (Auction: ${auctionId || 'None'})`);

    const result = await CommandProcessor.process(username, text, auctionId);

    res.json(result);
});

export default router;
