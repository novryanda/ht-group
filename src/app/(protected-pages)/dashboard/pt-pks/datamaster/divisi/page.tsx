"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { DivisiList } from "~/components/dashboard/pt-pks/datamaster-pks/divisi/divisi-list";

export default function DivisiDataMasterPage() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Data Master Divisi & Jabatan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola data divisi dan jabatan untuk karyawan
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="list">Daftar Divisi & Jabatan</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <DivisiList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

