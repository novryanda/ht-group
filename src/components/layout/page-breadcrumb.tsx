"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

export function PageBreadcrumb() {
  const pathname = usePathname();

  // Don't show breadcrumb on login or main dashboard page
  if (pathname === "/" || pathname === "/login" || pathname === "/dashboard") {
    return null;
  }

  const pathSegments = pathname.split("/").filter(Boolean);

  // Create breadcrumb items
  const breadcrumbItems = [
    { label: "HT Group", href: "/dashboard" },
  ];

  let currentPath = "";
  let currentPT = "";

  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Format segment for display
    let label = segment;
    let href = currentPath;

    if (segment.startsWith("pt-")) {
      currentPT = segment;
      label = segment.replace("pt-", "PT ").toUpperCase();
      // For PT segments, don't link to them directly, they'll link to their dashboard
    } else if (segment === "dashboard" && currentPT) {
      label = "Dashboard";
      // This is a PT dashboard page
    } else if (segment === "hvac-rittal") {
      label = "HVAC Rittal";
    } else if (segment === "hvac-split") {
      label = "HVAC Split";
    } else if (segment === "wo") {
      label = "Work Orders";
    } else if (segment === "jobs") {
      label = "Job Orders";
    } else if (segment === "hr") {
      label = "HR & Payroll";
    } else if (segment === "finance") {
      label = "Finance";
    } else if (segment === "fabrikasi") {
      label = "Fabrikasi";
    } else if (segment === "efluen") {
      label = "Efluen";
    } else if (segment === "cutting-grass") {
      label = "Cutting Grass";
    } else if (segment === "pm") {
      label = "PM & Checklist";
    } else if (segment === "parts") {
      label = "Parts & Material";
    } else if (segment === "materials") {
      label = "Material Issue";
    } else if (segment === "timesheet") {
      label = "Timesheet";
    } else if (segment === "report") {
      label = "Laporan";
    } else if (segment === "master") {
      label = "Master Data";
    } else {
      label = segment.charAt(0).toUpperCase() + segment.slice(1);
    }

    // Special handling for PT dashboard links
    if (segment.startsWith("pt-") && index < pathSegments.length - 1 && pathSegments[index + 1] !== "dashboard") {
      // If we're in a PT but not on the dashboard, make PT link to its dashboard
      href = `${currentPath}/dashboard`;
    }

    breadcrumbItems.push({
      label,
      href,
    });
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {breadcrumbItems.slice(1).map((item, index) => (
          <div key={item.href} className="flex items-center">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {index === breadcrumbItems.length - 2 ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
