"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { 
  keyToPrettyLabel, 
  guessUnit, 
  formatValue,
  groupKey,
  groupLabel 
} from "~/server/types/pt-pks/mutu-labels";

interface PayloadDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: Record<string, unknown> | null;
  tanggal?: string;
  shift?: string;
}

export function PayloadDrawer({
  open,
  onOpenChange,
  payload,
  tanggal,
  shift,
}: PayloadDrawerProps) {
  if (!payload) return null;

  // Group entries by section
  const grouped = new Map<string, Array<[string, unknown]>>();
  
  Object.entries(payload).forEach(([key, value]) => {
    const group = groupKey(key);
    // Skip META group
    if (group === "META") return;
    
    if (!grouped.has(group)) {
      grouped.set(group, []);
    }
    grouped.get(group)!.push([key, value]);
  });

  // Sort groups alphabetically
  const sortedGroups = Array.from(grouped.entries()).sort(([a], [b]) => {
    return a.localeCompare(b);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Mutu Produksi</DialogTitle>
          <DialogDescription>
            Data lengkap mutu produksi dari Google Sheets
          </DialogDescription>
          {tanggal && shift && (
            <div className="flex gap-2 items-center mt-2">
              <Badge variant="outline">Tanggal: {tanggal}</Badge>
              <Badge variant="outline">Shift: {shift}</Badge>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {sortedGroups.map(([group, entries]) => {
            // Sort entries within group
            const sortedEntries = entries.sort((a, b) => a[0].localeCompare(b[0]));
            
            return (
              <Card key={group}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    {groupLabel(group)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sortedEntries.map(([key, value], idx) => {
                      const label = keyToPrettyLabel(key);
                      const unit = guessUnit(key);
                      const formattedValue = formatValue(value, unit);

                      return (
                        <div key={key}>
                          {idx > 0 && <Separator className="my-2" />}
                          <div className="flex justify-between items-start gap-4 py-1">
                            <span className="text-sm text-muted-foreground flex-1">
                              {label}
                            </span>
                            <span className="text-sm font-medium text-right">
                              {formattedValue}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
