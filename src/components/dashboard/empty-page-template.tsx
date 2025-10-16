import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Construction, Loader2 } from "lucide-react";

interface EmptyPageTemplateProps {
  title: string;
  description?: string;
  module?: string;
}

export function EmptyPageTemplate({ 
  title, 
  description = "Halaman ini sedang dalam update dengan fitur terbaru",
  module
}: EmptyPageTemplateProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {module && (
            <p className="text-sm text-muted-foreground mt-1">
              Modul: {module}
            </p>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="relative mb-8">
              <Construction className="h-32 w-32 text-amber-500 animate-pulse" />
              <Loader2 className="h-12 w-12 text-primary absolute -bottom-3 -right-3 animate-spin" />
            </div>
            <h3 className="text-2xl font-bold mb-3">
              Sedang Dalam Update
            </h3>
            <p className="text-base text-muted-foreground max-w-lg mb-6">
              Halaman ini sedang dalam proses pembaruan dengan fitur-fitur terbaru.
              Mohon tunggu, kami akan segera menyelesaikan update ini.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-4 py-2 rounded-full">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="font-medium">Memperbarui sistem...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
