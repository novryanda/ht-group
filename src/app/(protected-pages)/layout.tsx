import { AppSidebar } from "~/components/layout/app-sidebar";
import { SidebarProvider } from "~/components/ui/sidebar";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { ProtectedWrapper } from "~/components/layout/protected-wrapper";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  return (
    <ProtectedWrapper>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 overflow-hidden">
            <div className="flex h-full flex-col">
              <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
              </header>
              <div className="flex-1 overflow-auto">
                {children}
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ProtectedWrapper>
  );
}
