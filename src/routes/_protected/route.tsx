import { AppSidebar } from '#/components/sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '#/components/ui/sidebar';
import { getCurrentUserFn, logoutFn } from '#/server/auth'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected')({
  beforeLoad: async ({ location }) => {
    const user = await getCurrentUserFn();

    if (!user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SidebarTrigger className='m-2' />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
