import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Construction } from "lucide-react";

interface EmptyPageTemplateProps {
  title: string;
  description?: string;
  module?: string;
}

export function EmptyPageTemplate({ 
  title, 
  description = "Halaman ini sedang dalam tahap pengembangan",
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
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Construction className="h-24 w-24 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Fitur Belum Tersedia
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Halaman ini akan segera hadir. Saat ini kami sedang mengembangkan
              fitur-fitur yang diperlukan untuk modul ini.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
