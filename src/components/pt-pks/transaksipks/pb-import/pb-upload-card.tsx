"use client";

/**
 * PB Upload Card Component
 * Drag & drop Excel file upload
 */

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileSpreadsheet, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { useToast } from "~/hooks/use-toast";

interface PbUploadCardProps {
  canWrite: boolean;
  onUploadSuccess: (batchId: string) => void;
}

export function PbUploadCard({ canWrite, onUploadSuccess }: PbUploadCardProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!canWrite) {
        toast({
          title: "Akses Ditolak",
          description: "Anda tidak memiliki izin untuk upload file",
          variant: "destructive",
        });
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);
      setUploadError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/pb-imports/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Upload failed");
        }

        onUploadSuccess(result.data.batchId);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Upload failed";
        setUploadError(message);
        toast({
          title: "Upload Gagal",
          description: message,
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    },
    [canWrite, onUploadSuccess, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
    disabled: !canWrite || uploading,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload File PB Excel</CardTitle>
        <CardDescription>
          Upload file Excel yang berisi data Penerimaan Buah (PB) dari timbangan.
          Mendukung multi-sheet - semua sheet dalam workbook akan diproses.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canWrite && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Anda tidak memiliki izin untuk upload file. Hanya PT_PKS_ADMIN dan EXECUTIVE yang dapat upload.
            </AlertDescription>
          </Alert>
        )}

        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-colors
            ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
            ${!canWrite || uploading ? "opacity-50 cursor-not-allowed" : "hover:border-primary hover:bg-primary/5"}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center gap-4">
            {uploading ? (
              <>
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="text-lg font-medium">Uploading...</p>
                <p className="text-sm text-muted-foreground">
                  Mohon tunggu, file sedang diproses
                </p>
              </>
            ) : (
              <>
                {isDragActive ? (
                  <Upload className="h-12 w-12 text-primary" />
                ) : (
                  <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
                )}
                <div>
                  <p className="text-lg font-medium">
                    {isDragActive
                      ? "Drop file di sini..."
                      : "Drag & drop file Excel di sini"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    atau klik untuk memilih file (.xlsx, .xls)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {uploadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Format Excel yang Diharapkan:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Baris 1-3: Header (judul laporan, periode, tanggal cetak)</li>
            <li>Baris 4: Nama kolom (No. Seri, No. Polisi, Nama Relasi, dll)</li>
            <li>Baris 5+: Data transaksi</li>
            <li>Kolom wajib: No. Seri, Tanggal, Berat Timbang 1 & 2, Netto, Harga</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

