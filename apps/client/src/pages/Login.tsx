import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [step, setStep] = useState<'username' | 'password' | 'create-password'>('username');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleUsernameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/check-status', { username });
            if (!res.data.exists) {
                alert('User not found. Please comment on an Instagram post first!');
                return;
            }
            if (res.data.hasPassword) {
                setStep('password');
            } else {
                setStep('create-password');
            }
        } catch (err) {
            alert('Error checking user status');
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { username, password });
            login(res.data.token, res.data.user);
            navigate('/');
        } catch (err) {
            alert('Login failed');
        }
    };

    const handleCreatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/auth/set-password', { username, password });
            // Auto login after setting password
            const res = await api.post('/auth/login', { username, password });
            login(res.data.token, res.data.user);
            navigate('/');
        } catch (err) {
            alert('Failed to set password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h1 className="text-2xl font-bold mb-4 text-center text-primary">Insta Game</h1>

                {step === 'username' && (
                    <form onSubmit={handleUsernameSubmit} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Enter Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2 border rounded"
                            autoFocus
                        />
                        <button type="submit" className="w-full bg-primary text-white p-2 rounded hover:bg-pink-600">
                            Next
                        </button>
                    </form>
                )}

                {step === 'password' && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <p className="text-center font-bold">Welcome back, @{username}!</p>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded"
                            autoFocus
                        />
                        <button type="submit" className="w-full bg-primary text-white p-2 rounded hover:bg-pink-600">
                            Login
                        </button>
                        <button type="button" onClick={() => setStep('username')} className="w-full text-sm text-gray-500">
                            Back
                        </button>
                    </form>
                )}

                {step === 'create-password' && (
                    <form onSubmit={handleCreatePassword} className="space-y-4">
                        <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-sm text-yellow-800 mb-4">
                            👋 Welcome @{username}! <br />
                            Please create a password to secure your account.
                        </div>
                        <input
                            type="password"
                            placeholder="Create Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded"
                            autoFocus
                        />
                        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
                            Set Password & Login
                        </button>
                    </form>
                )}

                <p className="mt-4 text-sm text-center text-gray-500">
                    Comment on our Instagram posts to create an account!
                </p>
                <div className="mt-4 text-center">
                    <a href="/simulator" className="text-xs text-blue-500 hover:underline">Open Instagram Simulator</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
