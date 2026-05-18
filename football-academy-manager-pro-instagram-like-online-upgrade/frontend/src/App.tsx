import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Protected } from './components/Protected';
import { useAuth } from './auth/AuthContext';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { CoachDashboard } from './pages/CoachDashboard';
import { Students } from './pages/Students';
import { Attendance } from './pages/Attendance';
import { Classes } from './pages/Classes';
import { Payments } from './pages/Payments';
import { Uniforms } from './pages/Uniforms';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { StudentCards } from './pages/StudentCards';
import { ZaloConnect } from './pages/ZaloConnect';
import { Reports } from './pages/Reports';
import { CoachClasses } from './pages/CoachClasses';
import { Schedules } from './pages/Schedules';
import { CoachPayroll } from './pages/CoachPayroll';

function DashboardEntry() {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') return <AdminDashboard />;
  return <CoachDashboard />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected><Layout /></Protected>}>
        <Route index element={<DashboardEntry />} />
        <Route path="classes" element={<Classes />} />
        <Route path="schedules" element={<Schedules />} />
        <Route path="students" element={<Students />} />
        <Route path="student-cards" element={<StudentCards />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="coach-classes" element={<CoachClasses />} />
        <Route path="payments" element={<Payments />} />
        <Route path="coach-payroll" element={<Protected roles={['ADMIN']}><CoachPayroll /></Protected>} />
        <Route path="reports" element={<Protected roles={['ADMIN']}><Reports /></Protected>} />
        <Route path="uniforms" element={<Uniforms />} />
        <Route path="users" element={<Protected roles={['ADMIN']}><Users /></Protected>} />
        <Route path="zalo" element={<Protected roles={['ADMIN']}><ZaloConnect /></Protected>} />
        <Route path="settings" element={<Protected roles={['ADMIN']}><Settings /></Protected>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
