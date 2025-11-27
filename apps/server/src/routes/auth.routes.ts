import { Router } from 'express';
import { UserService } from '../services/user.service';

const router = Router();

router.post('/check-status', async (req, res) => {
    try {
        const { username } = req.body;
        const status = await UserService.checkUserStatus(username);
        res.json(status);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/set-password', async (req, res) => {
    try {
        const { username, password } = req.body;
        await UserService.setPassword(username, password);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await UserService.validateCredentials(username, password);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = UserService.generateToken(user);
        res.json({ token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/me', async (req, res) => {
    // TODO: Implement auth middleware to get user ID from token
    res.status(501).json({ error: 'Not implemented' });
});

export default router;
