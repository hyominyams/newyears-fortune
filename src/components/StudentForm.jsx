import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateStudentFortune } from '../utils/fortuneLogic';
import LoadingPage from './LoadingPage';

const StudentForm = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [birthTime, setBirthTime] = useState('모름');
    const [grade, setGrade] = useState('1');
    const [classNum, setClassNum] = useState('');

    const [showFriend, setShowFriend] = useState(false);
    const [friendName, setFriendName] = useState('');
    const [friendDob, setFriendDob] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !dob) return;

        setIsLoading(true);
        try {
            const [result] = await Promise.all([
                calculateStudentFortune(name, dob, birthTime, grade, showFriend ? friendName : null, showFriend ? friendDob : null),
                new Promise(resolve => setTimeout(resolve, 3000))
            ]);
            navigate('/student/result', {
                state: {
                    name,
                    grade,
                    classNum,
                    friendName: showFriend ? friendName : null,
                    result
                }
            });
        } catch (error) {
            alert("운세를 불러오는 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <LoadingPage />;

    return (
        <div className="fade-in-up">
            <button
                onClick={() => navigate(-1)}
                style={{ marginBottom: '24px', background: 'none', color: 'var(--color-text-muted)', fontSize: '0.9rem', border: 'none', cursor: 'pointer' }}
            >
                ← 돌아가기
            </button>

            <div className="card">
                <h2 style={{ textAlign: 'center', marginBottom: '32px', color: 'var(--color-primary)', fontSize: '1.6rem' }}>
                    학생 정보 입력
                </h2>

                <form onSubmit={handleSubmit}>
                    <label className="label">이름</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="이름을 입력해주세요"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={isLoading}
                    />

                    <label className="label">생년월일</label>
                    <input
                        type="date"
                        className="input-field"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        required
                        disabled={isLoading}
                    />

                    <label className="label">태어난 시각</label>
                    <select
                        className="input-field"
                        value={birthTime}
                        onChange={(e) => setBirthTime(e.target.value)}
                        disabled={isLoading}
                    >
                        <option value="새벽 (05~09)">새벽 (05~09)</option>
                        <option value="오전 (09~13)">오전 (09~13)</option>
                        <option value="오후 (13~17)">오후 (13~17)</option>
                        <option value="저녁 (17~21)">저녁 (17~21)</option>
                        <option value="밤 (21~01)">밤 (21~01)</option>
                        <option value="모름">모름</option>
                    </select>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label className="label">현재 학년</label>
                            <select
                                className="input-field"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                disabled={isLoading}
                            >
                                {[1, 2, 3, 4, 5, 6].map(g => <option key={g} value={g}>{g}학년</option>)}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="label">현재 반</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="1"
                                value={classNum}
                                onChange={(e) => setClassNum(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '10px', marginBottom: '24px' }}>
                        <button
                            type="button"
                            onClick={() => setShowFriend(!showFriend)}
                            style={{
                                background: 'none',
                                color: 'var(--color-gold)',
                                textDecoration: 'none',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                            disabled={isLoading}
                        >
                            {showFriend ? '[-] 친구 정보 숨기기' : '[+] 친구와 같은 반 확률 확인하기'}
                        </button>

                        {showFriend && (
                            <div className="fade-in-up" style={{ marginTop: '16px', padding: '20px', background: '#F9F4EE', borderRadius: '12px', border: '1px dashed var(--color-gold)' }}>
                                <label className="label">친구 이름</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="친구 이름을 입력해주세요"
                                    value={friendName}
                                    onChange={(e) => setFriendName(e.target.value)}
                                    disabled={isLoading}
                                />
                                <label className="label">친구 생년월일</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={friendDob}
                                    onChange={(e) => setFriendDob(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isLoading}
                    >
                        2026년 학교생활 미리보기
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StudentForm;
