import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const StudentResult = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (!state) {
            navigate('/student');
        }
    }, [state, navigate]);

    if (!state) return null;

    const { name, grade, classNum, friendName, result } = state;
    const { studentType, overallTitle, overallSummary, flows, friendCompatibility, advice } = result;

    return (
        <div className="fade-in-up">
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: 'var(--color-gold-light)',
                    color: 'var(--color-primary)',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    marginBottom: '12px'
                }}>
                    2026년 병오년 학교생활 가이드
                </div>
                <h1 style={{ fontSize: '1.6rem', color: 'var(--color-primary)', marginBottom: '8px' }}>
                    {name} 어린이의 운세 리포트
                </h1>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    {grade}학년 {classNum}반 • {studentType}
                </p>
            </div>

            {/* 메인 요약 카드 */}
            <div className="card" style={{
                textAlign: 'center',
                marginBottom: '24px',
                background: 'linear-gradient(135deg, #FFFDF9 0%, #FFF5E6 100%)',
                border: '2px solid var(--color-gold-light)',
                padding: '32px 24px'
            }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>✨</div>
                <h2 style={{ fontSize: '1.3rem', color: 'var(--color-primary)', marginBottom: '16px' }}>
                    {overallTitle}
                </h2>
                <p style={{ fontSize: '1rem', lineHeight: '1.8', color: 'var(--color-text)', whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}>
                    {overallSummary}
                </p>
            </div>

            {/* 영역별 흐름 카드 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                {flows.map((flow, index) => (
                    <div key={index} className="card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '1.2rem' }}>
                                    {flow.category === '공부' ? '📖' : flow.category === '친구' ? '🤝' : '🏫'}
                                </span>
                                <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{flow.category}</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--color-gold)', background: '#FFF9E6', padding: '2px 8px', borderRadius: '10px' }}>
                                    {flow.luckType}
                                </span>
                            </div>
                            <span style={{ fontWeight: '800', color: 'var(--color-primary)' }}>{flow.score}점</span>
                        </div>
                        <div style={{ width: '100%', height: '10px', background: '#F0F0F0', borderRadius: '5px', marginBottom: '12px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${flow.score}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, var(--color-gold-light), var(--color-gold))',
                                transition: 'width 1s ease-out'
                            }} />
                        </div>
                        <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#555', whiteSpace: 'pre-wrap' }}>
                            {flow.text}
                        </p>
                    </div>
                ))}
            </div>

            {/* 친구 확률 카드 (선택) */}
            {friendName && friendCompatibility && (
                <div className="card" style={{
                    marginBottom: '24px',
                    background: '#FFF0F5',
                    border: '1px solid #FFB6C1',
                    textAlign: 'center'
                }}>
                    <h3 style={{ fontSize: '1rem', color: '#D02090', marginBottom: '12px' }}>
                        💖 {friendName} 친구와 같은 반이 될 확률
                    </h3>
                    <div style={{ fontSize: '2rem', fontWeight: '900', color: '#D02090', marginBottom: '12px' }}>
                        {friendCompatibility.probability}%
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#D02090', opacity: 0.8, whiteSpace: 'pre-wrap' }}>
                        {friendCompatibility.message}
                    </p>
                </div>
            )}

            {/* 한 줄 조언 */}
            <div className="card" style={{
                marginBottom: '32px',
                textAlign: 'center',
                background: 'var(--color-primary)',
                color: 'white',
                padding: '24px'
            }}>
                <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '8px' }}>🍀 행운을 부르는 한 줄 조언</div>
                <p style={{ fontSize: '1.1rem', fontWeight: '700', letterSpacing: '0.5px' }}>
                    "{advice}"
                </p>
            </div>

            <button
                className="btn-primary"
                onClick={() => navigate('/')}
            >
                메인으로 돌아가기
            </button>
        </div>
    );
};

export default StudentResult;
