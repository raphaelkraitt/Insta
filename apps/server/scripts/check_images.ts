import { query } from '../src/db';
import { initDb } from '../src/db';

async function checkImages() {
    await initDb();

    const result = await query('SELECT id, name, image_url FROM items LIMIT 5');
    console.log('Items in database:');
    console.table(result.rows);

    process.exit(0);
}

checkImages();
