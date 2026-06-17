import { Link } from 'react-router-dom';
import { CalendarDays, Wallet, ArrowRight } from 'lucide-react';
import type { Project } from '../../types/project';
import type { Transaction } from '../../types/transaction';
import { formatCurrency, formatPercent, formatShortDate } from '../../utils/format';
import { computeProjectStats } from '../../utils/projectUtils';

interface ProjectCardProps {
  project: Project;
  transactions: Transaction[];
}

export function ProjectCard({ project, transactions }: ProjectCardProps) {
  const stats = computeProjectStats(project, transactions);

  return (
    <Link
      to={`/projetos/${project.id}`}
      className="block bg-surface border border-border rounded-xl p-5 hover:border-border/80 transition-colors duration-150 group"
      style={{ borderLeftColor: project.color, borderLeftWidth: '3px' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 mr-3">
          <h3 className="text-sm font-semibold text-primary group-hover:text-accent transition-colors duration-150">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-xs text-muted mt-0.5 truncate">{project.description}</p>
          )}
        </div>
        <ArrowRight size={15} className="text-muted group-hover:text-accent transition-colors duration-150 shrink-0 mt-0.5" />
      </div>

      {project.budget !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted">Progresso</span>
            <span className="text-xs font-medium text-secondary">
              {formatPercent(Math.min(stats.progressPercent ?? 0, 100))}
            </span>
          </div>
          <div className="h-1.5 bg-surface-raised rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(stats.progressPercent ?? 0, 100)}%`,
                backgroundColor: project.color,
              }}
              role="progressbar"
              aria-valuenow={Math.round(stats.progressPercent ?? 0)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-muted">
        {project.budget !== undefined && (
          <div className="flex items-center gap-1">
            <Wallet size={12} />
            <span>
              {formatCurrency(stats.totalExpenses)} / {formatCurrency(project.budget)}
            </span>
          </div>
        )}
        {project.deadline && (
          <div className="flex items-center gap-1">
            <CalendarDays size={12} />
            <span>{formatShortDate(project.deadline)}</span>
          </div>
        )}
        {!project.impactsBalance && (
          <span className="px-1.5 py-0.5 rounded bg-surface-raised text-muted">Independente</span>
        )}
      </div>
    </Link>
  );
}
