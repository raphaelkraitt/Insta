import { Router } from 'express';
import { query } from '../db';
import { AuctionService } from '../services/auction.service';
import fs from 'fs';
import path from 'path';

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

// Credentials Viewer - Loads from Database
router.get('/credentials', async (req, res) => {
    try {
        const result = await query(
            `SELECT id, username, balance, streak, last_earn_date, created_at 
             FROM users 
             ORDER BY created_at DESC`
        );

        const users = result.rows;

        // Load passwords from CSV
        const filePath = path.join(__dirname, '../../credentials.csv');
        const passwordMap = new Map<string, string>();

        if (fs.existsSync(filePath)) {
            const csvContent = fs.readFileSync(filePath, 'utf-8');
            const lines = csvContent.trim().split('\n');
            // Skip header
            lines.slice(1).forEach(line => {
                const parts = line.split(',');
                if (parts.length >= 2) {
                    passwordMap.set(parts[0], parts[1]);
                }
            });
        }

        const usersWithPasswords = users.map(user => ({
            ...user,
            password: passwordMap.get(user.username) || 'Not found'
        }));

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>User Accounts - Instagram Game</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        padding: 20px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        min-height: 100vh;
                    }
                    .container {
                        max-width: 1200px;
                        margin: 0 auto;
                        background: white;
                        padding: 30px;
                        border-radius: 15px;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                    }
                    h1 {
                        color: #667eea;
                        margin-bottom: 10px;
                        font-size: 28px;
                    }
                    .stats {
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        padding: 15px 20px;
                        border-radius: 10px;
                        margin-bottom: 20px;
                        display: flex;
                        gap: 30px;
                        flex-wrap: wrap;
                    }
                    .stat { font-size: 16px; font-weight: 500; }
                    .search-box {
                        width: 100%;
                        padding: 12px 20px;
                        border: 2px solid #e0e0e0;
                        border-radius: 8px;
                        font-size: 16px;
                        margin-bottom: 20px;
                        transition: all 0.3s;
                    }
                    .search-box:focus {
                        outline: none;
                        border-color: #667eea;
                        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                        overflow-x: auto;
                        display: block;
                    }
                    thead {
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                    }
                    th {
                        padding: 15px;
                        text-align: left;
                        font-weight: 600;
                        cursor: pointer;
                        user-select: none;
                    }
                    th:hover { background: rgba(0,0,0,0.1); }
                    td {
                        padding: 12px 15px;
                        border-bottom: 1px solid #e0e0e0;
                    }
                    tbody tr:hover {
                        background: #f5f5f5;
                    }
                    .badge {
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 12px;
                        font-size: 12px;
                        font-weight: 600;
                    }
                    .badge-balance {
                        background: #10b981;
                        color: white;
                    }
                    .badge-streak {
                        background: #f59e0b;
                        color: white;
                    }
                    .password-cell {
                        font-family: 'Courier New', monospace;
                        background: #f0f0f0;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 13px;
                        color: #333;
                        border: 1px solid #ddd;
                        user-select: all;
                    }
                    .copy-btn {
                        background: #667eea;
                        color: white;
                        border: none;
                        padding: 6px 12px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 12px;
                        transition: all 0.2s;
                    }
                    .copy-btn:hover {
                        background: #764ba2;
                        transform: translateY(-2px);
                    }
                    .no-results {
                        text-align: center;
                        padding: 40px;
                        color: #999;
                    }
                    .note {
                        background: #fef3c7;
                        border-left: 4px solid #f59e0b;
                        padding: 12px;
                        margin-bottom: 20px;
                        border-radius: 4px;
                        font-size: 14px;
                    }
                    @media (max-width: 768px) {
                        .container { padding: 15px; }
                        h1 { font-size: 22px; }
                        table { font-size: 14px; }
                        th, td { padding: 10px 8px; }
                        .stats { flex-direction: column; gap: 10px; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>👥 User Accounts</h1>
                    <div class="stats">
                        <div class="stat">📊 Total Users: <strong>${users.length}</strong></div>
                        <div class="stat">📅 Last Created: <strong>${users[0]?.created_at ? new Date(users[0].created_at).toLocaleString() : 'N/A'}</strong></div>
                        <div class="stat">💰 Total Balance: <strong>$${users.reduce((sum, u) => sum + (u.balance || 0), 0).toLocaleString()}</strong></div>
                    </div>

                    <div class="note">
                        ℹ️ <strong>Admin Access:</strong> Displaying live database records merged with local credential storage.
                    </div>

                    <input 
                        type="text" 
                        id="searchBox" 
                        class="search-box" 
                        placeholder="🔍 Search by username..."
                        onkeyup="filterTable()"
                    >

                    <table id="usersTable">
                        <thead>
                            <tr>
                                <th onclick="sortTable(0)">ID ↕</th>
                                <th onclick="sortTable(1)">Username ↕</th>
                                <th onclick="sortTable(2)">Password ↕</th>
                                <th onclick="sortTable(3)">Balance ↕</th>
                                <th onclick="sortTable(4)">Streak ↕</th>
                                <th onclick="sortTable(5)">Last Earn ↕</th>
                                <th onclick="sortTable(6)">Created ↕</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${usersWithPasswords.map(user => `
                                <tr>
                                    <td><strong>#${user.id}</strong></td>
                                    <td><strong>${user.username}</strong></td>
                                    <td>
                                        <span class="password-cell">${user.password}</span>
                                    </td>
                                    <td><span class="badge badge-balance">$${user.balance.toLocaleString()}</span></td>
                                    <td><span class="badge badge-streak">🔥 ${user.streak || 0}</span></td>
                                    <td>${user.last_earn_date ? new Date(user.last_earn_date).toLocaleDateString() : 'Never'}</td>
                                    <td>${new Date(user.created_at).toLocaleString()}</td>
                                    <td>
                                        <button class="copy-btn" onclick="copyCredentials('${user.username}', '${user.password}')">📋 Copy</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div id="noResults" class="no-results" style="display:none;">
                        No users found matching your search.
                    </div>
                </div>

                <script>
                    function copyCredentials(username, password) {
                        const text = \`Username: \${username}\\nPassword: \${password}\`;
                        navigator.clipboard.writeText(text).then(() => {
                            alert('Credentials for ' + username + ' copied!');
                        });
                    }

                    function filterTable() {
                        const input = document.getElementById('searchBox');
                        const filter = input.value.toUpperCase();
                        const table = document.getElementById('usersTable');
                        const tr = table.getElementsByTagName('tr');
                        let hasResults = false;

                        for (let i = 1; i < tr.length; i++) {
                            const td = tr[i].getElementsByTagName('td')[1];
                            if (td) {
                                const txtValue = td.textContent || td.innerText;
                                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                                    tr[i].style.display = '';
                                    hasResults = true;
                                } else {
                                    tr[i].style.display = 'none';
                                }
                            }
                        }

                        document.getElementById('noResults').style.display = hasResults ? 'none' : 'block';
                        table.style.display = hasResults ? 'block' : 'none';
                    }

                    function sortTable(column) {
                        const table = document.getElementById('usersTable');
                        const tbody = table.getElementsByTagName('tbody')[0];
                        const rows = Array.from(tbody.getElementsByTagName('tr'));

                        rows.sort((a, b) => {
                            const aText = a.getElementsByTagName('td')[column].textContent;
                            const bText = b.getElementsByTagName('td')[column].textContent;
                            
                            // Try to parse as number for balance and streak
                            const aNum = parseFloat(aText.replace(/[^0-9.-]/g, ''));
                            const bNum = parseFloat(bText.replace(/[^0-9.-]/g, ''));
                            
                            if (!isNaN(aNum) && !isNaN(bNum)) {
                                return aNum - bNum;
                            }
                            
                            return aText.localeCompare(bText);
                        });

                        rows.forEach(row => tbody.appendChild(row));
                    }
                </script>
            </body>
            </html>
        `;

        res.send(html);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading users from database');
    }
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
