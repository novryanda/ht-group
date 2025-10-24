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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "~/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
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
  Receipt,
  UserPlus,
  ClipboardMinus,
  Truck,
  Scale,
  Calendar,
  ArrowLeftRightIcon,
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
    icon?: React.ComponentType<any>;
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
          { title: "Work Orders", url: "/dashboard/pt-nilo/hvac-rittal/work-orders", icon: Wrench },
          { title: "Preventive Maintenance", url: "/dashboard/pt-nilo/hvac-rittal/pm", icon: Clipboard },
          { title: "Parts & Material", url: "/dashboard/pt-nilo/hvac-rittal/parts", icon: Package },
          { title: "Reports", url: "/dashboard/pt-nilo/hvac-rittal/reports", icon: BarChart3 },
        ],
      },
      {
        title: "HVAC Split",
        items: [
          { title: "Work Orders", url: "/dashboard/pt-nilo/hvac-split/work-orders", icon: Wrench },
          { title: "PM & Outstanding", url: "/dashboard/pt-nilo/hvac-split/pm", icon: Clipboard },
          { title: "Parts & Material", url: "/dashboard/pt-nilo/hvac-split/parts", icon: Package },
          { title: "Reports", url: "/dashboard/pt-nilo/hvac-split/reports", icon: BarChart3 },
        ],
      },
      {
        title: "Manpower Fabrikasi",
        items: [
          { title: "Job Orders", url: "/dashboard/pt-nilo/fabrikasi/jobs", icon: FileText },
          { title: "Timesheet", url: "/dashboard/pt-nilo/fabrikasi/timesheet", icon: Clipboard },
          { title: "Material Issue", url: "/dashboard/pt-nilo/fabrikasi/materials", icon: Package },
          { title: "Reports", url: "/dashboard/pt-nilo/fabrikasi/reports", icon: BarChart3 },
          { title: "Tagihan", url: "/dashboard/pt-nilo/fabrikasi/tagihan", icon: Receipt },
        ],
      },
      {
        title: "Manpower Efluen",
        items: [
          { title: "Work Orders", url: "/dashboard/pt-nilo/efluen/work-orders", icon: Wrench },
          { title: "Timesheet", url: "/dashboard/pt-nilo/efluen/timesheet", icon: Clipboard },
          { title: "Reports", url: "/dashboard/pt-nilo/efluen/reports", icon: BarChart3 },
        ],
      },
    ],
    common: [
      { title: "HR & Payroll", url: "/dashboard/pt-nilo/hr", icon: Users },
      { title: "Finance", url: "/dashboard/pt-nilo/finance", icon: Calculator },
      { title: "Master Data", url: "/dashboard/pt-nilo/master", icon: Cog },
    ],
  },
  "PT ZTA": {
    code: "PT-ZTA",
    units: [
      {
        title: "HVAC Rittal",
        items: [
          { title: "Work Orders", url: "/dashboard/pt-zta/hvac-rittal/work-orders", icon: Wrench },
          { title: "Preventive Maintenance", url: "/dashboard/pt-zta/hvac-rittal/pm", icon: Clipboard },
          { title: "Parts & Material", url: "/dashboard/pt-zta/hvac-rittal/parts", icon: Package },
          { title: "Reports", url: "/dashboard/pt-zta/hvac-rittal/reports", icon: BarChart3 },
        ],
      },
      {
        title: "HVAC Split",
        items: [
          { title: "Work Orders", url: "/dashboard/pt-zta/hvac-split/work-orders", icon: Wrench },
          { title: "PM & Outstanding", url: "/dashboard/pt-zta/hvac-split/pm", icon: Clipboard },
          { title: "Parts & Material", url: "/dashboard/pt-zta/hvac-split/parts", icon: Package },
          { title: "Reports", url: "/dashboard/pt-zta/hvac-split/reports", icon: BarChart3 },
        ],
      },
    ],
    common: [
      { title: "HR & Payroll", url: "/dashboard/pt-zta/hr", icon: Users },
      { title: "Finance", url: "/dashboard/pt-zta/finance", icon: Calculator },
      { title: "Master Data", url: "/dashboard/pt-zta/master", icon: Cog },
    ],
  },
  "PT TAM": {
    code: "PT-TAM", 
    units: [
      {
        title: "Manpower Fabrikasi",
        items: [
          { title: "Job Orders", url: "/dashboard/pt-tam/fabrikasi/jobs", icon: FileText },
          { title: "Timesheet", url: "/dashboard/pt-tam/fabrikasi/timesheet", icon: Clipboard },
          { title: "Material Issue", url: "/dashboard/pt-tam/fabrikasi/materials", icon: Package },
          { title: "Reports", url: "/dashboard/pt-tam/fabrikasi/reports", icon: BarChart3 },
          { title: "Manpower", url: "/dashboard/pt-tam/fabrikasi/manpower", icon: Users },
          { title: "Tagihan", url: "/dashboard/pt-tam/fabrikasi/tagihan", icon: Receipt },
        ],
      },
    ],
    common: [
      { title: "HR & Payroll", url: "/dashboard/pt-tam/hr", icon: Users },
      { title: "Finance", url: "/dashboard/pt-tam/finance", icon: Calculator },
      { title: "Master Data", url: "/dashboard/pt-tam/master", icon: Cog },
    ],
  },
  "PT HTK": {
    code: "PT-HTK",
    units: [
      {
        title: "Cutting Grass",
        items: [
          { title: "Job Orders", url: "/dashboard/pt-htk/cutting-grass/jobs", icon: FileText },
          { title: "Timesheet", url: "/dashboard/pt-htk/cutting-grass/timesheet", icon: Clipboard },
          { title: "Reports", url: "/dashboard/pt-htk/cutting-grass/reports", icon: BarChart3 },
        ],
      },
      {
        title: "Heavy Equipment",
        items: [
          { title: "Job Orders", url: "/dashboard/pt-htk/heavy-equipment/jobs", icon: FileText },
          { title: "Timesheet", url: "/dashboard/pt-htk/heavy-equipment/timesheet", icon: Clipboard },
          { title: "Reports", url: "/dashboard/pt-htk/heavy-equipment/reports", icon: BarChart3 },
        ],
      },
      {
        title: "Hauling Container",
        items: [
          { title: "Job Orders", url: "/dashboard/pt-htk/hauling-container/jobs", icon: FileText },
          { title: "Timesheet", url: "/dashboard/pt-htk/hauling-container/timesheet", icon: Clipboard },
          { title: "Reports", url: "/dashboard/pt-htk/hauling-container/reports", icon: BarChart3 },
        ],
      },
    ],
    common: [
      { title: "HR & Payroll", url: "/dashboard/pt-htk/hr", icon: Users },
      { title: "Finance", url: "/dashboard/pt-htk/finance", icon: Calculator },
      { title: "Master Data", url: "/dashboard/pt-htk/master", icon: Cog },
    ],
  },
  "PT PKS": {
    code: "PT-PKS",
    units: [
      {
        title: "Data Master",
        icon: Package,
        items: [
          { title: "Supplier", url: "/dashboard/pt-pks/datamaster/supplier", icon: UserPlus },
          { title: "Buyer", url: "/dashboard/pt-pks/datamaster/buyer", icon: Users },
          { title: "Transportir", url: "/dashboard/pt-pks/datamaster/transportir", icon: Truck },
          { title: "Material & Inventory", url: "/dashboard/pt-pks/datamaster/material-inventory", icon: Package },
          { title: "Karyawan", url: "/dashboard/pt-pks/datamaster/karyawan", icon: User },
          { title: "Daftar Akun", url: "/dashboard/pt-pks/datamaster/daftar-akun", icon: ClipboardMinus },
        ],
      },
      {
        title: "Finance",
        icon: Calculator,
        items: [
          { title: "Periode Fiskal", url: "/dashboard/pt-pks/finance/periode-fiskal", icon: Calendar },
          { title: "Saldo Awal Akun", url: "/dashboard/pt-pks/finance/saldo-awal-akun", icon: Receipt },
        ],
      },
      {
        title: "Supplier & Timbangan",
        icon: Scale,
        items: [
          { title: "Supplier", url: "/dashboard/pt-pks/supplier-timbangan/supplier", icon: UserPlus },
          { title: "Timbangan", url: "/dashboard/pt-pks/supplier-timbangan/timbangan", icon: Truck },
        ] 
      },
      {
        title: "Transaksi PKS",
        icon: ArrowLeftRightIcon,
        items: [
          { title: "Transaksi Gudang", url: "/dashboard/pt-pks/transaksi-pks/transaksi-gudang", icon: Package },
          { title: "PB Harian", url: "/dashboard/pt-pks/transaksipks/pb-harian", icon: FileText },
          { title: "Permintaan Dana", url: "/dashboard/pt-pks/transaksipks/permintaan-dana", icon: Calculator },
          { title: "Pembayaran Produksi Harian", url: "/dashboard/pt-pks/transaksipks/produksi-harian", icon: Receipt },
        ],
      },
      {
        title: "Laporan",
        icon: BarChart3,
        items: [
          { title: "Laporan Mutu Produksi", url: "/dashboard/pt-pks/laporan/laporan-mutu-produksi", icon: FileText },
          { title: "Laporan Produksi", url: "/dashboard/pt-pks/laporan/laporan-produksi", icon: Scale },
        ],
      },
    ],
    common: [
    ],
  },
};


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
              url: `/dashboard/${ptData.code.toLowerCase()}`,
              icon: Home,
            },
            ...ptData.units.map(unit => ({
              title: unit.title,
              icon: unit.icon,
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
        url: `/dashboard/${ptData.code.toLowerCase()}`,
        icon: Home,
      },
      ...ptData.units.map(unit => ({
        title: unit.title,
        icon: unit.icon,
        items: unit.items,
      })),
      ...ptData.common,
    ];
  };

  // Filter navigation items based on user access

  const dynamicNavigationItems = getNavigationItems();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">HT Group</span>
                  <span className="truncate text-xs">ERP System</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dynamicNavigationItems.map((item: NavigationItem, itemIndex) => (
                <Collapsible
                  key={`${item.title}-${itemIndex}`}
                  asChild
                  open={openItems.includes(item.title)}
                  onOpenChange={() => toggleItem(item.title)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    {item.url ? (
                      <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                        <Link href={item.url}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    ) : (
                      <>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items?.map((subItem: NavigationItem, subIndex) => (
                              <Collapsible
                                key={`${item.title}-${subItem.title}-${subIndex}`}
                                asChild
                                open={openItems.includes(`${item.title}-${subItem.title}`)}
                                onOpenChange={() => toggleItem(`${item.title}-${subItem.title}`)}
                                className="group/subcollapsible"
                              >
                                <SidebarMenuSubItem>
                                  {subItem.url ? (
                                    <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                      <Link href={subItem.url}>
                                        {subItem.icon && <subItem.icon />}
                                        <span>{subItem.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  ) : (
                                    <>
                                      <CollapsibleTrigger asChild>
                                        <SidebarMenuSubButton>
                                          <span>{subItem.title}</span>
                                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/subcollapsible:rotate-90" />
                                        </SidebarMenuSubButton>
                                      </CollapsibleTrigger>
                                      <CollapsibleContent>
                                        <SidebarMenuSub>
                                          {subItem.items?.map((nestedItem: NavigationItem, nestedIndex) => (
                                            <SidebarMenuSubItem key={`${item.title}-${subItem.title}-${nestedItem.title}-${nestedIndex}`}>
                                              <SidebarMenuSubButton asChild isActive={pathname === nestedItem.url}>
                                                <Link href={nestedItem.url || "#"}>
                                                  {nestedItem.icon && <nestedItem.icon />}
                                                  <span>{nestedItem.title}</span>
                                                </Link>
                                              </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                          ))}
                                        </SidebarMenuSub>
                                      </CollapsibleContent>
                                    </>
                                  )}
                                </SidebarMenuSubItem>
                              </Collapsible>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
