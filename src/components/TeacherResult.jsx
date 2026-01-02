import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TeacherResult = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (!state) {
            navigate('/teacher');
        }
    }, [state, navigate]);

    if (!state) return null;

    const { name, age, zodiac, result } = state;
    const {
        fortuneStage,
        finalPredictionExplain,
        managementAdvice,
        uiHints
    } = result;

    // 운수 단계별 스타일
    const getStageStyle = (key) => {
        if (key.includes('대운') || key.includes('대성')) return { color: '#FFD700', icon: '🐲', bg: '#2C2C2C', border: '#FFD700' };
        if (key.includes('합운')) return { color: '#E74C3C', icon: '🌸', bg: '#FFF5F5', border: '#E74C3C' };
        if (key.includes('평운')) return { color: '#3498DB', icon: '🌊', bg: '#F0F8FF', border: '#3498DB' };
        return { color: '#95A5A6', icon: '⚡', bg: '#F5F5F5', border: '#95A5A6' };
    };

    const stageStyle = getStageStyle(fortuneStage.key);

    // Image Path Logic
    const getImagePath = () => {
        if (uiHints.primaryCardId === 'SUBJECT') return "/image/tarot_subject.png";
        const gNum = uiHints.primaryCardId.replace('G', '');
        return `/image/tarot_${gNum}.png`;
    };

    return (
        <div className="fade-in-up" style={{ paddingBottom: '60px', maxWidth: '600px', margin: '0 auto' }}>

            {/* HEADER: Name & Meta */}
            <div style={{ textAlign: 'center', marginBottom: '24px', paddingTop: '20px' }}>
                <h1 style={{ fontSize: '1.6rem', color: '#333', marginBottom: '8px', fontWeight: '700' }}>
                    {name} 선생님의<br />2026년 연운 예측
                </h1>
                <div style={{ fontSize: '0.95rem', color: '#666' }}>
                    {age}세 ({zodiac}띠) | 붉은 말의 해
                </div>
            </div>

            {/* SECTION 1: Fortune Stage Badge (Vertical - Reverted) */}
            <div style={{
                textAlign: 'center',
                background: stageStyle.bg,
                border: `2px solid ${stageStyle.border}`,
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '32px'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>{stageStyle.icon}</div>
                <h3 style={{
                    color: stageStyle.color,
                    fontSize: '1.4rem',
                    marginBottom: '16px',
                    fontWeight: '800',
                    wordBreak: 'keep-all'
                }}>
                    {fortuneStage.key}
                </h3>
                <p style={{
                    fontSize: '1rem',
                    color: '#555',
                    lineHeight: '1.6',
                    margin: 0,
                    wordBreak: 'keep-all',
                    maxWidth: '90%',
                    margin: '0 auto'
                }}>
                    {fortuneStage.explain}
                </p>
            </div>

            {/* SECTION 2: Prediction Card (Grade + Reason) - ABOVE TAROT */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                    background: 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)',
                    borderRadius: '16px',
                    padding: '32px 24px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    color: '#fff',
                    marginBottom: '24px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Decorative Circle */}
                    <div style={{
                        position: 'absolute',
                        top: '-20px',
                        right: '-20px',
                        width: '100px',
                        height: '100px',
                        background: 'rgba(255, 215, 0, 0.1)',
                        borderRadius: '50%'
                    }}></div>

                    {/* Small Header */}
                    <div style={{
                        fontSize: '0.95rem',
                        color: '#aaa',
                        marginBottom: '16px',
                        letterSpacing: '0.5px'
                    }}>
                        2026년 선생님의 예상 학년은
                    </div>

                    {/* Big Grade Text */}
                    <div style={{
                        fontSize: '3rem',
                        fontWeight: '800',
                        color: '#FFD700',
                        marginBottom: '20px',
                        textShadow: '0 2px 10px rgba(255, 215, 0, 0.2)',
                        lineHeight: '1.1'
                    }}>
                        {result.isDaeseong ? "교과전담" : `${result.gradeNumber}학년`}
                    </div>

                    {/* Saju Reason */}
                    <div style={{
                        fontSize: '1.05rem',
                        color: '#eee',
                        lineHeight: '1.6',
                        wordBreak: 'keep-all',
                        fontWeight: '500',
                        padding: '0 10px'
                    }}>
                        "{finalPredictionExplain.sajuReason}"
                    </div>
                </div>

                {/* Tarot Image (Below Prediction) */}
                <div style={{
                    position: 'relative',
                    display: 'inline-block',
                    borderRadius: '12px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    marginBottom: '16px'
                }}>
                    <img
                        src={getImagePath()}
                        alt="Fortune Tarot Card"
                        style={{
                            width: '100%',
                            maxWidth: '240px', // Slightly smaller to emphasize the prediction card
                            borderRadius: '12px',
                            display: 'block'
                        }}
                    />
                </div>
                <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', wordBreak: 'keep-all', maxWidth: '90%', margin: '0 auto' }}>
                    {finalPredictionExplain.whatItMeansInSchool}
                </p>
            </div>

            {/* SECTION 3: Management Advice (Class, Student, Parent) */}
            <div style={{ marginBottom: '40px', marginTop: '40px' }}>
                <h3 style={{
                    fontSize: '1.3rem',
                    color: '#333',
                    marginBottom: '20px',
                    textAlign: 'center',
                    fontWeight: '700'
                }}>
                    🏫 학급 운영 가이드
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Class Operation */}
                    <div style={{ background: '#F9FAFB', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #3498DB' }}>
                        <div style={{ color: '#2980B9', fontWeight: 'bold', marginBottom: '8px', fontSize: '1.1rem' }}>
                            📚 학급 운영
                        </div>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#555', lineHeight: '1.6' }}>
                            {managementAdvice.classOperation}
                        </p>
                    </div>

                    {/* Student Guidance */}
                    <div style={{ background: '#FFF9F0', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #F39C12' }}>
                        <div style={{ color: '#D35400', fontWeight: 'bold', marginBottom: '8px', fontSize: '1.1rem' }}>
                            🌱 학생 지도
                        </div>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#555', lineHeight: '1.6' }}>
                            {managementAdvice.studentGuidance}
                        </p>
                    </div>

                    {/* Parent Communication */}
                    <div style={{ background: '#F0FDF4', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #2ECC71' }}>
                        <div style={{ color: '#27AE60', fontWeight: 'bold', marginBottom: '8px', fontSize: '1.1rem' }}>
                            💬 학부모 상담
                        </div>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#555', lineHeight: '1.6' }}>
                            {managementAdvice.parentCommunication}
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center' }}>
                <button
                    onClick={() => navigate('/teacher')}
                    style={{
                        background: '#333',
                        color: '#fff',
                        border: 'none',
                        padding: '16px 32px',
                        fontSize: '1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                    }}
                >
                    다시 예측하기
                </button>
            </div>
        </div>
    );
};

export default TeacherResult;
