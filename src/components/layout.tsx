import { Outlet, NavLink } from 'react-router-dom'
import { Home, Briefcase, Info, User } from 'lucide-react'

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex-1">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white flex justify-around items-center py-2 shadow-lg">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `p-2 ${isActive ? 'text-red-500' : 'text-gray-500'}`
          }
        >
          <Home size={24} />
        </NavLink>
        <NavLink
          to="/invest"
          className={({ isActive }) =>
            `p-2 ${isActive ? 'text-red-500' : 'text-gray-500'}`
          }
        >
          <Briefcase size={24} />
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            `p-2 ${isActive ? 'text-red-500' : 'text-gray-500'}`
          }
        >
          <Info size={24} />
        </NavLink>
        <NavLink
          to="/account"
          className={({ isActive }) =>
            `p-2 ${isActive ? 'text-red-500' : 'text-gray-500'}`
          }
        >
          <User size={24} />
        </NavLink>
      </nav>
    </div>
  )
}

export default Layout
