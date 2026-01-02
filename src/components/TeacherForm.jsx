import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateTeacherFortune } from '../utils/fortuneLogic';
import LoadingPage from './LoadingPage';

const TeacherForm = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [birthTime, setBirthTime] = useState('모름');
    const [grade, setGrade] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !dob) return;

        setIsLoading(true);
        try {
            const [result] = await Promise.all([
                calculateTeacherFortune(name, dob, birthTime),
                new Promise(resolve => setTimeout(resolve, 3000))
            ]);
            navigate('/teacher/result', {
                state: {
                    name,
                    age: result.age,
                    zodiac: result.zodiac,
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
                    선생님 정보 입력
                </h2>

                <form onSubmit={handleSubmit}>
                    <label className="label">성함</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="성함을 입력해주세요"
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

                    <label className="label">현재 담당 학년 (선택)</label>
                    <select
                        className="input-field"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        disabled={isLoading}
                    >
                        <option value="">선택해주세요</option>
                        <option value="1">1학년</option>
                        <option value="2">2학년</option>
                        <option value="3">3학년</option>
                        <option value="4">4학년</option>
                        <option value="5">5학년</option>
                        <option value="6">6학년</option>
                        <option value="other">전담/기타</option>
                    </select>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ marginTop: '10px' }}
                        disabled={isLoading}
                    >
                        2026년 교실 기운 확인하기
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TeacherForm;
