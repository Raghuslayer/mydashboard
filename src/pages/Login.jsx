import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const QUOTES = [
    "DISCIPLINE IS THE BRIDGE BETWEEN GOALS AND ACCOMPLISHMENT",
    "SUFFER THE PAIN OF DISCIPLINE OR SUFFER THE PAIN OF REGRET",
    "THE IRON NEVER LIES TO YOU",
    "HARD WORK BEATS TALENT WHEN TALENT DOESN'T WORK HARD",
    "STAY HARD",
];

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [quoteIdx, setQuoteIdx] = useState(0);

    const { login, signup } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        const t = setInterval(() => setQuoteIdx(q => (q + 1) % QUOTES.length), 3500);
        return () => clearInterval(t);
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) await login(email, password);
            else await signup(email, password);
            navigate('/');
        } catch (err) {
            const msgs = {
                'auth/invalid-email': 'Invalid email address.',
                'auth/user-not-found': 'No account found.',
                'auth/wrong-password': 'Incorrect password.',
                'auth/email-already-in-use': 'Email already registered.',
            };
            setError(msgs[err.code] || 'Authentication failed. Try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        /* Full-page wrapper — no position:fixed, just a normal block that fills the screen */
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0c0808',
            padding: '24px',
            boxSizing: 'border-box',
        }}>
            {/* Card */}
            <div style={{
                width: '100%',
                maxWidth: '420px',
                backgroundColor: '#1a0c0c',
                border: '1px solid rgba(192, 36, 42, 0.45)',
                borderRadius: '16px',
                padding: '44px 36px',
                boxShadow: '0 0 60px rgba(192, 36, 42, 0.25), 0 24px 80px rgba(0,0,0,0.7)',
                position: 'relative',
            }}>

                {/* Top crimson accent line */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: '20%', right: '20%',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #c0242a, transparent)',
                    boxShadow: '0 0 18px rgba(192,36,42,0.8)',
                    borderRadius: '0 0 4px 4px',
                }} />

                {/* Icon */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{
                        width: 64, height: 64,
                        borderRadius: '50%',
                        background: 'linear-gradient(145deg, #6a1010, #c0242a)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '28px',
                        boxShadow: '0 0 32px rgba(192,36,42,0.55)',
                    }}>⚔️</div>

                    <div style={{
                        fontFamily: "'Teko', sans-serif",
                        fontSize: '2.8rem',
                        fontWeight: 700,
                        lineHeight: 1,
                        color: '#c0242a',
                        letterSpacing: '0.06em',
                        marginBottom: '8px',
                        WebkitTextFillColor: '#c0242a',
                        textShadow: '0 0 30px rgba(192,36,42,0.4)',
                    }}>
                        {isLogin ? 'WARRIOR LOGIN' : 'JOIN THE ARENA'}
                    </div>

                    <div style={{
                        fontSize: '9px',
                        color: '#c8943a',
                        letterSpacing: '0.14em',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        minHeight: '22px',
                        WebkitTextFillColor: '#c8943a',
                    }}>
                        {QUOTES[quoteIdx]}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        background: 'rgba(192,36,42,0.15)',
                        border: '1px solid rgba(192,36,42,0.5)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        color: '#ff8080',
                        WebkitTextFillColor: '#ff8080',
                        fontSize: '13px',
                        marginBottom: '16px',
                        textAlign: 'center',
                    }}>{error}</div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '12px' }}>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            style={{
                                display: 'block',
                                width: '100%',
                                boxSizing: 'border-box',
                                padding: '13px 16px',
                                background: 'rgba(40, 15, 15, 0.7)',
                                border: '1px solid rgba(192, 36, 42, 0.35)',
                                borderRadius: '10px',
                                color: '#fff',
                                WebkitTextFillColor: '#fff',
                                fontSize: '14px',
                                fontFamily: 'Inter, sans-serif',
                                outline: 'none',
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '18px' }}>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            style={{
                                display: 'block',
                                width: '100%',
                                boxSizing: 'border-box',
                                padding: '13px 16px',
                                background: 'rgba(40, 15, 15, 0.7)',
                                border: '1px solid rgba(192, 36, 42, 0.35)',
                                borderRadius: '10px',
                                color: '#fff',
                                WebkitTextFillColor: '#fff',
                                fontSize: '14px',
                                fontFamily: 'Inter, sans-serif',
                                outline: 'none',
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '15px',
                            background: loading ? '#3a1010' : 'linear-gradient(135deg, #8b1a1a 0%, #c0242a 50%, #8b1a1a 100%)',
                            border: '1px solid rgba(192,36,42,0.6)',
                            borderRadius: '10px',
                            color: '#fff',
                            WebkitTextFillColor: '#fff',
                            fontSize: '17px',
                            fontWeight: 800,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            fontFamily: "'Teko', sans-serif",
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: loading ? 'none' : '0 4px 28px rgba(192,36,42,0.45)',
                            opacity: loading ? 0.6 : 1,
                        }}
                    >
                        {loading ? 'PROCESSING...' : (isLogin ? '⚔ ENTER THE ARENA' : '🔥 CREATE ACCOUNT')}
                    </button>
                </form>

                {/* Toggle */}
                <p
                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                    style={{
                        marginTop: '18px',
                        textAlign: 'center',
                        fontSize: '13px',
                        color: '#a07070',
                        WebkitTextFillColor: '#a07070',
                        cursor: 'pointer',
                        userSelect: 'none',
                    }}
                >
                    {isLogin
                        ? <span>No account? <span style={{ color: '#c0242a', WebkitTextFillColor: '#c0242a', fontWeight: 700 }}>Join the Warriors</span></span>
                        : <span>Already forged? <span style={{ color: '#c0242a', WebkitTextFillColor: '#c0242a', fontWeight: 700 }}>Sign In</span></span>
                    }
                </p>

                {/* Footer */}
                <div style={{
                    marginTop: '24px',
                    borderTop: '1px solid rgba(192,36,42,0.15)',
                    paddingTop: '14px',
                    textAlign: 'center',
                    fontSize: '9px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: '#5a3030',
                    WebkitTextFillColor: '#5a3030',
                }}>
                    HABIT DASHBOARD · STAY HARD
                </div>
            </div>
        </div>
    );
}
