"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card } from "~/components/ui/card";
import { Package, Ruler, FolderTree, Warehouse, Box } from "lucide-react";
import { UnitList } from "./unit-list";
import { CategoryList } from "./category-list";
import { ItemTypeList } from "./item-type-list";
import { WarehouseList } from "./warehouse-list";
import { ItemList } from "./item-list";

export function MaterialInventoryDashboard() {
  const [activeTab, setActiveTab] = useState("units");

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Material & Inventory</h1>
        <p className="text-muted-foreground mt-2">
          Kelola data master satuan, kategori, jenis, gudang, dan barang
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="units" className="gap-2">
            <Ruler className="h-4 w-4" />
            <span className="hidden sm:inline">Satuan</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <FolderTree className="h-4 w-4" />
            <span className="hidden sm:inline">Kategori</span>
          </TabsTrigger>
          <TabsTrigger value="types" className="gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Jenis</span>
          </TabsTrigger>
          <TabsTrigger value="warehouses" className="gap-2">
            <Warehouse className="h-4 w-4" />
            <span className="hidden sm:inline">Gudang</span>
          </TabsTrigger>
          <TabsTrigger value="items" className="gap-2">
            <Box className="h-4 w-4" />
            <span className="hidden sm:inline">Barang</span>
          </TabsTrigger>
        </TabsList>

        {/* Satuan Tab */}
        <TabsContent value="units" className="mt-6">
          <UnitList />
        </TabsContent>

        {/* Kategori Tab */}
        <TabsContent value="categories" className="mt-6">
          <CategoryList />
        </TabsContent>

        {/* Jenis Tab */}
        <TabsContent value="types" className="mt-6">
          <ItemTypeList />
        </TabsContent>

        {/* Gudang Tab */}
        <TabsContent value="warehouses" className="mt-6">
          <WarehouseList />
        </TabsContent>

        {/* Barang Tab */}
        <TabsContent value="items" className="mt-6">
          <ItemList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
