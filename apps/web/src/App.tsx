import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectPage } from './pages/ProjectPage';
import { TransactionsPage } from './pages/TransactionsPage';

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/transacoes" element={<TransactionsPage />} />
        <Route path="/projetos" element={<ProjectsPage />} />
        <Route path="/projetos/:projectId" element={<ProjectPage />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
