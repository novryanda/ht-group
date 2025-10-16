import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Package, Users, DollarSign, TrendingUp } from 'lucide-react'

export default function PKSDashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard PT PKS</h1>
        <p className="text-muted-foreground">
          Sistem Informasi Manajemen PT PKS - Palm Kernel Shell Processing
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234 Ton</div>
            <p className="text-xs text-muted-foreground">
              +20.1% dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Karyawan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              +8 karyawan baru
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produksi TBS</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,845 Ton</div>
            <p className="text-xs text-muted-foreground">
              Target: 3,000 Ton
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 45.2M</div>
            <p className="text-xs text-muted-foreground">
              +12.5% dari bulan lalu
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Produksi Harian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>TBS Masuk</span>
                <Badge variant="secondary">125 Ton</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>CPO Produksi</span>
                <Badge variant="outline">28 Ton</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Kernel</span>
                <Badge variant="default">8.5 Ton</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Karyawan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Hadir Hari Ini</span>
                <Badge variant="secondary">142 orang</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Izin/Sakit</span>
                <Badge variant="outline">8 orang</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Lembur</span>
                <Badge variant="default">25 orang</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gudang Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Bahan Baku</span>
                <Badge variant="secondary">85% penuh</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Produk Jadi</span>
                <Badge variant="outline">65% penuh</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Spare Parts</span>
                <Badge variant="default">92% penuh</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
