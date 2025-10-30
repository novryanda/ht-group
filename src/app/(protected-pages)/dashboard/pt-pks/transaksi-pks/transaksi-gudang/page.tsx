"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Package, ArrowUpRight, ArrowDownRight, ClipboardList } from "lucide-react";
import { BarangKeluarList } from "~/components/dashboard/pt-pks/transaksi-pks/transaksi-gudang/barang-keluar/barang-keluar-list";
import { BarangMasukList } from "~/components/dashboard/pt-pks/transaksi-pks/transaksi-gudang/barang-masuk/barang-masuk-list";
import { PermintaanBarangList } from "~/components/dashboard/pt-pks/transaksi-pks/transaksi-gudang/permintaan-barang/permintaan-barang-list";

export default function TransaksiGudangPage() {
  const [activeTab, setActiveTab] = useState("peminjaman");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transaksi Gudang</h1>
        <p className="text-muted-foreground">
          Kelola transaksi gudang: peminjaman, barang masuk/keluar, dan permintaan barang
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-stretch">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Barang Keluar</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Bulan ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Barang Masuk</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Bulan ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permintaan Pending</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Menunggu approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="keluar">Barang Keluar</TabsTrigger>
          <TabsTrigger value="masuk">Barang Masuk</TabsTrigger>
          <TabsTrigger value="permintaan">Permintaan Barang</TabsTrigger>
        </TabsList>

        
        <TabsContent value="keluar" className="space-y-4">
          <BarangKeluarList />
        </TabsContent>

        <TabsContent value="masuk" className="space-y-4">
          <BarangMasukList />
        </TabsContent>

        <TabsContent value="permintaan" className="space-y-4">
          <PermintaanBarangList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
