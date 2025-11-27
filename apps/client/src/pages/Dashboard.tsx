import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:3000');
const API_URL = 'http://localhost:3000';

interface InventoryItem {
    id: number; // user_item_id
    item_id: number;
    name: string;
    image_url: string;
    category: string;
    slot_type: string;
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

    const handleEquip = async (item: InventoryItem) => {
        try {
            await axios.post(`${API_URL}/inventory/equip`, {
                userItemId: item.id,
                userId: user?.id,
                location: 'room_1',
                slotId: 'wall_center' // For now, just one slot
            });
            fetchInventory();
        } catch (err) {
            console.error(err);
            alert('Failed to equip item');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow p-4 flex justify-between items-center sticky top-0 z-10">
                <h1 className="text-xl font-bold text-primary">Insta Game</h1>
                <div className="flex items-center gap-4">
                    <span className="font-semibold bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        ${user?.balance}
                    </span>
                    <button onClick={logout} className="text-red-500 hover:text-red-700">Logout</button>
                </div>
            </nav>

            <main className="p-8 max-w-6xl mx-auto space-y-8">



                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Inventory Section */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Inventory</h2>
                        {inventory.length === 0 ? (
                            <p className="text-gray-500 italic">You don't own any items yet.</p>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {inventory.map(item => (
                                    <div key={item.id} className={`p-3 border rounded-lg transition hover:shadow-md ${item.is_equipped ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
                                        <div className="aspect-square bg-gray-100 rounded mb-2 overflow-hidden">
                                            <img src={item.image_url || 'https://via.placeholder.com/100'} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="font-medium text-sm truncate">{item.name}</div>
                                        <div className="text-xs text-gray-500 mb-2 capitalize">{item.category}</div>
                                        {!item.is_equipped && item.slot_type === 'wall' && (
                                            <button
                                                onClick={() => handleEquip(item)}
                                                className="w-full bg-blue-600 text-white text-xs py-1.5 rounded hover:bg-blue-700 transition"
                                            >
                                                Equip
                                            </button>
                                        )}
                                        {item.is_equipped && (
                                            <div className="text-xs text-blue-600 font-semibold text-center py-1">Equipped</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Auction & Ads */}
                    <div className="space-y-8">
                        {/* Top Ad Space */}
                        <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-lg border-2 border-dashed border-purple-300 flex flex-col items-center justify-center h-48">
                            <span className="text-purple-600 font-bold text-sm mb-2">📢 SPONSORED</span>
                            <span className="text-gray-400 font-semibold text-lg">Your Ad Here</span>
                            <span className="text-gray-300 text-xs mt-2">300x250 Premium Space</span>
                        </div>

                        {/* Live Auction */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-primary relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl">LIVE</div>
                            <h2 className="text-lg font-bold mb-4 text-primary">Active Auction</h2>
                            {auction ? (
                                <div className="text-center">
                                    <div className="text-5xl font-black text-gray-900 mb-2">${auction.currentBid}</div>
                                    <p className="text-gray-500 mb-6 text-sm uppercase tracking-wide">Current Highest Bid</p>
                                    <p className="text-xs text-gray-400 mb-4">Bid via Instagram comments!</p>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-400">No active auction</p>
                                    <p className="text-xs text-gray-300 mt-2">Check back later</p>
                                </div>
                            )}
                        </div>

                        {/* Middle Ad Space */}
                        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-4 rounded-lg border-2 border-dashed border-blue-300 flex flex-col items-center justify-center h-32">
                            <span className="text-blue-600 font-bold text-xs mb-1">ADVERTISEMENT</span>
                            <span className="text-gray-400 font-medium">Banner Space</span>
                            <span className="text-gray-300 text-xs mt-1">300x100</span>
                        </div>

                        {/* Buy Me a Coffee */}
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
                            <h3 className="font-bold text-yellow-800 mb-2">Support the Dev</h3>
                            <a
                                href="https://buymeacoffee.com/instagames"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-yellow-400 text-yellow-900 font-bold py-2 px-4 rounded-full shadow hover:bg-yellow-300 transition flex items-center justify-center gap-2 mx-auto w-full"
                            >
                                <span>☕</span> Buy me a coffee
                            </a>
                        </div>

                        {/* Bottom Ad Space */}
                        <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-lg border-2 border-dashed border-green-300 flex flex-col items-center justify-center h-40">
                            <span className="text-green-600 font-bold text-xs mb-1">📣 SPONSORED</span>
                            <span className="text-gray-400 font-semibold">Square Ad</span>
                            <span className="text-gray-300 text-xs mt-1">250x250</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
                    <p className="mb-2">© 2024 Instagram Game. All rights reserved.</p>
                    <div className="flex justify-center gap-4">
                        <Link to="/privacy" className="hover:text-blue-600">Privacy Policy</Link>
                        <span>•</span>
                        <Link to="/terms" className="hover:text-blue-600">Terms of Service</Link>
                        <span>•</span>
                        <a href="https://buymeacoffee.com/instagames" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">Support</a>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default Dashboard;
