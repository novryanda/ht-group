import { AppSidebar } from "~/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { ProtectedWrapper } from "~/components/layout/protected-wrapper";
import { Toaster } from "~/components/ui/sonner";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  return (
    <ProtectedWrapper>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">HT Group ERP</h1>
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </ProtectedWrapper>
  );
}
