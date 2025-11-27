import React, { useState } from 'react';
import html2canvas from 'html2canvas';

interface CollectionItem {
    id: number;
    item_id: number;
    name: string;
    image_url: string;
    category: string;
    rarity: string;
    is_equipped: boolean;
}

interface CollectionGalleryProps {
    items: CollectionItem[];
    username: string;
}

const rarityConfig = {
    common: {
        gradient: 'from-gray-400 to-gray-600',
        glow: 'shadow-gray-400/50',
        border: 'border-gray-500',
        particle: '⚪'
    },
    uncommon: {
        gradient: 'from-green-400 to-green-600',
        glow: 'shadow-green-400/50',
        border: 'border-green-500',
        particle: '🟢'
    },
    rare: {
        gradient: 'from-blue-400 to-blue-600',
        glow: 'shadow-blue-400/50',
        border: 'border-blue-500',
        particle: '🔵'
    },
    epic: {
        gradient: 'from-purple-400 to-purple-600',
        glow: 'shadow-purple-400/50',
        border: 'border-purple-500',
        particle: '🟣'
    },
    legendary: {
        gradient: 'from-yellow-400 via-orange-500 to-yellow-600',
        glow: 'shadow-yellow-400/70',
        border: 'border-yellow-500',
        particle: '⭐'
    }
};

export const CollectionGallery: React.FC<CollectionGalleryProps> = ({ items, username }) => {
    const [viewMode, setViewMode] = useState<'cabinet' | 'grid'>('cabinet');
    const [downloading, setDownloading] = useState(false);

    const getRarityStyle = (rarity: string) => {
        const normalizedRarity = rarity.toLowerCase();
        return rarityConfig[normalizedRarity as keyof typeof rarityConfig] || rarityConfig.common;
    };

    const sortedItems = [...items].sort((a, b) => {
        const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
        const aRarity = rarityOrder[a.rarity.toLowerCase() as keyof typeof rarityOrder] || 0;
        const bRarity = rarityOrder[b.rarity.toLowerCase() as keyof typeof rarityOrder] || 0;
        return bRarity - aRarity;
    });

    const legendaryItems = sortedItems.filter(i => i.rarity.toLowerCase() === 'legendary');
    const otherItems = sortedItems.filter(i => i.rarity.toLowerCase() !== 'legendary');

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const element = document.getElementById('collection-display');
            if (!element) return;

            const canvas = await html2canvas(element, {
                backgroundColor: '#1a1a2e',
                scale: 2,
                logging: false,
                useCORS: true,
            });

            // Convert canvas to blob and download
            canvas.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${username}-collection-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 'image/png');
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download image. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                        My Collection
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        {items.length} {items.length === 1 ? 'item' : 'items'} collected
                    </p>
                </div>

                <div className="flex gap-2">
                    {/* View Toggle */}
                    <div className="bg-gray-800 rounded-lg p-1 flex gap-1">
                        <button
                            onClick={() => setViewMode('cabinet')}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition ${viewMode === 'cabinet'
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Cabinet
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition ${viewMode === 'grid'
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Grid
                        </button>
                    </div>

                    {/* Download Button */}
                    <button
                        onClick={handleDownload}
                        disabled={downloading || items.length === 0}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {downloading ? '📸 Generating...' : '📸 Download Collection'}
                    </button>
                </div>
            </div>

            {/* Collection Display */}
            <div id="collection-display" className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl p-8 min-h-[500px] relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.03) 10px, rgba(255,255,255,.03) 20px)'
                    }} />
                </div>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-500">
                        <div className="text-6xl mb-4">📦</div>
                        <p className="text-xl font-medium">No items yet</p>
                        <p className="text-sm mt-2">Win auctions to start your collection!</p>
                    </div>
                ) : viewMode === 'cabinet' ? (
                    <div className="relative space-y-12">
                        {/* Legendary Showcase */}
                        {legendaryItems.length > 0 && (
                            <div className="relative">
                                <h3 className="text-xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
                                    <span>✨</span> Legendary Showcase
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {legendaryItems.map(item => {
                                        const style = getRarityStyle(item.rarity);
                                        return (
                                            <div
                                                key={item.id}
                                                className="relative group"
                                                style={{ perspective: '1000px' }}
                                            >
                                                {/* Spotlight Effect */}
                                                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />

                                                {/* Item Card */}
                                                <div className={`relative bg-gradient-to-br ${style.gradient} p-1 rounded-xl ${style.glow} shadow-2xl transform group-hover:-translate-y-2 group-hover:scale-105 transition-all duration-300`}>
                                                    <div className="bg-gray-900 rounded-lg p-4">
                                                        <div className="aspect-square bg-gray-800 rounded-lg mb-3 overflow-hidden flex items-center justify-center relative">
                                                            <img
                                                                src={item.image_url || 'https://via.placeholder.com/200'}
                                                                alt={item.name}
                                                                className="max-w-full max-h-full object-contain transform group-hover:scale-110 transition-transform duration-300"
                                                            />
                                                            {/* Particles */}
                                                            <div className="absolute top-2 right-2 text-2xl animate-bounce">{style.particle}</div>
                                                        </div>
                                                        <h4 className="font-bold text-white text-center truncate">{item.name}</h4>
                                                        <p className="text-xs text-gray-400 text-center capitalize">{item.rarity}</p>
                                                    </div>
                                                </div>

                                                {/* Rotating Pedestal */}
                                                <div className="relative mt-2 h-8">
                                                    <div className={`absolute w-full h-4 bg-gradient-to-r ${style.gradient} opacity-30 rounded-full transform -skew-y-3`} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Other Items on Shelves */}
                        {otherItems.length > 0 && (
                            <div className="relative">
                                <h3 className="text-xl font-bold text-purple-400 mb-6">Collection</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {otherItems.map(item => {
                                        const style = getRarityStyle(item.rarity);
                                        return (
                                            <div
                                                key={item.id}
                                                className="relative group"
                                            >
                                                <div className={`relative bg-gradient-to-br ${style.gradient} p-0.5 rounded-lg ${style.glow} shadow-lg transform group-hover:-translate-y-1 transition-all duration-200`}>
                                                    <div className="bg-gray-900 rounded-lg p-3">
                                                        <div className="aspect-square bg-gray-800 rounded mb-2 overflow-hidden flex items-center justify-center">
                                                            <img
                                                                src={item.image_url || 'https://via.placeholder.com/100'}
                                                                alt={item.name}
                                                                className="max-w-full max-h-full object-contain"
                                                            />
                                                        </div>
                                                        <h4 className="font-medium text-white text-xs text-center truncate">{item.name}</h4>
                                                        <p className="text-[10px] text-gray-400 text-center capitalize">{item.rarity}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Grid View */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {sortedItems.map(item => {
                            const style = getRarityStyle(item.rarity);
                            return (
                                <div
                                    key={item.id}
                                    className="relative group"
                                >
                                    <div className={`relative bg-gradient-to-br ${style.gradient} p-0.5 rounded-lg ${style.glow} shadow-lg transform group-hover:scale-110 transition-all duration-200`}>
                                        <div className="bg-gray-900 rounded-lg p-2">
                                            <div className="aspect-square bg-gray-800 rounded mb-2 overflow-hidden flex items-center justify-center">
                                                <img
                                                    src={item.image_url || 'https://via.placeholder.com/100'}
                                                    alt={item.name}
                                                    className="max-w-full max-h-full object-contain"
                                                />
                                            </div>
                                            <h4 className="font-medium text-white text-[10px] text-center truncate">{item.name}</h4>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Watermark for downloaded image */}
                <div className="absolute bottom-4 left-4 text-gray-500 text-sm font-medium">
                    @{username}'s Collection
                </div>
            </div>
        </div>
    );
};
