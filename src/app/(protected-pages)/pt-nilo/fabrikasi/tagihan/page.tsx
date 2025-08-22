"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { DataTable } from "~/components/ui/data-table";
import type { Column } from "~/components/ui/data-table";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import {
  Receipt,
  Plus,
  Search,
  FileText,
  Download,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

// Types for billing data
interface TagihanItem extends Record<string, unknown> {
  id: string;
  nomorTagihan: string;
  tanggal: string;
  customer: string;
  coa: string;
  nomorReferensi: string;
  nomorPR: string;
  nomorPO: string;
  nomorSes: string;
  jobDescription: string;
  namaPekerjaan: string;
  qty: number;
  rate: number;
  totalTagihan: number;
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate: string;
}

// Sample data for PT NILO
const sampleTagihan: TagihanItem[] = [
  {
    id: "1",
    nomorTagihan: "INV-NILO-FAB-2025-001",
    tanggal: "2025-08-15",
    customer: "PT Indo Steel",
    coa: "4100-001",
    nomorReferensi: "REF-NILO-001",
    nomorPR: "PR-NILO-2025-001",
    nomorPO: "PO-NILO-2025-001",
    nomorSes: "SES-NILO-2025-001",
    jobDescription: "Fabrikasi Struktur Rangka Baja",
    namaPekerjaan: "Pembuatan Rangka Atap Pabrik",
    qty: 1,
    rate: 18000000,
    totalTagihan: 18000000,
    status: "sent",
    dueDate: "2025-09-15"
  },
  {
    id: "2",
    nomorTagihan: "INV-NILO-FAB-2025-002",
    tanggal: "2025-08-18",
    customer: "PT Garuda Manufacturing",
    coa: "4100-002",
    nomorReferensi: "REF-NILO-002",
    nomorPR: "PR-NILO-2025-002",
    nomorPO: "PO-NILO-2025-002",
    nomorSes: "SES-NILO-2025-002",
    jobDescription: "Fabrikasi Platform & Tangga",
    namaPekerjaan: "Platform Akses Mesin Produksi",
    qty: 2,
    rate: 11250000,
    totalTagihan: 22500000,
    status: "paid",
    dueDate: "2025-09-18"
  },
  {
    id: "3",
    nomorTagihan: "INV-NILO-FAB-2025-003",
    tanggal: "2025-08-20",
    customer: "PT Krakatau Works",
    coa: "4100-003",
    nomorReferensi: "REF-NILO-003",
    nomorPR: "PR-NILO-2025-003",
    nomorPO: "PO-NILO-2025-003",
    nomorSes: "SES-NILO-2025-003",
    jobDescription: "Fabrikasi Rak & Support",
    namaPekerjaan: "Rak Penyimpanan Material",
    qty: 5,
    rate: 2550000,
    totalTagihan: 12750000,
    status: "draft",
    dueDate: "2025-09-20"
  },
  {
    id: "4",
    nomorTagihan: "INV-NILO-FAB-2025-004",
    tanggal: "2025-07-25",
    customer: "PT Sinar Jaya",
    coa: "4100-004",
    nomorReferensi: "REF-NILO-004",
    nomorPR: "PR-NILO-2025-004",
    nomorPO: "PO-NILO-2025-004",
    nomorSes: "SES-NILO-2025-004",
    jobDescription: "Fabrikasi Frame Conveyor",
    namaPekerjaan: "Frame Conveyor System",
    qty: 1,
    rate: 9500000,
    totalTagihan: 9500000,
    status: "overdue",
    dueDate: "2025-08-25"
  }
];

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  invoiceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  labelCol: {
    width: '30%',
    fontWeight: 'bold',
  },
  valueCol: {
    width: '70%',
  },
  table: {
    marginTop: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  col1: { width: '15%' },
  col2: { width: '15%' },
  col3: { width: '30%' },
  col4: { width: '10%' },
  col5: { width: '15%' },
  col6: { width: '15%' },
  totalSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  totalLabel: {
    width: 100,
    fontWeight: 'bold',
    textAlign: 'right',
    marginRight: 10,
  },
  totalValue: {
    width: 100,
    textAlign: 'right',
    fontWeight: 'bold',
  },
});

// PDF Document Component for PT NILO
const TagihanPDF = ({ tagihan }: { tagihan: TagihanItem }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      {/* Header */}
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.companyName}>PT NILO</Text>
        <Text>Jl. Industri Raya No. 456, Jakarta</Text>
        <Text>Telp: (021) 87654321 | Email: info@ptnilo.com</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.invoiceTitle}>TAGIHAN / INVOICE</Text>
      </View>

      {/* Invoice Details */}
      <View style={pdfStyles.section}>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.labelCol}>Nomor Tagihan:</Text>
          <Text style={pdfStyles.valueCol}>{tagihan.nomorTagihan}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.labelCol}>Tanggal:</Text>
          <Text style={pdfStyles.valueCol}>{new Date(tagihan.tanggal).toLocaleDateString('id-ID')}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.labelCol}>Customer:</Text>
          <Text style={pdfStyles.valueCol}>{tagihan.customer}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.labelCol}>Jatuh Tempo:</Text>
          <Text style={pdfStyles.valueCol}>{new Date(tagihan.dueDate).toLocaleDateString('id-ID')}</Text>
        </View>
      </View>

      {/* COA Section */}
      <View style={pdfStyles.section}>
        <Text style={[pdfStyles.invoiceTitle, { fontSize: 12 }]}>COA (Chart of Account)</Text>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.labelCol}>COA:</Text>
          <Text style={pdfStyles.valueCol}>{tagihan.coa}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.labelCol}>Nomor Referensi:</Text>
          <Text style={pdfStyles.valueCol}>{tagihan.nomorReferensi}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.labelCol}>Nomor PR:</Text>
          <Text style={pdfStyles.valueCol}>{tagihan.nomorPR}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.labelCol}>Nomor PO:</Text>
          <Text style={pdfStyles.valueCol}>{tagihan.nomorPO}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.labelCol}>Nomor Ses:</Text>
          <Text style={pdfStyles.valueCol}>{tagihan.nomorSes}</Text>
        </View>
      </View>

      {/* Job Details Table */}
      <View style={pdfStyles.table}>
        <View style={pdfStyles.tableHeader}>
          <Text style={pdfStyles.col3}>Job Description</Text>
          <Text style={pdfStyles.col3}>Nama Pekerjaan</Text>
          <Text style={pdfStyles.col1}>Qty</Text>
          <Text style={pdfStyles.col2}>Rate</Text>
          <Text style={pdfStyles.col2}>Total</Text>
        </View>
        <View style={pdfStyles.tableRow}>
          <Text style={pdfStyles.col3}>{tagihan.jobDescription}</Text>
          <Text style={pdfStyles.col3}>{tagihan.namaPekerjaan}</Text>
          <Text style={pdfStyles.col1}>{tagihan.qty}</Text>
          <Text style={pdfStyles.col2}>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tagihan.rate)}</Text>
          <Text style={pdfStyles.col2}>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tagihan.totalTagihan)}</Text>
        </View>
      </View>

      {/* Total Section */}
      <View style={pdfStyles.totalSection}>
        <View style={pdfStyles.totalRow}>
          <Text style={pdfStyles.totalLabel}>TOTAL TAGIHAN:</Text>
          <Text style={pdfStyles.totalValue}>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tagihan.totalTagihan)}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={{ marginTop: 40 }}>
        <Text style={{ fontSize: 8, textAlign: 'center', color: '#666' }}>
          Terima kasih atas kepercayaan Anda kepada PT NILO
        </Text>
      </View>
    </Page>
  </Document>
);

const getStatusBadge = (status: string) => {
  switch (status) {
    case "draft":
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
    case "sent":
      return <Badge variant="outline"><FileText className="w-3 h-3 mr-1" />Terkirim</Badge>;
    case "paid":
      return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Lunas</Badge>;
    case "overdue":
      return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Terlambat</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function TagihanNiloPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTagihan, setSelectedTagihan] = useState<TagihanItem | null>(null);

  const columns: Column<TagihanItem>[] = [
    {
      key: "nomorTagihan",
      label: "No. Tagihan",
    },
    {
      key: "tanggal",
      label: "Tanggal",
      render: (value) => {
        return new Date(value as string).toLocaleDateString("id-ID");
      },
    },
    {
      key: "customer",
      label: "Customer",
    },
    {
      key: "namaPekerjaan",
      label: "Nama Pekerjaan",
    },
    {
      key: "totalTagihan",
      label: "Total",
      render: (value) => {
        return formatCurrency(value as number);
      },
    },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        return getStatusBadge(value as string);
      },
    },
  ];

  const filteredData = sampleTagihan.filter((item) => {
    const matchesSearch =
      item.nomorTagihan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.namaPekerjaan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalTagihan = sampleTagihan.length;
  const totalNilai = sampleTagihan.reduce((sum, item) => sum + item.totalTagihan, 0);
  const totalLunas = sampleTagihan.filter(item => item.status === "paid").reduce((sum, item) => sum + item.totalTagihan, 0);
  const totalOutstanding = sampleTagihan.filter(item => item.status !== "paid").reduce((sum, item) => sum + item.totalTagihan, 0);
  const countLunas = sampleTagihan.filter(item => item.status === "paid").length;
  const countOutstanding = sampleTagihan.filter(item => item.status !== "paid").length;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tagihan Fabrikasi - PT NILO</h2>
          <p className="text-muted-foreground">
            Kelola tagihan dan invoice untuk manpower fabrikasi PT NILO
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Buat Tagihan
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tagihan">Daftar Tagihan</TabsTrigger>
          <TabsTrigger value="laporan">Laporan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tagihan</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTagihan}</div>
                <p className="text-xs text-muted-foreground">Bulan ini</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Nilai</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalNilai)}</div>
                <p className="text-xs text-muted-foreground">Bulan ini</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lunas</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalLunas)}</div>
                <p className="text-xs text-muted-foreground">{countLunas} tagihan</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</div>
                <p className="text-xs text-muted-foreground">{countOutstanding} tagihan</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tagihan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Tagihan</CardTitle>
              <CardDescription>
                Semua tagihan untuk manpower fabrikasi PT NILO
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari tagihan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Terkirim</SelectItem>
                    <SelectItem value="paid">Lunas</SelectItem>
                    <SelectItem value="overdue">Terlambat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DataTable<TagihanItem>
                columns={columns}
                data={filteredData}
                actions={[
                  {
                    label: "View",
                    onClick: (row) => setSelectedTagihan(row),
                    variant: "ghost"
                  },
                  {
                    label: "Edit",
                    onClick: (row) => {
                      // Handle edit action
                      console.log("Edit tagihan:", row);
                    },
                    variant: "ghost"
                  },
                  {
                    label: "Download PDF",
                    onClick: (row) => {
                      // This will be handled by PDFDownloadLink in a future enhancement
                      console.log("Download PDF for:", row.nomorTagihan);
                    },
                    variant: "ghost"
                  }
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="laporan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Tagihan PT NILO</CardTitle>
              <CardDescription>
                Laporan dan analisis tagihan fabrikasi PT NILO
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ringkasan Bulan Ini</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Tagihan:</span>
                        <span className="font-medium">{totalTagihan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Nilai:</span>
                        <span className="font-medium">{formatCurrency(totalNilai)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sudah Lunas:</span>
                        <span className="font-medium text-green-600">{formatCurrency(totalLunas)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Outstanding:</span>
                        <span className="font-medium text-orange-600">{formatCurrency(totalOutstanding)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Status Pembayaran</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Draft:</span>
                        <span className="font-medium">{sampleTagihan.filter(item => item.status === "draft").length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Terkirim:</span>
                        <span className="font-medium">{sampleTagihan.filter(item => item.status === "sent").length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lunas:</span>
                        <span className="font-medium text-green-600">{sampleTagihan.filter(item => item.status === "paid").length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Terlambat:</span>
                        <span className="font-medium text-red-600">{sampleTagihan.filter(item => item.status === "overdue").length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Tagihan Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Buat Tagihan Baru - PT NILO</CardTitle>
              <CardDescription>
                Buat tagihan untuk job order fabrikasi PT NILO
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer">Customer</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-indo">PT Indo Steel</SelectItem>
                      <SelectItem value="pt-garuda">PT Garuda Manufacturing</SelectItem>
                      <SelectItem value="pt-krakatau">PT Krakatau Works</SelectItem>
                      <SelectItem value="pt-sinar">PT Sinar Jaya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tanggal">Tanggal Tagihan</Label>
                  <Input type="date" />
                </div>
              </div>

              {/* COA Section */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">COA (Chart of Account)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="coa">COA</Label>
                    <Input placeholder="4100-001" />
                  </div>
                  <div>
                    <Label htmlFor="nomorReferensi">Nomor Referensi</Label>
                    <Input placeholder="REF-NILO-001" />
                  </div>
                  <div>
                    <Label htmlFor="nomorPR">Nomor PR</Label>
                    <Input placeholder="PR-NILO-2025-001" />
                  </div>
                  <div>
                    <Label htmlFor="nomorPO">Nomor PO</Label>
                    <Input placeholder="PO-NILO-2025-001" />
                  </div>
                  <div>
                    <Label htmlFor="nomorSes">Nomor Ses</Label>
                    <Input placeholder="SES-NILO-2025-001" />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Tanggal Jatuh Tempo</Label>
                    <Input type="date" />
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Detail Pekerjaan</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="jobDescription">Job Description</Label>
                    <Textarea placeholder="Deskripsi lengkap pekerjaan..." />
                  </div>
                  <div>
                    <Label htmlFor="namaPekerjaan">Nama Pekerjaan</Label>
                    <Input placeholder="Nama spesifik pekerjaan" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="qty">Qty</Label>
                      <Input type="number" placeholder="1" />
                    </div>
                    <div>
                      <Label htmlFor="rate">Rate</Label>
                      <Input type="number" placeholder="0" />
                    </div>
                    <div>
                      <Label htmlFor="total">Total Tagihan</Label>
                      <Input type="number" placeholder="0" disabled />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Batal
                </Button>
                <Button onClick={() => setShowCreateForm(false)}>
                  Simpan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Tagihan Modal */}
      {selectedTagihan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Detail Tagihan - {selectedTagihan.nomorTagihan}</CardTitle>
              <CardDescription>
                Informasi lengkap tagihan PT NILO
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Informasi Dasar</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nomor Tagihan:</span>
                      <span>{selectedTagihan.nomorTagihan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tanggal:</span>
                      <span>{new Date(selectedTagihan.tanggal).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Customer:</span>
                      <span>{selectedTagihan.customer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      {getStatusBadge(selectedTagihan.status)}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">COA</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">COA:</span>
                      <span>{selectedTagihan.coa}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">No. Referensi:</span>
                      <span>{selectedTagihan.nomorReferensi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">No. PR:</span>
                      <span>{selectedTagihan.nomorPR}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">No. PO:</span>
                      <span>{selectedTagihan.nomorPO}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">No. Ses:</span>
                      <span>{selectedTagihan.nomorSes}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div>
                <h3 className="font-semibold mb-2">Detail Pekerjaan</h3>
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Job Description:</span>
                    <span>{selectedTagihan.jobDescription}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nama Pekerjaan:</span>
                    <span>{selectedTagihan.namaPekerjaan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Qty:</span>
                    <span>{selectedTagihan.qty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rate:</span>
                    <span>{formatCurrency(selectedTagihan.rate)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Tagihan:</span>
                    <span>{formatCurrency(selectedTagihan.totalTagihan)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <PDFDownloadLink
                  document={<TagihanPDF tagihan={selectedTagihan} />}
                  fileName={`${selectedTagihan.nomorTagihan}.pdf`}
                >
                  {({ blob, url, loading, error }) => (
                    <Button disabled={loading}>
                      <Download className="mr-2 h-4 w-4" />
                      {loading ? 'Membuat PDF...' : 'Download PDF'}
                    </Button>
                  )}
                </PDFDownloadLink>
                <Button variant="outline" onClick={() => setSelectedTagihan(null)}>
                  Tutup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
