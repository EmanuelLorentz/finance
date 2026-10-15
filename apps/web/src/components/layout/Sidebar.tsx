import { useState } from 'react';
import { NavLink, useMatch } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tag,
  Landmark,
  Target,
  BarChart2,
  Settings,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import { useProjectsContext } from '../../hooks/useProjectsContext';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

const TOP_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'transactions', label: 'Transações', icon: ArrowLeftRight, path: '/transacoes' },
  { id: 'categories', label: 'Categorias', icon: Tag, path: '/categorias' },
  { id: 'accounts', label: 'Contas', icon: Landmark, path: '/contas' },
  { id: 'goals', label: 'Metas', icon: Target, path: '/metas' },
];

const BOTTOM_NAV_ITEMS: NavItem[] = [
  { id: 'reports', label: 'Relatórios', icon: BarChart2, path: '/relatorios' },
  { id: 'settings', label: 'Configurações', icon: Settings, path: '/configuracoes' },
];

function NavButton({ item, isCollapsed }: { item: NavItem; isCollapsed: boolean }) {
  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      title={isCollapsed ? item.label : undefined}
      aria-label={item.label}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
          isActive
            ? 'bg-accent/10 text-accent'
            : 'text-secondary hover:text-primary hover:bg-surface-raised'
        } ${isCollapsed ? 'justify-center' : ''}`
      }
    >
      <item.icon size={17} strokeWidth={1.75} className="shrink-0" />
      {!isCollapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const { projects } = useProjectsContext();
  const projectsIndexMatch = useMatch('/projetos');
  const projectsNestedMatch = useMatch('/projetos/*');
  const isOnProjectsRoute = !!projectsIndexMatch || !!projectsNestedMatch;

  return (
    <aside
      className={`relative flex flex-col h-screen bg-surface border-r border-border transition-all duration-200 shrink-0 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
      aria-label="Navegação principal"
    >
      <div
        className={`flex items-center h-16 px-4 border-b border-border ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {isCollapsed ? (
          <span className="text-sm font-bold text-accent">F</span>
        ) : (
          <span className="text-sm font-bold text-accent tracking-tight">FinanceApp</span>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-0.5" aria-label="Menu principal">
        {TOP_NAV_ITEMS.map((item) => (
          <NavButton key={item.id} item={item} isCollapsed={isCollapsed} />
        ))}

        <div className="pt-1">
          {isCollapsed ? (
            <NavLink
              to="/projetos"
              title="Projetos"
              aria-label="Projetos"
              className={({ isActive }) =>
                `flex items-center justify-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive || isOnProjectsRoute
                    ? 'bg-accent/10 text-accent'
                    : 'text-secondary hover:text-primary hover:bg-surface-raised'
                }`
              }
            >
              <FolderOpen size={17} strokeWidth={1.75} />
            </NavLink>
          ) : (
            <>
              <div className="flex items-center">
                <NavLink
                  to="/projetos"
                  end
                  className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isOnProjectsRoute
                      ? 'bg-accent/10 text-accent'
                      : 'text-secondary hover:text-primary hover:bg-surface-raised'
                  }`}
                >
                  <FolderOpen size={17} strokeWidth={1.75} className="shrink-0" />
                  <span>Projetos</span>
                </NavLink>
                {projects.length > 0 && (
                  <button
                    onClick={() => setIsProjectsExpanded((prev) => !prev)}
                    className="flex items-center justify-center w-7 h-7 rounded-md text-muted hover:text-secondary transition-colors duration-150 mr-1"
                    aria-label={isProjectsExpanded ? 'Recolher projetos' : 'Expandir projetos'}
                  >
                    <ChevronDown
                      size={13}
                      className={`transition-transform duration-150 ${isProjectsExpanded ? '' : '-rotate-90'}`}
                    />
                  </button>
                )}
              </div>

              {isProjectsExpanded && projects.length > 0 && (
                <div className="ml-2 mt-0.5 space-y-0.5 border-l border-border pl-3">
                  {projects.map((project) => (
                    <NavLink
                      key={project.id}
                      to={`/projetos/${project.id}`}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium transition-colors duration-150 ${
                          isActive
                            ? 'text-primary bg-surface-raised'
                            : 'text-muted hover:text-secondary hover:bg-surface-raised'
                        }`
                      }
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="truncate">{project.name}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {BOTTOM_NAV_ITEMS.map((item) => (
          <NavButton key={item.id} item={item} isCollapsed={isCollapsed} />
        ))}
      </nav>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-[4.5rem] flex items-center justify-center w-6 h-6 bg-surface border border-border rounded-full text-secondary hover:text-primary transition-colors duration-150 z-10"
        aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
      >
        {isCollapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
      </button>
    </aside>
  );
}
