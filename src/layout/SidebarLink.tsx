import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSidebar } from '../context/SidebarContext'
import { ChevronDownIcon } from '../icons'

interface NavItem {
  name: string
  icon: React.ReactNode
  path?: string
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[]
}

interface SidebarLinkProps {
  item: NavItem
}

function SidebarLink({ item }: SidebarLinkProps) {
  const { pathname } = useLocation()
  const { isExpanded, isHovered } = useSidebar()
  const [isOpen, setIsOpen] = useState(false)

  const hasSubItems = item.subItems && item.subItems.length > 0
  const isLinkActive = (path?: string) => path && pathname === path
  const isGroupActive = (subItems?: any[]) =>
    subItems && subItems.some(sub => pathname.includes(sub.path))

  const handleToggle = () => {
    if (hasSubItems) {
      setIsOpen(!isOpen)
    }
  }

  const showText = isExpanded || isHovered

  if (hasSubItems) {
    return (
      <li
        className={`mb-1.5 flex flex-col gap-1.5 ${
          isGroupActive(item.subItems) ? 'text-white' : 'text-gray-500'
        }`}
      >
        <button
          onClick={handleToggle}
          className={`flex w-full items-center justify-between rounded-lg px-4 py-2 text-left font-medium duration-300 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-700 ${
            isGroupActive(item.subItems)
              ? 'bg-gray-200 dark:bg-gray-700'
              : ''
          }`}
        >
          <div className="flex items-center gap-3.5">
            {item.icon}
            {showText && <span>{item.name}</span>}
          </div>
          {showText && (
            <ChevronDownIcon
              className={`transform transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          )}
        </button>
        {isOpen && (
          <ul className="flex flex-col gap-1.5 pl-8 pt-1.5">
            {item.subItems?.map(subItem => (
              <li key={subItem.name}>
                <Link
                  to={subItem.path}
                  className={`block rounded-md px-4 py-2 text-sm duration-300 ease-in-out hover:text-white ${
                    isLinkActive(subItem.path) ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {subItem.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <li>
      <Link
        to={item.path || '#'}
        className={`flex items-center gap-3.5 rounded-lg px-4 py-2 font-medium duration-300 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-700 ${
          isLinkActive(item.path)
            ? 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white'
            : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        {item.icon}
        {showText && <span>{item.name}</span>}
      </Link>
    </li>
  )
}

export default SidebarLink 