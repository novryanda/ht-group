"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Edit, Trash2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import type { AccountDTO } from "~/server/types/pt-pks/account";
import { cn } from "~/lib/utils";

interface AccountTreeProps {
  data: AccountDTO[];
  onEdit?: (account: AccountDTO) => void;
  onDelete?: (account: AccountDTO) => void;
  canManage?: boolean;
}

export function AccountTree({ data, onEdit, onDelete, canManage = false }: AccountTreeProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const roots = useMemo(() => data ?? [], [data]);

  useEffect(() => {
    const initial: Record<string, boolean> = {};
    for (const root of roots) {
      initial[root.id] = true;
    }
    setExpanded((prev) => ({ ...initial, ...prev }));
  }, [roots]);

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNode = (node: AccountDTO, depth = 0) => {
    const hasChildren = (node.children?.length ?? 0) > 0;
    const isExpanded = expanded[node.id];

    return (
      <div key={node.id} className={cn("space-y-2", depth > 0 && "pl-4 border-l border-border/40")}>
        <div className="flex items-start justify-between gap-3 rounded-md bg-muted/40 px-3 py-2">
          <div className="flex flex-1 items-start gap-3">
            <div className="mt-1">
              {hasChildren ? (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggle(node.id)}>
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              ) : (
                <div className="h-6 w-6" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-medium">{node.code}</span>
                <span className="font-semibold">{node.name}</span>
                <Badge variant="outline" className="text-xs uppercase tracking-wide">
                  {node.class.replace("_", " ")}
                </Badge>
                <Badge
                  variant={node.normalSide === "DEBIT" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {node.normalSide}
                </Badge>
                <Badge variant={node.isPosting ? "default" : "secondary"} className="text-xs">
                  {node.isPosting ? "Posting" : "Header"}
                </Badge>
                {node.isCashBank && (
                  <Badge variant="outline" className="text-xs">
                    Cash / Bank
                  </Badge>
                )}
                {node.taxCode !== "NON_TAX" && (
                  <Badge variant="outline" className="text-xs">
                    {node.taxCode.replace("_", " ")}
                  </Badge>
                )}
                <Badge variant={node.status === "AKTIF" ? "default" : "secondary"} className="text-xs">
                  {node.status}
                </Badge>
              </div>
              {node.description && (
                <p className="mt-1 text-sm text-muted-foreground">{node.description}</p>
              )}
            </div>
          </div>

          {canManage && (
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button variant="ghost" size="icon" onClick={() => onEdit(node)}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="icon" onClick={() => onDelete(node)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-2">
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (roots.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Tidak ada struktur akun untuk perusahaan ini.
      </div>
    );
  }

  return <div className="space-y-3">{roots.map((node) => renderNode(node))}</div>;
}
