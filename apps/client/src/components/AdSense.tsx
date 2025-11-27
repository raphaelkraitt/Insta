import React, { useEffect } from 'react';

interface AdSenseProps {
    adClient: string;
    adSlot: string;
    adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
    fullWidthResponsive?: boolean;
    style?: React.CSSProperties;
    className?: string;
}

/**
 * Google AdSense Component
 * 
 * Usage:
 * 1. Get your AdSense Publisher ID and Ad Slot ID from Google AdSense dashboard
 * 2. Add the AdSense script to index.html (see deployment guide)
 * 3. Replace the adClient and adSlot props with your actual IDs
 * 
 * Example:
 * <AdSense 
 *   adClient="ca-pub-XXXXXXXXXXXXXXXX"
 *   adSlot="1234567890"
 *   adFormat="auto"
 * />
 */
export const AdSense: React.FC<AdSenseProps> = ({
    adClient,
    adSlot,
    adFormat = 'auto',
    fullWidthResponsive = true,
    style = { display: 'block' },
    className = ''
}) => {
    useEffect(() => {
        try {
            // Load AdSense ad
            if (typeof window !== 'undefined') {
                ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            }
        } catch (error) {
            console.error('AdSense error:', error);
        }
    }, []);

    // Don't render if in development mode or if IDs are not set
    const isDev = import.meta.env.DEV || adClient.includes('XXXX');

    if (isDev) {
        // Return placeholder in development
        return (
            <div className={`bg-gray-100 border-2 border-dashed border-gray-300 p-4 rounded ${className}`}>
                <div className="text-center text-gray-400 text-sm">
                    <p className="font-bold mb-1">AdSense Placeholder</p>
                    <p className="text-xs">Ad will display in production</p>
                    <p className="text-xs mt-2">Client: {adClient}</p>
                    <p className="text-xs">Slot: {adSlot}</p>
                </div>
            </div>
        );
    }

    return (
        <ins
            className={`adsbygoogle ${className}`}
            style={style}
            data-ad-client={adClient}
            data-ad-slot={adSlot}
            data-ad-format={adFormat}
            data-full-width-responsive={fullWidthResponsive.toString()}
        />
    );
};

// Placeholder component for areas where you'll add ads
export const AdPlaceholder: React.FC<{
    size?: string;
    label?: string;
    className?: string;
}> = ({
    size = '300x250',
    label = 'Your Ad Here',
    className = ''
}) => {
        return (
            <div className={`bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center ${className}`}>
                <span className="text-gray-400 font-bold text-sm mb-2">📢 ADVERTISEMENT</span>
                <span className="text-gray-500 font-semibold">{label}</span>
                <span className="text-gray-400 text-xs mt-2">{size}</span>
            </div>
        );
    };
