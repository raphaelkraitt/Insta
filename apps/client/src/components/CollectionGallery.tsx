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
        gradient: 'from-gray-500 to-gray-700',
        glow: 'shadow-[0_0_15px_rgba(156,163,175,0.3)]',
        border: 'border-gray-500',
        borderWidth: 'border-2',
        particle: '⚪',
        bgOverlay: 'bg-gray-500/5'
    },
    uncommon: {
        gradient: 'from-green-400 to-emerald-600',
        glow: 'shadow-[0_0_25px_rgba(52,211,153,0.5)]',
        border: 'border-green-400',
        borderWidth: 'border-[3px]',
        particle: '🟢',
        bgOverlay: 'bg-green-500/10'
    },
    rare: {
        gradient: 'from-blue-400 to-blue-600',
        glow: 'shadow-[0_0_30px_rgba(96,165,250,0.6)]',
        border: 'border-blue-400',
        borderWidth: 'border-[3px]',
        particle: '🔵',
        bgOverlay: 'bg-blue-500/15'
    },
    epic: {
        gradient: 'from-purple-400 via-purple-500 to-purple-600',
        glow: 'shadow-[0_0_35px_rgba(167,139,250,0.7)]',
        border: 'border-purple-400',
        borderWidth: 'border-4',
        particle: '🟣',
        bgOverlay: 'bg-purple-500/20'
    },
    legendary: {
        gradient: 'from-amber-300 via-yellow-400 to-orange-500',
        glow: 'shadow-[0_0_50px_rgba(251,191,36,0.9),0_0_100px_rgba(251,191,36,0.5)]',
        border: 'border-yellow-400',
        borderWidth: 'border-4',
        particle: '⭐',
        bgOverlay: 'bg-yellow-400/25',
        shine: true
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
                                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 mb-8 flex items-center gap-3 animate-pulse">
                                    <span className="text-3xl">✨</span>
                                    <span className="tracking-tight">Legendary Showcase</span>
                                    <span className="text-3xl">✨</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {legendaryItems.map(item => {
                                        const style = getRarityStyle(item.rarity);
                                        return (
                                            <div
                                                key={item.id}
                                                className="relative group"
                                                style={{ perspective: '1500px' }}
                                            >
                                                {/* Dramatic Spotlight */}
                                                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-48 h-48 bg-yellow-400/30 rounded-full blur-[100px] animate-pulse" />
                                                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-300/40 rounded-full blur-3xl" />

                                                {/* Item Card */}
                                                <div className={`relative bg-gradient-to-br ${style.gradient} p-1 rounded-2xl ${style.glow} shadow-2xl transform group-hover:-translate-y-4 group-hover:scale-105 transition-all duration-500 ${style.borderWidth} ${style.border} animate-pulse`}>
                                                    {/* Shine Effect */}
                                                    <div className="absolute inset-0 rounded-2xl overflow-hidden">
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                                    </div>

                                                    <div className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 ${style.bgOverlay} backdrop-blur-sm`}>
                                                        <div className="aspect-square bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl mb-4 overflow-hidden flex items-center justify-center relative border-2 border-yellow-400/30">
                                                            <img
                                                                src={item.image_url || 'https://via.placeholder.com/300'}
                                                                alt={item.name}
                                                                className="max-w-full max-h-full object-contain transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]"
                                                            />
                                                            {/* Rotating Particles */}
                                                            <div className="absolute top-3 right-3 text-3xl animate-bounce">{style.particle}</div>
                                                            <div className="absolute bottom-3 left-3 text-2xl animate-pulse opacity-70">{style.particle}</div>
                                                        </div>
                                                        <h4 className="font-bold text-white text-center text-lg mb-1 tracking-tight">{item.name}</h4>
                                                        <p className="text-sm text-yellow-400 text-center capitalize font-semibold tracking-wide">{item.rarity}</p>
                                                    </div>
                                                </div>

                                                {/* Enhanced Pedestal */}
                                                <div className="relative mt-3 h-10">
                                                    <div className={`absolute w-full h-6 bg-gradient-to-r ${style.gradient} opacity-40 rounded-full blur-md transform -skew-y-3`} />
                                                    <div className={`absolute w-3/4 left-1/2 -translate-x-1/2 h-4 bg-gradient-to-r ${style.gradient} opacity-30 rounded-full blur-sm transform -skew-y-2`} />
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
                                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-6 tracking-tight">Collection</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {otherItems.map(item => {
                                        const style = getRarityStyle(item.rarity);
                                        const isEpic = item.rarity.toLowerCase() === 'epic';
                                        return (
                                            <div
                                                key={item.id}
                                                className="relative group"
                                            >
                                                <div className={`relative bg-gradient-to-br ${style.gradient} p-0.5 rounded-xl ${style.glow} shadow-lg transform group-hover:-translate-y-2 group-hover:scale-105 transition-all duration-300 ${style.borderWidth} ${style.border}`}>
                                                    <div className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-3 ${style.bgOverlay}`}>
                                                        <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg mb-2 overflow-hidden flex items-center justify-center relative border border-gray-700/50">
                                                            <img
                                                                src={item.image_url || 'https://via.placeholder.com/150'}
                                                                alt={item.name}
                                                                className={`max-w-full max-h-full object-contain transition-transform duration-300 ${isEpic ? 'group-hover:scale-110 group-hover:rotate-2' : 'group-hover:scale-105'}`}
                                                            />
                                                            {/* Rarity particle indicator */}
                                                            {isEpic && <div className="absolute top-1 right-1 text-lg animate-pulse">{style.particle}</div>}
                                                        </div>
                                                        <h4 className="font-semibold text-white text-xs text-center truncate tracking-tight">{item.name}</h4>
                                                        <p className={`text-[10px] text-center capitalize font-medium mt-0.5 ${item.rarity.toLowerCase() === 'epic' ? 'text-purple-400' :
                                                                item.rarity.toLowerCase() === 'rare' ? 'text-blue-400' :
                                                                    item.rarity.toLowerCase() === 'uncommon' ? 'text-green-400' :
                                                                        'text-gray-400'
                                                            }`}>{item.rarity}</p>
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
