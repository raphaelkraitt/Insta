-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  password_encrypted TEXT,
  balance INTEGER DEFAULT 0,
  last_earn_date TIMESTAMP,
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Instagram Tokens
CREATE TABLE IF NOT EXISTS instagram_tokens (
  id SERIAL PRIMARY KEY,
  access_token TEXT NOT NULL,
  token_type VARCHAR(50) DEFAULT 'short_lived', -- short_lived, long_lived
  expires_at TIMESTAMP,
  user_id INTEGER REFERENCES users(id), -- Optional: if we want to link to a specific admin user
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items Table
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  rarity VARCHAR(50),
  base_price INTEGER DEFAULT 0,
  category VARCHAR(50) DEFAULT 'painting', -- painting, furniture, etc.
  slot_type VARCHAR(50) DEFAULT 'wall' -- wall, floor, etc.
);

-- User Inventory & Placements
CREATE TABLE IF NOT EXISTS user_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  item_id INTEGER REFERENCES items(id),
  acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_equipped BOOLEAN DEFAULT FALSE,
  location VARCHAR(50), -- e.g., 'room_1', 'garden'
  slot_id VARCHAR(50) -- e.g., 'wall_north', 'floor_center'
);

-- Auctions Table
CREATE TABLE IF NOT EXISTS auctions (
  id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES items(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  current_bid INTEGER DEFAULT 0,
  winner_id INTEGER REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'active' -- active, completed, cancelled
);

-- Bids Table
CREATE TABLE IF NOT EXISTS bids (
  id SERIAL PRIMARY KEY,
  auction_id INTEGER REFERENCES auctions(id),
  user_id INTEGER REFERENCES users(id),
  amount INTEGER NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace Listings
CREATE TABLE IF NOT EXISTS listings (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER REFERENCES users(id),
  item_id INTEGER REFERENCES items(id),
  price INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- active, sold, cancelled
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Log
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  from_user_id INTEGER REFERENCES users(id),
  to_user_id INTEGER REFERENCES users(id), -- NULL for system
  amount INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL, -- bid, buy, sell, trade, daily_reward
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
