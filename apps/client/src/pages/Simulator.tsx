import React, { useState } from 'react';
import api from '../api';

const Simulator: React.FC = () => {
    const [username, setUsername] = useState('');
    const [text, setText] = useState('');
    const [auctionId, setAuctionId] = useState('');
    const [response, setResponse] = useState<any>(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setResponse(null);
        setError('');

        try {
            const res = await api.post('/webhooks/instagram', {
                username,
                text,
                auctionId: auctionId ? parseInt(auctionId) : undefined
            });
            setResponse(res.data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to send comment');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-pink-600">Instagram Simulator</h1>
                <p className="text-sm text-gray-500 mb-6 text-center">
                    Simulate a comment on an Instagram post to interact with the game.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-pink-500 focus:border-pink-500"
                            placeholder="e.g. alice"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Auction ID (Optional)</label>
                        <input
                            type="number"
                            value={auctionId}
                            onChange={(e) => setAuctionId(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-pink-500 focus:border-pink-500"
                            placeholder="e.g. 1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Comment Text</label>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-pink-500 focus:border-pink-500"
                            placeholder="e.g. bid 500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-md hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 font-bold"
                    >
                        Send Comment
                    </button>
                </form>

                {response && (
                    <div className="mt-6 p-4 bg-green-50 rounded-md border border-green-200">
                        <h3 className="text-sm font-medium text-green-800">Response:</h3>
                        <pre className="mt-2 text-xs text-green-700 whitespace-pre-wrap">
                            {JSON.stringify(response, null, 2)}
                        </pre>
                    </div>
                )}

                {error && (
                    <div className="mt-6 p-4 bg-red-50 rounded-md border border-red-200">
                        <h3 className="text-sm font-medium text-red-800">Error:</h3>
                        <p className="mt-2 text-sm text-red-700">{error}</p>
                    </div>
                )}

                <div className="mt-8 pt-4 border-t text-center">
                    <a href="/login" className="text-sm text-blue-600 hover:underline">Go to Login</a>
                </div>
            </div>
        </div>
    );
};

export default Simulator;
