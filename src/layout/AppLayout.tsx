import { Outlet } from 'react-router'
import AppHeader from './AppHeader'
import AppSidebar from './AppSidebar'
import { SidebarProvider } from '../context/SidebarContext'

const LayoutContent: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* <!-- ===== Sidebar Start ===== --> */}
      <AppSidebar />
      {/* <!-- ===== Sidebar End ===== --> */}

      {/* <!-- ===== Content Area Start ===== --> */}
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {/* <!-- ===== Header Start ===== --> */}
        <AppHeader />
        {/* <!-- ===== Header End ===== --> */}

        {/* <!-- ===== Main Content Start ===== --> */}
        <main>
          <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            <Outlet />
          </div>
        </main>
        {/* <!-- ===== Main Content End ===== --> */}
      </div>
      {/* <!-- ===== Content Area End ===== --> */}
    </div>
  )
}

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  )
}

export default AppLayout
