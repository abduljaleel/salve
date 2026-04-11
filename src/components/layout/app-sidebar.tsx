"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Settings,
  type LucideIcon,
  Boxes,
  BarChart3,
  FileText,
  Users,
  Shield,
  Zap,
  GitBranch,
  Brain,
  Target,
  Film,
  Heart,
  Bolt,
  Globe,
  Car,
  AlertTriangle,
  Key,
  Play,
  CheckSquare,
  BookOpen,
  Compass,
  Palette,
  Activity,
  MapPin,
  Radio,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  settings: Settings,
  boxes: Boxes,
  chart: BarChart3,
  file: FileText,
  users: Users,
  shield: Shield,
  zap: Zap,
  git: GitBranch,
  brain: Brain,
  target: Target,
  film: Film,
  heart: Heart,
  bolt: Bolt,
  globe: Globe,
  car: Car,
  alert: AlertTriangle,
  key: Key,
  play: Play,
  check: CheckSquare,
  book: BookOpen,
  compass: Compass,
  palette: Palette,
  activity: Activity,
  map: MapPin,
  radio: Radio,
};

interface AppSidebarProps {
  appName: string;
  navItems: { title: string; href: string; icon: string; badge?: string }[];
}

export function AppSidebar({ appName, navItems }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            {appName.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-lg">{appName}</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = iconMap[item.icon] || LayoutDashboard;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      render={<Link href={item.href} />}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname === "/settings"}
              render={<Link href="/settings" />}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
