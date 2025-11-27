import axios from 'axios';

const SERVER_URL = 'http://localhost:3000/webhooks/instagram';

const comments = [
    { username: 'alice', text: 'bid 500' },
    { username: 'bob', text: 'bid 600' },
    { username: 'charlie', text: 'buy lamp' },
    { username: 'alice', text: 'balance' },
];

const simulate = async () => {
    for (const comment of comments) {
        try {
            console.log(`Sending: ${comment.username} -> ${comment.text}`);
            const res = await axios.post(SERVER_URL, comment);
            console.log('Response:', res.data);
        } catch (err) {
            console.error('Error:', err instanceof Error ? err.message : String(err));
        }
        await new Promise(r => setTimeout(r, 1000));
    }
};

simulate();
