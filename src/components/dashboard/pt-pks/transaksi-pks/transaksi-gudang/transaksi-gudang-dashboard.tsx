"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { BarangKeluarList } from "./barang-keluar-list";
import { BarangMasukList } from "./barang-masuk-list";
import { Package, PackageOpen, FileText, ArrowLeftRight } from "lucide-react";

export function TransaksiGudangDashboard() {
  const [activeTab, setActiveTab] = useState("peminjaman");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Transaksi Gudang</h2>
        <p className="text-muted-foreground">
          Kelola transaksi barang masuk, keluar, dan pengajuan barang
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="peminjaman" className="gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            Peminjaman Barang
          </TabsTrigger>
          <TabsTrigger value="barang-keluar" className="gap-2">
            <PackageOpen className="h-4 w-4" />
            Barang Keluar
          </TabsTrigger>
          <TabsTrigger value="barang-masuk" className="gap-2">
            <Package className="h-4 w-4" />
            Barang Masuk
          </TabsTrigger>
          <TabsTrigger value="pengajuan" className="gap-2">
            <FileText className="h-4 w-4" />
            Pengajuan Barang
          </TabsTrigger>
        </TabsList>

        <TabsContent value="peminjaman" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Peminjaman Barang</CardTitle>
              <CardDescription>
                Transaksi peminjaman barang ke divisi lain dengan tracking pengembalian
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarangKeluarList defaultPurpose="LOAN" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="barang-keluar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Barang Keluar</CardTitle>
              <CardDescription>
                Pengeluaran barang untuk produksi, maintenance, dan scrap
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarangKeluarList defaultPurpose="ISSUE" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="barang-masuk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Barang Masuk</CardTitle>
              <CardDescription>
                Penerimaan barang kembali dan barang baru masuk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarangMasukList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pengajuan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengajuan Barang</CardTitle>
              <CardDescription>
                Pengajuan permintaan barang untuk diproses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
