import { useAuth } from '../context/AuthContext';
import SeniorDashboard from './SeniorDashboard';
import FamilyDashboard from './FamilyDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  if (user?.role === 'family') return <FamilyDashboard />;
  if (user?.role === 'admin') return <AdminDashboard />;
  return <SeniorDashboard />;
};

export default Dashboard;
