import { getCurrentUserFn } from '#/server/auth'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
  beforeLoad: async () => {
    const user = await getCurrentUserFn();

    if (user) {
      throw redirect({ to: "/" })
    }
  }
})

function RouteComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Outlet />
    </div>
  )
}
