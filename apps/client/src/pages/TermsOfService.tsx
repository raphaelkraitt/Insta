import React from 'react';
import { Link } from 'react-router-dom';

export const TermsOfService: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
                <Link to="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">&larr; Back to Home</Link>

                <h1 className="text-4xl font-bold mb-6 text-gray-900">Terms of Service</h1>
                <p className="text-gray-600 mb-8">Last updated: November 27, 2024</p>

                <div className="space-y-6 text-gray-700">
                    <section>
                        <h2 className="text-2xl font-semibold mb-3 text-gray-900">1. Acceptance of Terms</h2>
                        <p>By accessing and using Instagram Game, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our service.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3 text-gray-900">2. Game Description</h2>
                        <p>Instagram Game is a virtual economy game where users earn in-game currency, participate in auctions, and collect virtual items by interacting through Instagram comments.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3 text-gray-900">3. User Accounts</h2>
                        <ul className="list-disc ml-6 space-y-2">
                            <li>Accounts are created automatically when you interact with the game via Instagram</li>
                            <li>You are responsible for maintaining the confidentiality of your login credentials</li>
                            <li>One account per Instagram username</li>
                            <li>You must not share your account with others</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3 text-gray-900">4. Virtual Currency and Items</h2>
                        <ul className="list-disc ml-6 space-y-2">
                            <li><strong>No Real Money Value</strong>: All in-game currency and items have NO real-world monetary value</li>
                            <li><strong>No Refunds</strong>: Virtual items cannot be exchanged for real money</li>
                            <li><strong>No Transfers</strong>: You may not sell, trade, or transfer your account or items outside the game</li>
                            <li>We reserve the right to modify, suspend, or terminate virtual items at any time</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3 text-gray-900">5. Acceptable Use</h2>
                        <p className="mb-2">You agree NOT to:</p>
                        <ul className="list-disc ml-6 space-y-1">
                            <li>Use bots or automated scripts to interact with the game</li>
                            <li>Exploit bugs or glitches for unfair advantage</li>
                            <li>Harass, abuse, or harm other users</li>
                            <li>Impersonate other users or administrators</li>
                            <li>Attempt to hack, reverse engineer, or disrupt the service</li>
                            <li>Use offensive or inappropriate usernames</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3 text-gray-900">6. Auctions</h2>
                        <ul className="list-disc ml-6 space-y-2">
                            <li>All bids are final and binding</li>
                            <li>You must have sufficient balance to place a bid</li>
                            <li>The highest bidder when the auction ends wins the item</li>
                            <li>We reserve the right to cancel auctions for any reason</li>
                            <li>Bid sniping and last-second bidding are allowed</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3 text-gray-900">7. Content and Intellectual Property</h2>
                        <p>All game content, including but not limited to graphics, text, code, and design, is owned by Instagram Game or licensed to us. You may not copy, reproduce, or redistribute any content without permission.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3 text-gray-900">8. Disclaimers</h2>
                        <ul className="list-disc ml-6 space-y-2">
                            <li>The game is provided "AS IS" without warranties of any kind</li>
                            <li>We do not guarantee uninterrupted or error-free service</li>
                            <li>We are not responsible for loss of virtual items due to bugs, server issues, or other technical problems</li>
                            <li>We are not affiliated with Instagram/Meta</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3 text-gray-900">9. Limitation of Liability</h2>
                        <p>To the maximum extent permitted by law, Instagram Game and its developers shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3 text-gray-900">10. Account Termination</h2>
                        <p className="mb-2">We reserve the right to suspend or terminate your account if you:</p>
                        <ul className="list-disc ml-6 space-y-1">
                            <li>Violate these Terms of Service</li>
                            <li>Engage in fraudulent activity</li>
                            <li>Use cheats or exploits</li>
                            <li>Are inactive for an extended period</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3 text-gray-900">11. Changes to Terms</h2>
                        <p>We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms. We will notify users of significant changes.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3 text-gray-900">12. Governing Law</h2>
                        <p>These terms are governed by and construed in accordance with applicable laws. Any disputes shall be resolved through binding arbitration.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3 text-gray-900">13. Contact</h2>
                        <p>For questions about these Terms of Service, contact us via <a href="https://buymeacoffee.com/instagames" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Buy Me a Coffee</a>.</p>
                    </section>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        By using Instagram Game, you agree to these Terms of Service and our <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
};
