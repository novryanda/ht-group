"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { SupplierList } from "~/components/pt-pks/datamaster-pks/supplier/supplier-list";
import { SupplierForm } from "~/components/pt-pks/datamaster-pks/supplier/supplier-form";

export default function SupplierDataMasterPage() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Data Master Supplier
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola data supplier TBS (Tandan Buah Segar)
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Daftar Supplier</TabsTrigger>
          <TabsTrigger value="form">Form Pendaftaran</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <SupplierList />
        </TabsContent>

        <TabsContent value="form" className="mt-4">
          <SupplierForm onSuccess={() => setActiveTab("list")} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
