import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import Icon from '@/components/ui/Icon'

interface NavItem {
  path: string
  label: string
  icon: string
}

const mainNav: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: 'dashboard' },
  { path: '/properties', label: 'Properties', icon: 'properties' },
  { path: '/units', label: 'Units', icon: 'properties' },
  { path: '/tenants', label: 'Tenants', icon: 'tenants' },
  { path: '/leases', label: 'Leases', icon: 'properties' },
]

const workNav: NavItem[] = [
  { path: '/maintenance', label: 'Maintenance', icon: 'maintenance' },
  { path: '/work-orders', label: 'Work Orders', icon: 'work-orders' },
  { path: '/scheduling', label: 'Scheduling', icon: 'work-orders' },
]

const opsNav: NavItem[] = [
  { path: '/employees', label: 'Employees', icon: 'tenants' },
  { path: '/inventory', label: 'Inventory', icon: 'work-orders' },
  { path: '/equipment', label: 'Equipment', icon: 'work-orders' },
  { path: '/vendors', label: 'Vendors', icon: 'work-orders' },
]

const commsNav: NavItem[] = [
  { path: '/documents', label: 'Documents', icon: 'work-orders' },
  { path: '/messages', label: 'Messages', icon: 'work-orders' },
  { path: '/notifications', label: 'Notifications', icon: 'work-orders' },
]

const toolsNav: NavItem[] = [
  { path: '/reports', label: 'Reports', icon: 'work-orders' },
  { path: '/analytics', label: 'Analytics', icon: 'work-orders' },
  { path: '/ai', label: 'AI Assistant', icon: 'work-orders' },
]

const adminNav: NavItem[] = [
  { path: '/admin', label: 'Administration', icon: 'settings' },
  { path: '/audit', label: 'Audit Log', icon: 'work-orders' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
]

function NavSection({ items, currentPath, onNavigate }: {
  items: NavItem[]
  currentPath: string
  onNavigate: (path: string) => void
}) {
  return (
    <div className="space-y-0.5">
      {items.map((item) => {
        const isActive = currentPath === item.path ||
          (item.path !== '/' && currentPath.startsWith(item.path))
        return (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="text-base"><Icon name={item.icon} className="w-5 h-5 text-gray-600" /></span>
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleNav = (path: string) => {
    navigate(path)
  }

  return (
    <div className={`h-full bg-white text-slate-900 ${collapsed ? 'px-2' : 'px-4'} py-6 shadow-xl`}>
      <div className="mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 text-sm font-bold shadow-sm">CO</div>
          {!collapsed && (
            <div>
              <div className="text-sm font-semibold">Company OS</div>
              <div className="text-xs text-slate-400">Property operations hub</div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <NavSection items={mainNav} currentPath={location.pathname} onNavigate={handleNav} />
      </div>

      <div className="mt-8 space-y-1">
        <p className={`text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500 ${collapsed ? 'hidden' : ''}`}>Work</p>
        <NavSection items={workNav} currentPath={location.pathname} onNavigate={handleNav} />
      </div>

      <div className="mt-8 space-y-1">
        <p className={`text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500 ${collapsed ? 'hidden' : ''}`}>Operations</p>
        <NavSection items={opsNav} currentPath={location.pathname} onNavigate={handleNav} />
      </div>

      <div className="mt-auto px-2 py-4 border-t border-slate-200">
        {!collapsed && (
          <div className="mb-3 text-xs text-slate-400">Signed in as</div>
        )}
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 shadow-sm">
          <div className="h-11 w-11 rounded-2xl bg-slate-700 flex items-center justify-center text-white font-semibold">A</div>
          {!collapsed && (
            <div>
              <div className="text-sm font-medium text-white">Alex Rowan</div>
              <div className="text-xs text-slate-400">Operations Lead</div>
            </div>
          )}
        </div>
        {!collapsed && (
          <button onClick={logout}
            className="mt-4 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-100 transition hover:bg-slate-800">
            Sign Out
          </button>
        )}
      </div>
    </div>
  )
}
