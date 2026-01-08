import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signup } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
            }
            navigate('/');
        } catch (err) {
            console.error(err);
            setError(parseAuthError(err.code));
        } finally {
            setLoading(false);
        }
    }

    function parseAuthError(code) {
        switch (code) {
            case 'auth/invalid-email': return 'Invalid email address.';
            case 'auth/user-not-found': return 'User not found.';
            case 'auth/wrong-password': return 'Incorrect password.';
            case 'auth/email-already-in-use': return 'Email already registered.';
            default: return 'Authentication failed.';
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            {/* Background Video (Optional, can add later) */}
            <div className="glass-panel p-8 w-11/12 max-w-md text-center transform transition-all duration-500">
                <h2 className="header-font text-5xl font-bold fire-text mb-2">
                    {isLogin ? 'LOGIN' : 'JOIN'}
                </h2>
                <p className="text-gray-400 mb-6 text-sm">Welcome back to Habit Dashboard.</p>

                {error && <p className="text-red-500 text-sm min-h-[20px] mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 focus:border-fire-orange focus:outline-none transition-colors"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 focus:border-fire-orange focus:outline-none transition-colors"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3 rounded-lg shadow-lg transform hover:scale-[1.02] transition-all accent-font text-xl tracking-wide disabled:opacity-50"
                    >
                        {loading ? 'PROCESSING...' : (isLogin ? 'ENTER DASHBOARD' : 'CREATE ACCOUNT')}
                    </button>
                </form>

                <p
                    className="mt-4 text-sm text-gray-400 cursor-pointer hover:text-white transition-colors"
                    onClick={() => setIsLogin(!isLogin)}
                >
                    {isLogin
                        ? <>Don't have an account? <span className="text-fire-orange underline">Sign Up</span></>
                        : <>Already have an account? <span className="text-fire-orange underline">Login</span></>
                    }
                </p>
            </div>
        </div>
    );
}
