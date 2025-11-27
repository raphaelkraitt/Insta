import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { CollectionGallery } from '../components/CollectionGallery';

const socket = io('http://localhost:3000');
const API_URL = 'http://localhost:3000';

interface InventoryItem {
    id: number;
    item_id: number;
    name: string;
    image_url: string;
    category: string;
    slot_type: string;
    rarity: string;
    is_equipped: boolean;
    location: string;
    slot_id: string;
}

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [auction, setAuction] = useState<any>(null);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);

    useEffect(() => {
        fetchInventory();

        socket.on('auction_created', (data) => {
            setAuction({ ...data, currentBid: data.startingPrice || 0 });
        });

        socket.on('bid_update', (data) => {
            if (auction && auction.id === data.auctionId) {
                setAuction((prev: any) => ({ ...prev, currentBid: data.amount }));
            }
        });

        return () => {
            socket.off('auction_created');
            socket.off('bid_update');
        };
    }, [auction]);

    const fetchInventory = async () => {
        if (!user) return;
        try {
            const res = await axios.get(`${API_URL}/inventory?userId=${user.id}`);
            const items: InventoryItem[] = res.data;
            setInventory(items);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-game-bg-main pb-6">
            {/* Navigation - Mobile Optimized */}
            <nav className="bg-gradient-to-r from-game-bg-secondary to-game-bg-card shadow-neon p-3 md:p-4 flex flex-col sm:flex-row justify-between items-center sticky top-0 z-50 border-b-2 border-primary/30 gap-3 sm:gap-0">
                <h1 className="text-xl md:text-2xl font-game font-bold gradient-text flex items-center gap-2">
                    <span className="text-2xl md:text-3xl">🎮</span>
                    <span className="hidden sm:inline">Instagram Game</span>
                    <span className="sm:hidden">InstaGame</span>
                </h1>
                <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="balance-display flex items-center gap-1.5 md:gap-2 text-sm md:text-base">
                        <span className="text-xl md:text-2xl">💰</span>
                        <span>${user?.balance.toLocaleString()}</span>
                    </div>
                    <button
                        onClick={logout}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-game text-sm md:text-base hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <main className="p-3 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 md:space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                    {/* Collection Gallery */}
                    <div className="lg:col-span-2 order-1">
                        <CollectionGallery items={inventory} username={user?.username || 'Player'} />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4 md:space-y-6 order-2">
                        {/* Live Auction - Priority on Mobile */}
                        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-4 md:p-6 rounded-game shadow-neon-strong border-2 border-primary relative overflow-hidden backdrop-blur-sm">
                            <div className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-game font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-bl-lg animate-pulse-glow">
                                LIVE
                            </div>
                            <h2 className="text-lg md:text-xl font-game font-bold mb-3 md:mb-4 gradient-text">Active Auction</h2>
                            {auction ? (
                                <div className="text-center">
                                    <div className="text-4xl md:text-5xl font-game font-black text-accent mb-2 text-glow">${auction.currentBid}</div>
                                    <p className="text-game-text-secondary mb-3 md:mb-4 text-xs md:text-sm uppercase tracking-wide font-tech">Current Highest Bid</p>
                                    <p className="text-xs text-game-text-muted">Bid via Instagram comments!</p>
                                </div>
                            ) : (
                                <div className="text-center py-6 md:py-8">
                                    <div className="text-4xl md:text-5xl mb-2 md:mb-3">🏆</div>
                                    <p className="text-game-text-secondary font-game text-sm md:text-base">No active auction</p>
                                    <p className="text-xs text-game-text-muted mt-2">Check back later</p>
                                </div>
                            )}
                        </div>

                        {/* Top Ad - Hidden on small mobile, shown on tablet+ */}
                        <div className="hidden md:flex glass p-6 rounded-game border-2 border-dashed border-primary/30 flex-col items-center justify-center h-48">
                            <span className="text-primary font-game font-bold mb-2">📢 SPONSORED</span>
                            <span className="text-game-text-secondary font-semibold text-lg">Your Ad Here</span>
                            <span className="text-game-text-muted text-xs mt-2">300x250</span>
                        </div>

                        {/* Buy Me a Coffee - Prominent on Mobile */}
                        <div className="bg-gradient-to-br from-accent/20 to-accent/10 p-4 rounded-game border-2 border-accent/50 text-center backdrop-blur-sm">
                            <h3 className="font-game font-bold text-accent mb-2 md:mb-3 text-base md:text-lg">Support the Dev</h3>
                            <a
                                href="https://buymeacoffee.com/instagames"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gradient-to-r from-accent to-accent-light text-white font-game font-bold py-2.5 md:py-3 px-4 rounded-xl shadow-lg hover:shadow-neon transition-all flex items-center justify-center gap-2 w-full text-sm md:text-base"
                            >
                                <span className="text-xl md:text-2xl">☕</span> Buy me a coffee
                            </a>
                        </div>

                        {/* Other Ads - Hidden on mobile */}
                        <div className="hidden md:flex glass p-4 rounded-game border-2 border-dashed border-secondary/30 flex-col items-center justify-center h-32">
                            <span className="text-secondary font-game font-bold text-xs mb-1">ADVERTISEMENT</span>
                            <span className="text-game-text-secondary font-semibold">Banner Space</span>
                            <span className="text-game-text-muted text-xs mt-1">300x100</span>
                        </div>

                        <div className="hidden lg:flex glass p-4 rounded-game border-2 border-dashed border-success/30 flex-col items-center justify-center h-40">
                            <span className="text-success font-game font-bold text-xs mb-1">📣 SPONSORED</span>
                            <span className="text-game-text-secondary font-semibold">Square Ad</span>
                            <span className="text-game-text-muted text-xs mt-1">250x250</span>
                        </div>
                    </div>
                </div>

                {/* Footer - Mobile Optimized */}
                <footer className="mt-8 md:mt-12 pt-4 md:pt-6 border-t border-game-border text-center text-xs md:text-sm text-game-text-muted font-tech">
                    <p className="mb-2 md:mb-3">© 2024 Instagram Game. All rights reserved.</p>
                    <div className="flex flex-wrap justify-center gap-3 md:gap-6">
                        <Link to="/privacy" className="hover:text-primary transition">Privacy</Link>
                        <span className="hidden sm:inline">•</span>
                        <Link to="/terms" className="hover:text-primary transition">Terms</Link>
                        <span className="hidden sm:inline">•</span>
                        <a href="https://buymeacoffee.com/instagames" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition">Support</a>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default Dashboard;
