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

    try {
        const result = await CommandProcessor.process(username, text, auctionId);
        console.log('Command processed result:', result);
        res.json(result);
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Internal Server Error processing command' });
    }
});

export default router;
