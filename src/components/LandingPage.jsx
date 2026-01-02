import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="fade-in-up" style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="floating" style={{ marginBottom: '30px' }}>
                <img
                    src="/image/hores_children.png"
                    alt="New Year Horse"
                    style={{ width: '280px', height: 'auto', filter: 'drop-shadow(0 10px 20px rgba(139, 0, 0, 0.15))' }}
                />
            </div>

            <h1 style={{ fontSize: '2.2rem', color: 'var(--color-primary)', marginBottom: '8px' }}>
                2026 병오년
            </h1>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--color-gold)', marginBottom: '40px', fontWeight: '600' }}>
                신년 학교생활 대운(大運)
            </h2>

            <div className="card" style={{ marginBottom: '40px', padding: '24px' }}>
                <p style={{ fontSize: '1.05rem', color: 'var(--color-text)', lineHeight: '1.8' }}>
                    붉은 말의 기운이 가득한 2026년,<br />
                    선생님과 학생의 앞날에<br />
                    <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>따뜻한 복(福)</span>이 깃들기를 기원합니다.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <button
                    className="btn-primary"
                    onClick={() => navigate('/teacher')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        height: '70px'
                    }}
                >
                    <span style={{ fontSize: '1.5rem' }}>👩‍🏫</span>
                    <span>선생님 운세 보기</span>
                </button>

                <button
                    className="btn-primary"
                    onClick={() => navigate('/student')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        height: '70px',
                        background: 'linear-gradient(135deg, #2C2C2C, #4A4A4A)'
                    }}
                >
                    <span style={{ fontSize: '1.5rem' }}>🧒</span>
                    <span>학생 운세 보기</span>
                </button>
            </div>

            <p style={{ marginTop: '40px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                * 본 서비스는 재미로 보는 신년 가이드입니다.
            </p>
        </div>
    );
};

export default LandingPage;
