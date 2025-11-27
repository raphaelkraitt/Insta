import React from 'react';
import { Link } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
                <Link to="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">&larr; Back to Home</Link>

                <h1 className="text-4xl font-bold mb-6 text-gray-900">Privacy Policy</h1>
                <p className="text-gray-600 mb-8">Last updated: November 27, 2024</p>

                <div className="space-y-6 text-gray-700">
                    <section>
                        <h2 className="text-2xl font-semibold mb-3 text-gray-900">1. Information We Collect</h2>
                        <p className="mb-2">We collect the following information:</p>
                        <ul className="list-disc ml-6 space-y-1">
                            <li><strong>Account Information</strong>: Instagram username for game authentication</li>
                            <li><strong>Game Data</strong>: In-game currency, items, auction bids, and transactions</li>
                            <li><strong>Cookies</strong>: Authentication cookies to keep you logged in (expires after 7 days)</li>
                            <li><strong>Usage Data</strong>: Gameplay statistics and interactions</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3 text-gray-900">2. How We Use Your Information</h2>
                        <p className="mb-2">We use your information to:</p>
                        <ul className="list-disc ml-6 space-y-1">
                            <li>Provide and maintain the game service</li>
                            <li>Process in-game transactions and auctions</li>
                            <li>Authenticate your account</li>
                            <li>Improve game features and user experience</li>
                            <li>Communicate important updates</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3 text-gray-900">3. Third-Party Services</h2>
                        <p className="mb-2">We use the following third-party services:</p>
                        <ul className="list-disc ml-6 space-y-1">
                            <li><strong>Google AdSense</strong>: For displaying advertisements. Google may use cookies to show personalized ads based on your interests. You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Ad Settings</a>.</li>
                            <li><strong>Instagram</strong>: For user authentication and comment processing</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3 text-gray-900">4. Data Storage and Security</h2>
                        <p>We store your data securely using industry-standard encryption. Your password is hashed and never stored in plain text. We retain your data as long as your account is active.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3 text-gray-900">5. Cookies</h2>
                        <p className="mb-2">We use cookies for:</p>
                        <ul className="list-disc ml-6 space-y-1">
                            <li>Authentication (keeping you logged in)</li>
                            <li>Personalized advertising (via Google AdSense)</li>
                        </ul>
                        <p className="mt-2">You can disable cookies in your browser settings, but this may affect game functionality.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3 text-gray-900">6. Your Rights</h2>
                        <p className="mb-2">You have the right to:</p>
                        <ul className="list-disc ml-6 space-y-1">
                            <li>Access your personal data</li>
                            <li>Request data deletion</li>
                            <li>Opt out of personalized advertising</li>
                            <li>Export your game data</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3 text-gray-900">7. Children's Privacy</h2>
                        <p>This game is not intended for children under 13. We do not knowingly collect information from children under 13.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3 text-gray-900">8. Changes to This Policy</h2>
                        <p>We may update this policy from time to time. We will notify you of any changes by updating the "Last updated" date.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3 text-gray-900">9. Contact Us</h2>
                        <p>If you have questions about this Privacy Policy, please contact us via our <a href="https://buymeacoffee.com/instagames" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Buy Me a Coffee page</a>.</p>
                    </section>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        By using Instagram Game, you agree to this Privacy Policy and our <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
};
