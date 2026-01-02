import React, { useEffect, useState } from 'react';

const LoadingPage = () => {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'var(--color-bg)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            overflow: 'hidden'
        }}>
            {/* Shimmering Background Effect */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
                zIndex: -1
            }} />

            <div style={{
                width: '100%',
                height: '50vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px'
            }}>
                <img
                    src="/image/천기누설.png"
                    alt="천기누설"
                    className="loading-image"
                    style={{
                        maxHeight: '100%',
                        maxWidth: '90%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.3))'
                    }}
                />
            </div>

            <div className="fade-in-up" style={{ marginTop: '40px', textAlign: 'center' }}>
                <div style={{
                    display: 'inline-block',
                    padding: '10px 24px',
                    borderRadius: '30px',
                    background: 'rgba(139, 0, 0, 0.05)',
                    border: '1px solid var(--color-border)',
                    marginBottom: '20px'
                }}>
                    <h2 style={{ color: 'var(--color-primary)', fontSize: '1.2rem', margin: 0 }}>
                        천기누설 중{dots}
                    </h2>
                </div>
                <p className="loading-text" style={{
                    color: 'var(--color-gold)',
                    fontSize: '1rem',
                    fontWeight: '700',
                    letterSpacing: '2px'
                }}>
                    LOADING
                </p>
            </div>

            <style>{`
        @keyframes pulseGold {
          0% { opacity: 0.4; transform: scale(0.98); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 0.4; transform: scale(0.98); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .loading-text {
          animation: pulseGold 2s infinite ease-in-out;
        }
        .loading-image {
          animation: float 4s infinite ease-in-out;
        }
      `}</style>
        </div>
    );
};

export default LoadingPage;
