"use client";

/**
 * PB Preview Table Component
 * Shows preview of imported data with validation status
 */

import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle2, AlertCircle, FileCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { useToast } from "~/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface PbPreviewTableProps {
  batchId: string;
  canWrite: boolean;
  onCommitSuccess: () => void;
}

interface PreviewData {
  batch: {
    id: string;
    fileName: string;
    status: string;
    periodFrom: string | null;
    periodTo: string | null;
    printedAt: string | null;
  };
  sampleRows: Array<{
    id: string;
    sheetName: string;
    rowIndex: number;
    noSeri: string | null;
    namaRelasi: string | null;
    noPolisi: string | null;
    terimaKg: string | null;
    totalPay: string | null;
    tanggal: string | null;
    isValid: boolean;
    issues: Array<{ field: string; message: string; severity: string }>;
  }>;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  summary: {
    totalTerimaKg: string;
    totalPph: string;
    totalPembayaran: string;
  };
}

export function PbPreviewTable({ batchId, canWrite, onCommitSuccess }: PbPreviewTableProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [committing, setCommitting] = useState(false);
  const [showCommitDialog, setShowCommitDialog] = useState(false);

  useEffect(() => {
    loadPreview();
  }, [batchId]);

  const loadPreview = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/pb-imports/${batchId}/preview`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to load preview");
      }

      setData(result.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load preview";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!canWrite) {
      toast({
        title: "Akses Ditolak",
        description: "Anda tidak memiliki izin untuk commit batch",
        variant: "destructive",
      });
      return;
    }

    setCommitting(true);

    try {
      const response = await fetch(`/api/pb-imports/${batchId}/commit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Commit failed");
      }

      toast({
        title: "Commit Berhasil",
        description: `${result.data.created} tickets berhasil dibuat`,
      });

      setShowCommitDialog(false);
      onCommitSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Commit failed";
      toast({
        title: "Commit Gagal",
        description: message,
        variant: "destructive",
      });
    } finally {
      setCommitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "No data available"}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const isPosted = data.batch.status === "POSTED";

  return (
    <>
      <div className="space-y-6">
        {/* Batch Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Preview Data Import</CardTitle>
                <CardDescription>
                  File: {data.batch.fileName}
                  {data.batch.periodFrom && data.batch.periodTo && (
                    <> • Periode: {new Date(data.batch.periodFrom).toLocaleDateString()} - {new Date(data.batch.periodTo).toLocaleDateString()}</>
                  )}
                </CardDescription>
              </div>
              <Badge variant={isPosted ? "default" : "secondary"}>
                {isPosted ? "POSTED" : "DRAFT"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Total Rows</div>
                <div className="text-2xl font-bold">{data.totalRows}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-700">Valid Rows</div>
                <div className="text-2xl font-bold text-green-700">{data.validRows}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-700">Invalid Rows</div>
                <div className="text-2xl font-bold text-red-700">{data.invalidRows}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Terima (Kg)</div>
                <div className="text-xl font-bold">{parseFloat(data.summary.totalTerimaKg).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total PPH (Rp)</div>
                <div className="text-xl font-bold">{parseFloat(data.summary.totalPph).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Pembayaran (Rp)</div>
                <div className="text-xl font-bold">{parseFloat(data.summary.totalPembayaran).toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sample Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sample Data (10 baris pertama)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Sheet</TableHead>
                    <TableHead>No. Seri</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nama Relasi</TableHead>
                    <TableHead>No. Polisi</TableHead>
                    <TableHead className="text-right">Terima (Kg)</TableHead>
                    <TableHead className="text-right">Total Pay (Rp)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.sampleRows.map((row) => (
                    <React.Fragment key={row.id}>
                      <TableRow>
                        <TableCell>
                          {row.isValid ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Valid
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Error ({row.issues.filter(i => i.severity === "error").length})
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {row.sheetName}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{row.noSeri || "-"}</TableCell>
                        <TableCell>
                          {row.tanggal ? new Date(row.tanggal).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell>{row.namaRelasi || "-"}</TableCell>
                        <TableCell>{row.noPolisi || "-"}</TableCell>
                        <TableCell className="text-right">
                          {row.terimaKg ? parseFloat(row.terimaKg).toLocaleString() : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.totalPay ? parseFloat(row.totalPay).toLocaleString() : "-"}
                        </TableCell>
                      </TableRow>
                      {!row.isValid && row.issues.length > 0 && (
                        <TableRow key={`${row.id}-errors`}>
                          <TableCell colSpan={8} className="bg-red-50 p-2">
                            <div className="text-xs space-y-1">
                              {row.issues.filter(i => i.severity === "error").map((issue, idx) => (
                                <div key={idx} className="text-red-700">
                                  <strong>{issue.field}:</strong> {issue.message}
                                </div>
                              ))}
                              {row.issues.filter(i => i.severity === "warning").length > 0 && (
                                <div className="text-orange-600 mt-1">
                                  {row.issues.filter(i => i.severity === "warning").length} warning(s)
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {!isPosted && canWrite && (
          <div className="flex justify-end gap-4">
            <Button
              size="lg"
              onClick={() => setShowCommitDialog(true)}
              disabled={data.validRows === 0}
            >
              <FileCheck className="mr-2 h-4 w-4" />
              Commit & Post ({data.validRows} rows)
            </Button>
          </div>
        )}
      </div>

      {/* Commit Confirmation Dialog */}
      <Dialog open={showCommitDialog} onOpenChange={setShowCommitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Commit</DialogTitle>
            <DialogDescription>
              Anda akan membuat {data.validRows} tickets dari data yang valid.
              {data.invalidRows > 0 && ` ${data.invalidRows} rows dengan error akan dilewati.`}
              <br /><br />
              Proses ini tidak dapat dibatalkan. Lanjutkan?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCommitDialog(false)} disabled={committing}>
              Batal
            </Button>
            <Button onClick={handleCommit} disabled={committing}>
              {committing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ya, Commit Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

