import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Wallet, TrendingDown, TrendingUp, Target } from 'lucide-react';
import { useProject } from '../hooks/useProject';
import { computeProjectStats, computeEvolutionData } from '../utils/projectUtils';
import { formatCurrency, formatPercent, formatShortDate } from '../utils/format';
import { ProjectMetricCard } from '../components/projects/ProjectMetricCard';
import { ProjectEvolutionChart } from '../components/projects/ProjectEvolutionChart';
import { ProjectTransactions } from '../components/projects/ProjectTransactions';
import { ProjectIndicators } from '../components/projects/ProjectIndicators';

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { project, transactions, isLoading, hasError } = useProject(projectId ?? '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-secondary text-sm">Carregando projeto...</p>
      </div>
    );
  }

  if (hasError || !project) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-negative text-sm">Projeto não encontrado.</p>
      </div>
    );
  }

  const stats = computeProjectStats(project, transactions);
  const evolutionData = computeEvolutionData(transactions, project.budget);

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div>
        <Link
          to="/projetos"
          className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors duration-150 mb-4"
        >
          <ArrowLeft size={13} />
          Projetos
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full shrink-0 mt-1"
              style={{ backgroundColor: project.color }}
            />
            <div>
              <h1 className="text-lg font-semibold text-primary">{project.name}</h1>
              {project.description && (
                <p className="text-xs text-secondary mt-0.5">{project.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {!project.impactsBalance && (
              <span className="px-2 py-1 text-xs rounded-md bg-surface-raised border border-border text-muted">
                Independente
              </span>
            )}
            {project.deadline && (
              <div className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-surface-raised border border-border text-secondary">
                <CalendarDays size={11} />
                {formatShortDate(project.deadline)}
              </div>
            )}
            {project.budget !== undefined && (
              <div className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-surface-raised border border-border text-secondary">
                <Wallet size={11} />
                {formatCurrency(project.budget)}
              </div>
            )}
          </div>
        </div>

        {project.budget !== undefined && stats.progressPercent !== undefined && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5 text-xs text-muted">
              <span>{formatCurrency(stats.totalExpenses)} gastos</span>
              <span>{formatPercent(Math.min(stats.progressPercent, 100))} do orçamento</span>
            </div>
            <div className="h-2 bg-surface-raised rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(stats.progressPercent, 100)}%`,
                  backgroundColor: project.color,
                }}
                role="progressbar"
                aria-valuenow={Math.round(stats.progressPercent)}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProjectMetricCard
          title="Total Gasto"
          displayValue={formatCurrency(stats.totalExpenses)}
          icon={TrendingDown}
          variant="expense"
        />
        <ProjectMetricCard
          title="Orçamento Restante"
          displayValue={
            stats.remaining === undefined
              ? '—'
              : stats.remaining < 0
                ? `-${formatCurrency(Math.abs(stats.remaining))}`
                : formatCurrency(stats.remaining)
          }
          icon={Wallet}
          variant={
            stats.remaining === undefined
              ? 'default'
              : stats.remaining < 0
                ? 'expense'
                : 'income'
          }
          subtitle={project.budget === undefined ? 'Sem orçamento definido' : undefined}
        />
        <ProjectMetricCard
          title="Entradas do Projeto"
          displayValue={stats.totalIncome > 0 ? formatCurrency(stats.totalIncome) : '—'}
          icon={TrendingUp}
          variant={stats.totalIncome > 0 ? 'income' : 'default'}
        />
        <ProjectMetricCard
          title="Progresso"
          displayValue={
            stats.progressPercent !== undefined
              ? formatPercent(stats.progressPercent)
              : '—'
          }
          icon={Target}
          variant={
            stats.progressPercent === undefined
              ? 'default'
              : stats.progressPercent > 100
                ? 'expense'
                : stats.progressPercent > 80
                  ? 'warning'
                  : 'income'
          }
          subtitle={project.budget === undefined ? 'Sem orçamento definido' : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ProjectEvolutionChart data={evolutionData} projectColor={project.color} />
        </div>
        <div className="lg:col-span-1">
          <ProjectIndicators stats={stats} />
        </div>
      </div>

      <ProjectTransactions transactions={transactions} />
    </div>
  );
}
