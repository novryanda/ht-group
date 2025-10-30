"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "~/hooks/use-toast";

interface ChangePayload {
  id: string;
  payload: Record<string, unknown>;
}

interface UseRowEditOptions<T extends { id: string }> {
  queryKey: QueryKey;
  buildUrl: (id: string) => string;
  successMessage?: string;
  transformPayload?: (
    row: T,
    columnId: string,
    value: unknown
  ) => Record<string, unknown> | null | undefined;
}

export function useRowEdit<T extends { id: string }>(options: UseRowEditOptions<T>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [pendingMap, setPendingMap] = useState<Record<string, boolean>>({});
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: async ({ id, payload }: ChangePayload) => {
      const response = await fetch(options.buildUrl(id), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.error ?? "Gagal menyimpan perubahan");
      }

      return result.data as T;
    },
    onSuccess: (data) => {
      setErrorMap((prev) => {
        if (!prev[data.id]) return prev;
        const next = { ...prev };
        delete next[data.id];
        return next;
      });

      queryClient.setQueryData(options.queryKey, (oldData: unknown) => {
        if (!oldData) return oldData;

        if (Array.isArray(oldData)) {
          return oldData.map((row: T) => (row.id === data.id ? data : row));
        }

        if (
          typeof oldData === "object" &&
          oldData !== null &&
          "data" in oldData &&
          (oldData as any).data?.data
        ) {
          const current = oldData as any;
          return {
            ...current,
            data: {
              ...current.data,
              data: current.data.data.map((row: T) =>
                row.id === data.id ? data : row
              ),
            },
          };
        }

        return oldData;
      });

      if (options.successMessage) {
        toast({ title: options.successMessage });
      }
    },
    onError: (error, variables) => {
      if (variables?.id) {
        setErrorMap((prev) => ({
          ...prev,
          [variables.id]: error instanceof Error ? error.message : "Gagal menyimpan perubahan",
        }));
      }

      toast({
        title: "Gagal menyimpan perubahan",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    },
    onSettled: (_data, _error, variables) => {
      setPendingMap((prev) => {
        const next = { ...prev };
        delete next[variables.id];
        return next;
      });

      queryClient.invalidateQueries({ queryKey: options.queryKey });
    },
  });

  const commit = (row: T, columnId: string, value: unknown) => {
    const payload =
      options.transformPayload?.(row, columnId, value) ?? {
        [columnId]: value,
      };

    if (!payload || Object.keys(payload).length === 0) {
      return;
    }

    setErrorMap((prev) => {
      if (!prev[row.id]) return prev;
      const next = { ...prev };
      delete next[row.id];
      return next;
    });

    setPendingMap((prev) => ({ ...prev, [row.id]: true }));
    mutation.mutate({ id: row.id, payload });
  };

  return {
    commit,
    isPending: (id: string) => Boolean(pendingMap[id]),
    getError: (id: string) => errorMap[id],
  };
}
