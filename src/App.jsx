import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import TeacherForm from './components/TeacherForm';
import TeacherResult from './components/TeacherResult';
import StudentForm from './components/StudentForm';
import StudentResult from './components/StudentResult';

function App() {
  return (
    <Router>
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/teacher" element={<TeacherForm />} />
          <Route path="/teacher/result" element={<TeacherResult />} />
          <Route path="/student" element={<StudentForm />} />
          <Route path="/student/result" element={<StudentResult />} />
        </Routes>
      </div>
      <footer className="text-center" style={{ marginTop: '60px', padding: '20px 0', borderTop: '1px solid var(--color-border)' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
          본 서비스는 재미와 참고를 위한 콘텐츠이며<br />
          실제 학년 배정, 반 편성, 교육적 판단과는 무관합니다.<br />
          <span style={{ color: 'var(--color-gold)', fontWeight: '600' }}>© 2026 Junhyo Park (jhjhpark0800@gmail.com)</span>
        </p>
      </footer>
    </Router>
  );
}

export default App;
