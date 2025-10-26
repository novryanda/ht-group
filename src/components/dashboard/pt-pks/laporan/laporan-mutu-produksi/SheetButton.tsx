"use client";

import { Button } from "~/components/ui/button";
import { ExternalLink } from "lucide-react";

interface SheetButtonProps {
  url?: string;
}

export function SheetButton({ url }: SheetButtonProps) {
  const sheetUrl = url || process.env.NEXT_PUBLIC_SHEET_URL;

  if (!sheetUrl) {
    return null;
  }

  return (
    <Button
      variant="default"
      onClick={() => window.open(sheetUrl, "_blank", "noopener,noreferrer")}
    >
      <ExternalLink className="h-4 w-4 mr-2" />
      Input di Google Sheet
    </Button>
  );
}
