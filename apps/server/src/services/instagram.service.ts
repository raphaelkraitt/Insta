import axios from 'axios';
import { query } from '../db';

const INSTAGRAM_API_URL = 'https://graph.instagram.com';

export class InstagramService {
    static async saveToken(accessToken: string, tokenType: 'short_lived' | 'long_lived', expiresInSeconds: number) {
        const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

        // For now, we assume a single global token or we could link it to a user.
        // We'll just insert a new one for simplicity in this MVP.
        await query(
            'INSERT INTO instagram_tokens (access_token, token_type, expires_at) VALUES ($1, $2, $3)',
            [accessToken, tokenType, expiresAt]
        );
        console.log(`Saved ${tokenType} token, expires at ${expiresAt}`);
    }

    static async getValidToken(): Promise<string | null> {
        // Get the latest long-lived token that hasn't expired
        const result = await query(
            `SELECT * FROM instagram_tokens 
             WHERE token_type = 'long_lived' AND expires_at > NOW() 
             ORDER BY created_at DESC LIMIT 1`
        );

        if (result.rows.length > 0) {
            const token = result.rows[0];
            // Check if it needs refresh (e.g., if it expires in less than 3 days)
            const daysUntilExpiry = (new Date(token.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
            if (daysUntilExpiry < 3) {
                console.log('Token expiring soon, refreshing...');
                return await this.refreshToken(token.access_token);
            }
            return token.access_token;
        }

        return null;
    }

    static async exchangeForLongLivedToken(shortLivedToken: string, clientSecret: string) {
        try {
            const response = await axios.get(`${INSTAGRAM_API_URL}/access_token`, {
                params: {
                    grant_type: 'ig_exchange_token',
                    client_secret: clientSecret,
                    access_token: shortLivedToken
                }
            });

            const { access_token, expires_in } = response.data;
            await this.saveToken(access_token, 'long_lived', expires_in);
            return access_token;
        } catch (error) {
            console.error('Error exchanging token:', error);
            throw error;
        }
    }

    static async refreshToken(longLivedToken: string) {
        try {
            const response = await axios.get(`${INSTAGRAM_API_URL}/refresh_access_token`, {
                params: {
                    grant_type: 'ig_refresh_token',
                    access_token: longLivedToken
                }
            });

            const { access_token, expires_in } = response.data;
            await this.saveToken(access_token, 'long_lived', expires_in);
            return access_token;
        } catch (error) {
            console.error('Error refreshing token:', error);
            throw error;
        }
    }
}
