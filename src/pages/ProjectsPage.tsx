import { useState } from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import { useProjectsContext } from '../contexts/ProjectsContext';
import { ProjectCard } from '../components/projects/ProjectCard';
import { CreateProjectForm } from '../components/projects/CreateProjectForm';
import { Modal } from '../components/ui/Modal';
import { mockProjectTransactions } from '../mocks/projectTransactions';
import type { CreateProjectData } from '../types/project';

export function ProjectsPage() {
  const { projects, addProject } = useProjectsContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreateProject(data: CreateProjectData) {
    setIsSubmitting(true);
    await addProject(data);
    setIsSubmitting(false);
    setIsModalOpen(false);
  }

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-primary">Projetos</h1>
          <p className="text-xs text-secondary mt-0.5">
            Gerencie orçamentos e metas por projeto
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors duration-150"
        >
          <Plus size={15} />
          Novo Projeto
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl">
          <FolderOpen size={40} className="text-muted mb-4" strokeWidth={1.25} />
          <p className="text-sm text-secondary mb-1">Nenhum projeto criado ainda</p>
          <p className="text-xs text-muted mb-5">
            Crie um projeto para organizar gastos específicos
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors duration-150"
          >
            <Plus size={15} />
            Criar Primeiro Projeto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const transactions = mockProjectTransactions.filter(
              (t) => t.projectId === project.id,
            );
            return (
              <ProjectCard key={project.id} project={project} transactions={transactions} />
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Projeto"
      >
        <CreateProjectForm
          onSubmit={handleCreateProject}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}
