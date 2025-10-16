"use client";

/**
 * PB Import Client Component
 * Main orchestrator for PB Excel import flow
 */

import { useState } from "react";
import { Card } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { PbUploadCard } from "./pb-upload-card";
import { PbPreviewTable } from "./pb-preview-table";
import { useToast } from "~/hooks/use-toast";

interface PbImportClientProps {
  canWrite: boolean;
  userId: string;
}

export function PbImportClient({ canWrite, userId }: PbImportClientProps) {
  const { toast } = useToast();
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "preview">("upload");

  const handleUploadSuccess = (batchId: string) => {
    setCurrentBatchId(batchId);
    setActiveTab("preview");
    toast({
      title: "Upload Berhasil",
      description: "File Excel berhasil diupload dan diparse",
    });
  };

  const handleCommitSuccess = () => {
    toast({
      title: "Commit Berhasil",
      description: "Data berhasil diposting ke sistem",
    });
    // Reset to upload tab
    setCurrentBatchId(null);
    setActiveTab("upload");
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="upload">Upload Excel</TabsTrigger>
          <TabsTrigger value="preview" disabled={!currentBatchId}>
            Preview & Commit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <PbUploadCard
            canWrite={canWrite}
            onUploadSuccess={handleUploadSuccess}
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          {currentBatchId && (
            <PbPreviewTable
              batchId={currentBatchId}
              canWrite={canWrite}
              onCommitSuccess={handleCommitSuccess}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

