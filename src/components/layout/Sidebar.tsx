import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tag,
  Target,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'transactions', label: 'Transações', icon: ArrowLeftRight, path: '/transacoes' },
  { id: 'categories', label: 'Categorias', icon: Tag, path: '/categorias' },
  { id: 'goals', label: 'Metas', icon: Target, path: '/metas' },
  { id: 'reports', label: 'Relatórios', icon: BarChart2, path: '/relatorios' },
  { id: 'settings', label: 'Configurações', icon: Settings, path: '/configuracoes' },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

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

      <nav className="flex-1 px-2 py-4 space-y-0.5" aria-label="Menu principal">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
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
              <Icon size={17} strokeWidth={1.75} className="shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
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
