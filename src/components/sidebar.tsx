import { Link, useLocation, useRouter } from '@tanstack/react-router'
import { HomeIcon, InfoIcon, LogOutIcon, User } from 'lucide-react'

import { logoutFn } from '#/server/auth'
import { Button } from '#/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '#/components/ui/sidebar'
import { Route } from '#/routes/__root'

const navItems = [
  { title: 'Dashboard', to: '/' as const, icon: HomeIcon },
  { title: 'About', to: '/about' as const, icon: InfoIcon },
]

export function AppSidebar() {
  const router = useRouter()
  const location = useLocation();
  const redirectUrl = location.pathname.slice(1);

  const { user } = Route.useRouteContext();

  console.log(user)

  const handleLogout = async () => {
    await logoutFn()
    await router.navigate({ to: `/login?redirect=%2F${redirectUrl}` })
  }

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <span className="text-base font-semibold tracking-tight">
          Personal Finance
        </span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link to={item.to} activeProps={{ 'data-active': 'true' }}>
                      <item.icon className='text-foreground' />
                      <span className='text-foreground'>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={handleLogout}
        >
          <LogOutIcon className="size-4" />
          <span>Log out</span>
        </Button>
        <SidebarMenuItem className='flex gap-2 items-center justify-center bg-sidebar-accent p-2 rounded-md'>
              <User size={20} />
              <p className='text-sm'>
                {user ? user.email : 'Signed out'}
              </p>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  )
}
