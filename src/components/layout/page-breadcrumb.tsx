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
  
  // Don't show breadcrumb on login or dashboard page
  if (pathname === "/" || pathname === "/login" || pathname === "/dashboard") {
    return null;
  }

  const pathSegments = pathname.split("/").filter(Boolean);
  
  // Create breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
  ];

  let currentPath = "";
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Format segment for display
    let label = segment;
    if (segment.startsWith("pt-")) {
      label = segment.replace("pt-", "PT ").toUpperCase();
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
    } else {
      label = segment.charAt(0).toUpperCase() + segment.slice(1);
    }

    breadcrumbItems.push({
      label,
      href: currentPath,
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
