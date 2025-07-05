import { Link } from '@inertiajs/react'
import { usePage } from '@inertiajs/react'
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { LayoutDashboard, Users, Package, MapPin, Receipt } from 'lucide-react'

export function NavMain() {
  const page = usePage()
  
  return (
    <SidebarGroup className="px-2 py-0">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={page.url === '/dashboard'}>
            <Link href="/dashboard" prefetch>
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={page.url === '/customers'}>
            <Link href="/customers" prefetch>
              <Users className="h-4 w-4" />
              <span>Customers</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={page.url === '/plans'}>
            <Link href="/plans" prefetch>
              <Package className="h-4 w-4" />
              <span>Internet Plans</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={page.url === '/coverage'}>
            <Link href="/coverage" prefetch>
              <MapPin className="h-4 w-4" />
              <span>Coverage</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={page.url === '/billing'}>
            <Link href="/billing" prefetch>
              <Receipt className="h-4 w-4" />
              <span>Billing</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
