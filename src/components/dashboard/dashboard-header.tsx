import { PageBreadcrumb } from "~/components/layout/page-breadcrumb";

interface DashboardHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
  showBreadcrumb?: boolean;
}

export function DashboardHeader({
  heading,
  text,
  children,
  showBreadcrumb = true,
}: DashboardHeaderProps) {
  return (
    <div className="space-y-4">
      {showBreadcrumb && <PageBreadcrumb />}
      <div className="flex items-center justify-between px-2">
        <div className="grid gap-1">
          <h1 className="font-heading text-3xl md:text-4xl">{heading}</h1>
          {text && <p className="text-lg text-muted-foreground">{text}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
