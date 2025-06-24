import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSidebar } from '../context/SidebarContext'
import { Logo } from '../components/common/Logo'
import SidebarLink from './SidebarLink'

import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  TableIcon,
  UserCircleIcon,
  UserIcon,
  FormInputIcon,
  PlugInIcon,
} from '../icons'

type NavItem = {
  name: string
  icon: React.ReactNode
  path?: string
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[]
}

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: 'Dashboard',
    subItems: [{ name: 'Ecommerce', path: '/', pro: false }],
  },
  {
    name: 'User Management',
    icon: <UserIcon />,
    subItems: [
      { name: 'All Users', path: '/users' },
      { name: 'User Role Config', path: '/error-404', pro: false },
    ],
  },

  {
    icon: <CalenderIcon />,
    name: 'Calendar',
    path: '/calendar',
  },
  {
    icon: <UserCircleIcon />,
    name: 'User Profile',
    path: '/profile',
  },
  {
    icon: <BoxCubeIcon />,
    name: 'Inventory Tracker',
    path: '/inventory-tracker',
  },
  {
    icon: <ListIcon />,
    name: 'Quality Lab Job Tracker',
    path: '/quality-lab-tracker',
  },
  {
    icon: <FormInputIcon />,
    name: 'Digital Forms',
    path: '/digital-forms',
  },
  {
    name: 'Forms',
    icon: <ListIcon />,
    subItems: [{ name: 'Form Elements', path: '/form-elements', pro: false }],
  },
  {
    name: 'Tables',
    icon: <TableIcon />,
    subItems: [{ name: 'Basic Tables', path: '/basic-tables', pro: false }],
  },
  {
    name: 'Pages',
    icon: <PageIcon />,
    subItems: [
      { name: 'Blank Page', path: '/blank', pro: false },
      { name: '404 Error', path: '/error-404', pro: false },
    ],
  },
]

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: 'Charts',
    subItems: [
      { name: 'Line Chart', path: '/line-chart', pro: false },
      { name: 'Bar Chart', path: '/bar-chart', pro: false },
      { name: 'Pie Chart', path: '/pie-chart', pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: 'UI Elements',
    subItems: [
      { name: 'Alerts', path: '/alerts', pro: false },
      { name: 'Avatar', path: '/avatars', pro: false },
      { name: 'Badge', path: '/badge', pro: false },
      { name: 'Buttons', path: '/buttons', pro: false },
      { name: 'Images', path: '/images', pro: false },
      { name: 'Videos', path: '/videos', pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: 'Authentication',
    subItems: [
      { name: 'Sign In', path: '/signin', pro: false },
      { name: 'Sign Up', path: '/signup', pro: false },
    ],
  },
]

function AppSidebar() {
  const location = useLocation()
  const { pathname } = location

  const {
    isExpanded,
    toggleSidebar,
    isMobileOpen,
    setIsHovered,
  } = useSidebar()
  const trigger = useRef<HTMLButtonElement>(null)
  const sidebar = useRef<HTMLDivElement>(null)

  const handleMouseEnter = useCallback(() => {
    if (!isExpanded) {
      setIsHovered(true)
    }
  }, [isExpanded, setIsHovered])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [setIsHovered])

  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return
      if (
        !isMobileOpen ||
        sidebar.current.contains(event.target as Node) ||
        trigger.current.contains(event.target as Node)
      )
        return

      toggleSidebar() // Assuming this closes the mobile sidebar
    }
    document.addEventListener('click', clickHandler)
    return () => document.removeEventListener('click', clickHandler)
  }, [isMobileOpen, toggleSidebar])

  return (
    <aside
      ref={sidebar}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`absolute left-0 top-0 z-[9999] flex h-screen w-72 flex-col overflow-y-hidden bg-white duration-300 ease-linear dark:bg-gray-900 lg:static lg:translate-x-0 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      } ${!isExpanded && 'lg:w-[90px]'}`}
    >
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        {(isExpanded || isMobileOpen) && (
          <Link to="/">
            <Logo width={200} height={300} />
          </Link>
        )}

        <button
          onClick={toggleSidebar}
          className="hidden lg:block"
          aria-label="Toggle Sidebar"
        >
          <ChevronDownIcon
            className={`h-5 w-5 transform transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isMobileOpen && (
          <button
            ref={trigger}
            onClick={toggleSidebar}
            aria-controls="sidebar"
            aria-expanded={isMobileOpen}
            className="block lg:hidden"
          >
            {/* SVG for mobile toggle */}
          </button>
        )}
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6">
          <div>
            <h3
              className={`mb-4 ml-4 text-sm font-semibold text-gray-500 dark:text-gray-400 ${
                !isExpanded && 'hidden'
              }`}
            >
              MENU
            </h3>
            <ul className="mb-6 flex flex-col gap-1.5">
              {navItems.map((item, index) => (
                <SidebarLink item={item} key={index} />
              ))}
            </ul>
          </div>
          <div>
            <h3
              className={`mb-4 ml-4 text-sm font-semibold text-gray-500 dark:text-gray-400 ${
                !isExpanded && 'hidden'
              }`}
            >
              OTHERS
            </h3>
            <ul className="mb-6 flex flex-col gap-1.5">
              {othersItems.map((item, index) => (
                <SidebarLink item={item} key={index} />
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  )
}

export default AppSidebar
