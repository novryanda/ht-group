"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "~/lib/utils";
import { getAccessiblePTCompanies, isGroupLevelUser, getUserPTCompany } from "~/lib/rbac";
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
  Wrench,
  Clipboard,
  Package,
  BarChart3,
  Cog,
} from "lucide-react";

// Define types for navigation
type NavigationItem = {
  title: string;
  url?: string;
  icon?: React.ComponentType<any>;
  items?: NavigationItem[];
};

type PTNavigationData = {
  code: string;
  units: {
    title: string;
    items: {
      title: string;
      url: string;
      icon: React.ComponentType<any>;
    }[];
  }[];
  common: {
    title: string;
    url: string;
    icon: React.ComponentType<any>;
  }[];
};

// Define PT-specific navigation structure
const ptNavigationData: Record<string, PTNavigationData> = {
  "PT NILO": {
    code: "PT-NILO",
    units: [
      {
        title: "HVAC Rittal",
        items: [
          { title: "Work Orders", url: "/pt-nilo/hvac-rittal/work-orders", icon: Wrench },
          { title: "Preventive Maintenance", url: "/pt-nilo/hvac-rittal/pm", icon: Clipboard },
          { title: "Parts & Material", url: "/pt-nilo/hvac-rittal/parts", icon: Package },
          { title: "Reports", url: "/pt-nilo/hvac-rittal/reports", icon: BarChart3 },
        ],
      },
      {
        title: "HVAC Split",
        items: [
          { title: "Work Orders", url: "/pt-nilo/hvac-split/work-orders", icon: Wrench },
          { title: "PM & Outstanding", url: "/pt-nilo/hvac-split/pm", icon: Clipboard },
          { title: "Parts & Material", url: "/pt-nilo/hvac-split/parts", icon: Package },
          { title: "Reports", url: "/pt-nilo/hvac-split/reports", icon: BarChart3 },
        ],
      },
      {
        title: "Fabrikasi",
        items: [
          { title: "Job Orders", url: "/pt-nilo/fabrikasi/jobs", icon: FileText },
          { title: "Timesheet", url: "/pt-nilo/fabrikasi/timesheet", icon: Clipboard },
          { title: "Material Issue", url: "/pt-nilo/fabrikasi/materials", icon: Package },
          { title: "Reports", url: "/pt-nilo/fabrikasi/reports", icon: BarChart3 },
        ],
      },
      {
        title: "Efluen",
        items: [
          { title: "Work Orders", url: "/pt-nilo/efluen/work-orders", icon: Wrench },
          { title: "Timesheet", url: "/pt-nilo/efluen/timesheet", icon: Clipboard },
          { title: "Reports", url: "/pt-nilo/efluen/reports", icon: BarChart3 },
        ],
      },
    ],
    common: [
      { title: "HR & Payroll", url: "/pt-nilo/hr", icon: Users },
      { title: "Finance", url: "/pt-nilo/finance", icon: Calculator },
      { title: "Master Data", url: "/pt-nilo/master", icon: Cog },
    ],
  },
  "PT ZTA": {
    code: "PT-ZTA",
    units: [
      {
        title: "HVAC Rittal",
        items: [
          { title: "Work Orders", url: "/pt-zta/hvac-rittal/work-orders", icon: Wrench },
          { title: "Preventive Maintenance", url: "/pt-zta/hvac-rittal/pm", icon: Clipboard },
          { title: "Parts & Material", url: "/pt-zta/hvac-rittal/parts", icon: Package },
          { title: "Reports", url: "/pt-zta/hvac-rittal/reports", icon: BarChart3 },
        ],
      },
      {
        title: "HVAC Split",
        items: [
          { title: "Work Orders", url: "/pt-zta/hvac-split/work-orders", icon: Wrench },
          { title: "PM & Outstanding", url: "/pt-zta/hvac-split/pm", icon: Clipboard },
          { title: "Parts & Material", url: "/pt-zta/hvac-split/parts", icon: Package },
          { title: "Reports", url: "/pt-zta/hvac-split/reports", icon: BarChart3 },
        ],
      },
    ],
    common: [
      { title: "HR & Payroll", url: "/pt-zta/hr", icon: Users },
      { title: "Finance", url: "/pt-zta/finance", icon: Calculator },
      { title: "Master Data", url: "/pt-zta/master", icon: Cog },
    ],
  },
  "PT TAM": {
    code: "PT-TAM", 
    units: [
      {
        title: "Fabrikasi",
        items: [
          { title: "Job Orders", url: "/pt-tam/fabrikasi/jobs", icon: FileText },
          { title: "Timesheet", url: "/pt-tam/fabrikasi/timesheet", icon: Clipboard },
          { title: "Material Issue", url: "/pt-tam/fabrikasi/materials", icon: Package },
          { title: "Reports", url: "/pt-tam/fabrikasi/reports", icon: BarChart3 },
        ],
      },
    ],
    common: [
      { title: "HR & Payroll", url: "/pt-tam/hr", icon: Users },
      { title: "Finance", url: "/pt-tam/finance", icon: Calculator },
      { title: "Master Data", url: "/pt-tam/master", icon: Cog },
    ],
  },
  "PT HTK": {
    code: "PT-HTK",
    units: [
      {
        title: "Cutting Grass",
        items: [
          { title: "Job Orders", url: "/pt-htk/cutting-grass/jobs", icon: FileText },
          { title: "Timesheet", url: "/pt-htk/cutting-grass/timesheet", icon: Clipboard },
          { title: "Reports", url: "/pt-htk/cutting-grass/reports", icon: BarChart3 },
        ],
      },
    ],
    common: [
      { title: "HR & Payroll", url: "/pt-htk/hr", icon: Users },
      { title: "Finance", url: "/pt-htk/finance", icon: Calculator },
      { title: "Master Data", url: "/pt-htk/master", icon: Cog },
    ],
  },
};

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
        title: "Dashboard",
        url: "/pt-nilo/dashboard",
        icon: Home,
      },
      {
        title: "HVAC Rittal",
        items: [
          { title: "Work Orders", url: "/pt-nilo/hvac-rittal/work-orders" },
          { title: "Checklist & PM", url: "/pt-nilo/hvac-rittal/pm" },
          { title: "Parts & Material", url: "/pt-nilo/hvac-rittal/parts" },
          { title: "Laporan", url: "/pt-nilo/hvac-rittal/report" },
        ],
      },
      {
        title: "HVAC Split",
        items: [
          { title: "Work Orders", url: "/pt-nilo/hvac-split/work-orders" },
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
        title: "Dashboard",
        url: "/pt-zta/dashboard",
        icon: Home,
      },
      {
        title: "HVAC Rittal",
        items: [
          { title: "Work Orders", url: "/pt-zta/hvac-rittal/work-orders" },
        ],
      },
      {
        title: "HVAC Split",
        items: [
          { title: "Work Orders", url: "/pt-zta/hvac-split/work-orders" },
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
        title: "Dashboard",
        url: "/pt-tam/dashboard",
        icon: Home,
      },
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
        title: "Dashboard",
        url: "/pt-htk/dashboard",
        icon: Home,
      },
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

  // Generate navigation items based on user access
  const getNavigationItems = () => {
    if (!session) return [];

    console.log("Sidebar - Session user:", {
      email: session.user?.email,
      role: (session.user as any)?.role,
      companyCode: (session.user as any)?.companyCode
    });
    console.log("Sidebar - Is group level user:", isGroupLevelUser(session));

    // If user is group-level (executive/viewer), show all items
    if (isGroupLevelUser(session)) {
      return [
        {
          title: "HT-Group Dashboard",
          url: "/dashboard",
          icon: Home,
        },
        ...Object.entries(ptNavigationData).map(([ptName, ptData]) => ({
          title: ptName,
          icon: Building2,
          items: [
            {
              title: "Dashboard",
              url: `/${ptData.code.toLowerCase()}/dashboard`,
              icon: Home,
            },
            ...ptData.units.map(unit => ({
              title: unit.title,
              items: unit.items,
            })),
            ...ptData.common,
          ],
        })),
      ];
    }

    // Get the specific PT for the user
    const userPT = getUserPTCompany(session);
    if (!userPT) {
      return [{
        title: "Access Denied",
        url: "/access-denied",
        icon: Home,
      }];
    }

    // Find the navigation data for this PT
    const ptName = userPT.name;
    const ptData = ptNavigationData[ptName];
    if (!ptData) {
      return [{
        title: "Access Denied",
        url: "/access-denied", 
        icon: Home,
      }];
    }

    // Return only the specific PT's navigation
    return [
      {
        title: `${ptName} Dashboard`,
        url: `/${ptData.code.toLowerCase()}/dashboard`,
        icon: Home,
      },
      ...ptData.units.map(unit => ({
        title: unit.title,
        icon: Wrench,
        items: unit.items,
      })),
      ...ptData.common,
    ];
  };

  // Filter navigation items based on user access
  const getFilteredNavigationItems = () => {
    if (!session) return [];

    // If user is group-level (executive/viewer), show all items
    if (isGroupLevelUser(session)) {
      return navigationItems;
    }

    // Get accessible PT companies for the user
    const accessiblePTs = getAccessiblePTCompanies(session);

    // Filter navigation items to only show accessible PTs
    const filteredItems = navigationItems.filter(item => {
      // Always show HT-Group Dashboard
      if (item.title === "HT-Group Dashboard") {
        return true;
      }

      // Check if this is a PT item and if user has access
      const ptName = item.title;
      return accessiblePTs.some(pt => pt.name === ptName);
    });

    return filteredItems;
  };

  const dynamicNavigationItems = getNavigationItems();

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
          {dynamicNavigationItems.map((item: NavigationItem) => (
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
                      {item.items.map((subItem: NavigationItem) => (
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
                                  {subItem.items.map((nestedItem: NavigationItem) => (
                                    <SidebarMenuSubItem key={nestedItem.title}>
                                      <SidebarMenuSubButton asChild isActive={pathname === nestedItem.url}>
                                        <Link href={nestedItem.url || "#"}>
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
