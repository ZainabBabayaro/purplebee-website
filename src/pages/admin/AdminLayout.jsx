import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, LogOut, ExternalLink } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { LogoLockupLight } from '../../components/Logo.jsx'

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/admin/orders', label: 'Orders', Icon: ShoppingBag },
  { to: '/admin/inventory', label: 'Inventory', Icon: Package },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/admin')
  }

  return (
    <div className="flex min-h-screen bg-plum-900">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-plum-800 md:flex">
        <div className="px-6 py-6">
          <LogoLockupLight />
        </div>

        <nav className="flex-1 space-y-1 px-3" aria-label="Admin navigation">
          {links.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-plum-700 text-ivory' : 'text-plum-200 hover:bg-plum-800 hover:text-ivory'
                }`
              }
            >
              <Icon size={17} strokeWidth={1.7} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-plum-800 px-3 py-4 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-plum-300 hover:bg-plum-800 hover:text-ivory"
          >
            <ExternalLink size={16} strokeWidth={1.7} /> View site
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-plum-300 hover:bg-plum-800 hover:text-ivory"
          >
            <LogOut size={16} strokeWidth={1.7} /> Sign out
          </button>
          <div className="px-4 pt-2">
            <p className="truncate text-xs text-plum-400">{user?.email}</p>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-plum-800 bg-plum-900 px-4 py-3 md:hidden">
        <LogoLockupLight />
        <div className="flex gap-1">
          {links.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={({ isActive }) =>
                `flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  isActive ? 'bg-plum-700 text-ivory' : 'text-plum-300 hover:text-ivory'
                }`
              }
            >
              <Icon size={18} strokeWidth={1.7} />
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-plum-300 hover:text-ivory"
          >
            <LogOut size={18} strokeWidth={1.7} />
          </button>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-auto pt-14 md:pt-0">
        <Outlet />
      </div>
    </div>
  )
}
