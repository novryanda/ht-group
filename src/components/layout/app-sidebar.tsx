"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "~/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "~/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Building2,
  Home,
  Settings,
  Users,
  Calculator,
  FileText,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";

const navigationItems = [
  {
    title: "HT-Group Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "PT NILO",
    icon: Building2,
    items: [
      {
        title: "HVAC Rittal",
        items: [
          { title: "Work Orders", url: "/pt-nilo/hvac-rittal/wo" },
          { title: "Checklist & PM", url: "/pt-nilo/hvac-rittal/pm" },
          { title: "Parts & Material", url: "/pt-nilo/hvac-rittal/parts" },
          { title: "Laporan", url: "/pt-nilo/hvac-rittal/report" },
        ],
      },
      {
        title: "HVAC Split",
        items: [
          { title: "Work Orders", url: "/pt-nilo/hvac-split/wo" },
          { title: "PM & Outstanding", url: "/pt-nilo/hvac-split/pm" },
          { title: "Parts & Material", url: "/pt-nilo/hvac-split/parts" },
          { title: "Laporan", url: "/pt-nilo/hvac-split/report" },
        ],
      },
      {
        title: "Fabrikasi",
        items: [
          { title: "Projects / Job Orders", url: "/pt-nilo/fabrikasi/jobs" },
          { title: "Timesheet", url: "/pt-nilo/fabrikasi/timesheet" },
          { title: "Material Issue", url: "/pt-nilo/fabrikasi/materials" },
          { title: "Laporan", url: "/pt-nilo/fabrikasi/report" },
        ],
      },
      {
        title: "Efluen",
        items: [
          { title: "WO / Projects", url: "/pt-nilo/efluen/jobs" },
          { title: "Timesheet", url: "/pt-nilo/efluen/timesheet" },
          { title: "Laporan", url: "/pt-nilo/efluen/report" },
        ],
      },
      {
        title: "HR & Payroll",
        url: "/pt-nilo/hr",
        icon: Users,
      },
      {
        title: "Finance",
        url: "/pt-nilo/finance",
        icon: Calculator,
      },
      {
        title: "Master Data",
        url: "/pt-nilo/master",
        icon: Settings,
      },
    ],
  },
  {
    title: "PT ZTA",
    icon: Building2,
    items: [
      {
        title: "HVAC Rittal",
        items: [
          { title: "Work Orders", url: "/pt-zta/hvac-rittal/wo" },
        ],
      },
      {
        title: "HVAC Split",
        items: [
          { title: "Work Orders", url: "/pt-zta/hvac-split/wo" },
        ],
      },
      {
        title: "HR & Payroll",
        url: "/pt-zta/hr",
        icon: Users,
      },
      {
        title: "Finance",
        url: "/pt-zta/finance",
        icon: Calculator,
      },
    ],
  },
  {
    title: "PT TAM",
    icon: Building2,
    items: [
      {
        title: "Fabrikasi",
        items: [
          { title: "Projects / Job Orders", url: "/pt-tam/fabrikasi/jobs" },
        ],
      },
      {
        title: "HR & Payroll",
        url: "/pt-tam/hr",
        icon: Users,
      },
      {
        title: "Finance",
        url: "/pt-tam/finance",
        icon: Calculator,
      },
    ],
  },
  {
    title: "PT HTK",
    icon: Building2,
    items: [
      {
        title: "Cutting Grass",
        items: [
          { title: "Job Orders", url: "/pt-htk/cutting-grass/jobs" },
        ],
      },
      {
        title: "HR & Payroll",
        url: "/pt-htk/hr",
        icon: Users,
      },
      {
        title: "Finance",
        url: "/pt-htk/finance",
        icon: Calculator,
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<string[]>([]);
  const { data: session } = useSession();

  const toggleItem = (title: string) => {
    setOpenItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Building2 className="h-6 w-6" />
          <span className="font-semibold">HT Group ERP</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.url ? (
                <SidebarMenuButton asChild isActive={pathname === item.url}>
                  <Link href={item.url}>
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              ) : (
                <>
                  <SidebarMenuButton
                    onClick={() => toggleItem(item.title)}
                    className="w-full justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span>{item.title}</span>
                    </div>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        openItems.includes(item.title) && "rotate-90"
                      )}
                    />
                  </SidebarMenuButton>
                  {openItems.includes(item.title) && item.items && (
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          {subItem.url ? (
                            <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                              <Link href={subItem.url}>
                                {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          ) : (
                            <>
                              <SidebarMenuSubButton
                                onClick={() => toggleItem(`${item.title}-${subItem.title}`)}
                                className="w-full justify-between"
                              >
                                <span>{subItem.title}</span>
                                <ChevronRight
                                  className={cn(
                                    "h-4 w-4 transition-transform",
                                    openItems.includes(`${item.title}-${subItem.title}`) && "rotate-90"
                                  )}
                                />
                              </SidebarMenuSubButton>
                              {openItems.includes(`${item.title}-${subItem.title}`) && subItem.items && (
                                <SidebarMenuSub>
                                  {subItem.items.map((nestedItem) => (
                                    <SidebarMenuSubItem key={nestedItem.title}>
                                      <SidebarMenuSubButton asChild isActive={pathname === nestedItem.url}>
                                        <Link href={nestedItem.url}>
                                          <span>{nestedItem.title}</span>
                                        </Link>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  ))}
                                </SidebarMenuSub>
                              )}
                            </>
                          )}
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                    <AvatarFallback className="rounded-lg">
                      {session?.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{session?.user?.name || "User"}</span>
                    <span className="truncate text-xs">{session?.user?.email || ""}</span>
                  </div>
                  <ChevronRight className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                      <AvatarFallback className="rounded-lg">
                        {session?.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{session?.user?.name || "User"}</span>
                      <span className="truncate text-xs">{session?.user?.email || ""}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
