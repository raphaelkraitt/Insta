import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

interface Item {
    id: number;
    name: string;
    description: string;
    image_url: string;
    rarity: string;
    base_price: number;
    category: string;
    slot_type: string;
    active_auction_id?: number;
}

export const AdminDashboard: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [newItem, setNewItem] = useState({
        name: '',
        description: '',
        image_url: '',
        rarity: 'common',
        base_price: 100,
        category: 'painting',
        slot_type: 'wall'
    });
    const [auctionSettings, setAuctionSettings] = useState({
        duration: 10,
        startingPrice: 0
    });
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/items`);
            setItems(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setNewItem({ ...newItem, [e.target.name]: e.target.value });
    };

    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/admin/items`, newItem);
            alert('Item created!');
            fetchItems();
            setNewItem({
                name: '',
                description: '',
                image_url: '',
                rarity: 'common',
                base_price: 100,
                category: 'painting',
                slot_type: 'wall'
            });
        } catch (err) {
            console.error(err);
            alert('Failed to create item');
        }
    };

    const handleStartAuction = (itemId: number) => {
        const item = items.find(i => i.id === itemId);
        if (item) {
            setSelectedItem(item);
            setAuctionSettings({ duration: 10, startingPrice: item.base_price });
        }
    };

    const confirmStartAuction = async () => {
        if (!selectedItem) return;
        try {
            await axios.post(`${API_URL}/admin/auctions`, {
                itemId: selectedItem.id,
                durationMinutes: auctionSettings.duration,
                startingPrice: auctionSettings.startingPrice
            });
            alert('Auction started!');
            setSelectedItem(null);
            fetchItems();
        } catch (err) {
            console.error(err);
            alert('Failed to start auction');
        }
    };

    const handleEndAuction = async (auctionId: number) => {
        try {
            await axios.post(`${API_URL}/admin/auctions/${auctionId}/end`);
            alert('Auction ended successfully!');
            fetchItems(); // Refresh to see status change
        } catch (error) {
            console.error('Failed to end auction', error);
            alert('Failed to end auction');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Create Item Form */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Create New Item</h2>
                    <form onSubmit={handleCreateItem} className="space-y-4">
                        <input name="name" placeholder="Item Name" value={newItem.name} onChange={handleInputChange} className="w-full p-2 border rounded" required />
                        <textarea name="description" placeholder="Description" value={newItem.description} onChange={handleInputChange} className="w-full p-2 border rounded" />
                        <input name="image_url" placeholder="Image URL" value={newItem.image_url} onChange={handleInputChange} className="w-full p-2 border rounded" />
                        <input name="rarity" placeholder="Rarity (common, rare, legendary)" value={newItem.rarity} onChange={handleInputChange} className="w-full p-2 border rounded" />
                        <input name="category" placeholder="Category (painting, furniture)" value={newItem.category} onChange={handleInputChange} className="w-full p-2 border rounded" />
                        <input name="slot_type" placeholder="Slot Type (wall, floor)" value={newItem.slot_type} onChange={handleInputChange} className="w-full p-2 border rounded" />
                        <input type="number" name="base_price" placeholder="Base Price" value={newItem.base_price} onChange={handleInputChange} className="w-full p-2 border rounded" />
                        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Create Item</button>
                    </form>
                </div>

                {/* Items List & Auction Control */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Items & Auctions</h2>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                        {items.map((item) => (
                            <div key={item.id} className="border p-4 rounded flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold">
                                        {item.name}
                                        {item.active_auction_id && <span className="ml-2 text-sm text-blue-600">(Auction #{item.active_auction_id})</span>}
                                    </h3>
                                    <p className="text-sm text-gray-500">{item.rarity} - ${item.base_price}</p>
                                    {item.active_auction_id && (
                                        <p className="text-xs text-green-600 font-bold">Active Auction: #{item.active_auction_id}</p>
                                    )}
                                </div>
                                <div className="flex space-x-2">
                                    {!item.active_auction_id ? (
                                        <button
                                            onClick={() => handleStartAuction(item.id)}
                                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                        >
                                            Start Auction
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleEndAuction(item.active_auction_id!)}
                                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                                        >
                                            End Auction
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Auction Settings Modal */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h3 className="text-lg font-bold mb-4">Start Auction for {selectedItem.name}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm">Duration (minutes)</label>
                                <input
                                    type="number"
                                    value={auctionSettings.duration}
                                    onChange={(e) => setAuctionSettings({ ...auctionSettings, duration: parseInt(e.target.value) })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm">Starting Price</label>
                                <input
                                    type="number"
                                    value={auctionSettings.startingPrice}
                                    onChange={(e) => setAuctionSettings({ ...auctionSettings, startingPrice: parseInt(e.target.value) })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button onClick={() => setSelectedItem(null)} className="px-4 py-2 text-gray-600">Cancel</button>
                                <button onClick={confirmStartAuction} className="px-4 py-2 bg-green-600 text-white rounded">Start</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
