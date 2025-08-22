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
import type { ColumnDef } from "@tanstack/react-table";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
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
  AlertCircle,
  Printer
} from "lucide-react";

// Types for billing data
interface TagihanItem {
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

// Form data interface for new invoice
interface FormData {
  customer: string;
  tanggal: string;
  dueDate: string;
  coa: string;
  nomorReferensi: string;
  nomorPR: string;
  nomorPO: string;
  nomorSes: string;
  jobDescription: string;
  namaPekerjaan: string;
  qty: number;
  rate: number;
}

// Sample data for PT TAM
const sampleTagihan: TagihanItem[] = [
  {
    id: "1",
    nomorTagihan: "INV-TAM-FAB-2025-001",
    tanggal: "2025-08-15",
    customer: "PT ABC Manufacturing",
    coa: "4100-001",
    nomorReferensi: "REF-TAM-001",
    nomorPR: "PR-2025-001",
    nomorPO: "PO-2025-001",
    nomorSes: "SES-2025-001",
    jobDescription: "Fabrikasi Struktur Baja",
    namaPekerjaan: "Pembuatan Frame Mesin",
    qty: 2,
    rate: 7500000,
    totalTagihan: 15000000,
    status: "sent",
    dueDate: "2025-09-15"
  },
  {
    id: "2",
    nomorTagihan: "INV-TAM-FAB-2025-002",
    tanggal: "2025-08-18",
    customer: "PT XYZ Industries",
    coa: "4100-002",
    nomorReferensi: "REF-TAM-002",
    nomorPR: "PR-2025-002",
    nomorPO: "PO-2025-002",
    nomorSes: "SES-2025-002",
    jobDescription: "Fabrikasi Tangki",
    namaPekerjaan: "Pembuatan Tangki Air",
    qty: 1,
    rate: 25000000,
    totalTagihan: 25000000,
    status: "paid",
    dueDate: "2025-09-18"
  },
  {
    id: "3",
    nomorTagihan: "INV-TAM-FAB-2025-003",
    tanggal: "2025-08-20",
    customer: "PT DEF Corporation",
    coa: "4100-003",
    nomorReferensi: "REF-TAM-003",
    nomorPR: "PR-2025-003",
    nomorPO: "PO-2025-003",
    nomorSes: "SES-2025-003",
    jobDescription: "Fabrikasi Conveyor",
    namaPekerjaan: "Pembuatan Conveyor Belt",
    qty: 3,
    rate: 2833333,
    totalTagihan: 8500000,
    status: "draft",
    dueDate: "2025-09-20"
  }
];

// Enhanced PDF Styles matching Picture1.jpg layout
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingBottom: 10,
  },
  companySection: {
    flex: 1,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#000000',
  },
  companyInfo: {
    fontSize: 8,
    color: '#333333',
    marginBottom: 1,
  },
  invoiceSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  invoiceNumber: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
  },
  mainContent: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  leftColumn: {
    flex: 1,
    marginRight: 20,
  },
  rightColumn: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000000',
    backgroundColor: '#f0f0f0',
    padding: 4,
    textAlign: 'center',
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 2,
  },
  fieldLabel: {
    width: '40%',
    fontSize: 8,
    fontWeight: 'bold',
    color: '#333333',
  },
  fieldValue: {
    width: '60%',
    fontSize: 8,
    color: '#000000',
  },
  tableSection: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#000000',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#cccccc',
    paddingVertical: 4,
    paddingHorizontal: 4,
    minHeight: 20,
  },
  tableCell: {
    fontSize: 8,
    color: '#000000',
    textAlign: 'center',
  },
  col1: { width: '5%' },   // No
  col2: { width: '25%' },  // Job Description
  col3: { width: '25%' },  // Nama Pekerjaan
  col4: { width: '8%' },   // Qty
  col5: { width: '20%' },  // Rate
  col6: { width: '17%' },  // Total
  totalsSection: {
    marginTop: 15,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    marginBottom: 3,
    width: 200,
  },
  totalLabel: {
    width: '70%',
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'right',
    paddingRight: 10,
  },
  totalValue: {
    width: '30%',
    fontSize: 9,
    textAlign: 'right',
    fontWeight: 'bold',
    borderBottomWidth: 0.5,
    borderBottomColor: '#000000',
    paddingBottom: 2,
  },
  grandTotalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  grandTotalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#000000',
    paddingTop: 2,
    paddingBottom: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: 'center',
    fontSize: 7,
    color: '#666666',
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
    paddingTop: 10,
  }
});

// PDF Document Component matching Picture1.jpg
const TagihanPDF = ({ tagihan }: { tagihan: TagihanItem | FormData & { nomorTagihan: string; totalTagihan: number } }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      {/* Header - Company Info and Invoice Title */}
      <View style={pdfStyles.header}>
        <View style={pdfStyles.companySection}>
          <Text style={pdfStyles.companyName}>PT TAM</Text>
          <Text style={pdfStyles.companyInfo}>Jl. Industri Raya No. 123, Jakarta 12345</Text>
          <Text style={pdfStyles.companyInfo}>Telp: (021) 12345678 | Fax: (021) 12345679</Text>
          <Text style={pdfStyles.companyInfo}>Email: info@pttam.com | NPWP: 01.234.567.8-901.000</Text>
        </View>
        <View style={pdfStyles.invoiceSection}>
          <Text style={pdfStyles.invoiceTitle}>TAGIHAN</Text>
          <Text style={pdfStyles.invoiceNumber}>No: {tagihan.nomorTagihan}</Text>
        </View>
      </View>

      {/* Main Content - Customer Info and COA */}
      <View style={pdfStyles.mainContent}>
        {/* Left Column - Customer Info */}
        <View style={pdfStyles.leftColumn}>
          <Text style={pdfStyles.sectionTitle}>INFORMASI CUSTOMER</Text>
          <View style={pdfStyles.fieldRow}>
            <Text style={pdfStyles.fieldLabel}>Kepada:</Text>
            <Text style={pdfStyles.fieldValue}>{tagihan.customer}</Text>
          </View>
          <View style={pdfStyles.fieldRow}>
            <Text style={pdfStyles.fieldLabel}>Tanggal:</Text>
            <Text style={pdfStyles.fieldValue}>
              {new Date(tagihan.tanggal).toLocaleDateString('id-ID')}
            </Text>
          </View>
          <View style={pdfStyles.fieldRow}>
            <Text style={pdfStyles.fieldLabel}>Jatuh Tempo:</Text>
            <Text style={pdfStyles.fieldValue}>
              {new Date(tagihan.dueDate).toLocaleDateString('id-ID')}
            </Text>
          </View>
        </View>

        {/* Right Column - COA */}
        <View style={pdfStyles.rightColumn}>
          <Text style={pdfStyles.sectionTitle}>COA (CHART OF ACCOUNT)</Text>
          <View style={pdfStyles.fieldRow}>
            <Text style={pdfStyles.fieldLabel}>COA:</Text>
            <Text style={pdfStyles.fieldValue}>{tagihan.coa}</Text>
          </View>
          <View style={pdfStyles.fieldRow}>
            <Text style={pdfStyles.fieldLabel}>No. Referensi:</Text>
            <Text style={pdfStyles.fieldValue}>{tagihan.nomorReferensi}</Text>
          </View>
          <View style={pdfStyles.fieldRow}>
            <Text style={pdfStyles.fieldLabel}>No. PR:</Text>
            <Text style={pdfStyles.fieldValue}>{tagihan.nomorPR}</Text>
          </View>
          <View style={pdfStyles.fieldRow}>
            <Text style={pdfStyles.fieldLabel}>No. PO:</Text>
            <Text style={pdfStyles.fieldValue}>{tagihan.nomorPO}</Text>
          </View>
          <View style={pdfStyles.fieldRow}>
            <Text style={pdfStyles.fieldLabel}>No. Ses:</Text>
            <Text style={pdfStyles.fieldValue}>{tagihan.nomorSes}</Text>
          </View>
        </View>
      </View>

      {/* Table Section - Job Details */}
      <View style={pdfStyles.tableSection}>
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, pdfStyles.col1]}>No.</Text>
          <Text style={[pdfStyles.tableHeaderCell, pdfStyles.col2]}>Job Description</Text>
          <Text style={[pdfStyles.tableHeaderCell, pdfStyles.col3]}>Nama Pekerjaan</Text>
          <Text style={[pdfStyles.tableHeaderCell, pdfStyles.col4]}>Qty</Text>
          <Text style={[pdfStyles.tableHeaderCell, pdfStyles.col5]}>Rate</Text>
          <Text style={[pdfStyles.tableHeaderCell, pdfStyles.col6]}>Total Tagihan</Text>
        </View>
        <View style={pdfStyles.tableRow}>
          <Text style={[pdfStyles.tableCell, pdfStyles.col1]}>1</Text>
          <Text style={[pdfStyles.tableCell, pdfStyles.col2, { textAlign: 'left', paddingLeft: 5 }]}>
            {tagihan.jobDescription}
          </Text>
          <Text style={[pdfStyles.tableCell, pdfStyles.col3, { textAlign: 'left', paddingLeft: 5 }]}>
            {tagihan.namaPekerjaan}
          </Text>
          <Text style={[pdfStyles.tableCell, pdfStyles.col4]}>
            {tagihan.qty}
          </Text>
          <Text style={[pdfStyles.tableCell, pdfStyles.col5, { textAlign: 'right', paddingRight: 5 }]}>
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tagihan.rate)}
          </Text>
          <Text style={[pdfStyles.tableCell, pdfStyles.col6, { textAlign: 'right', paddingRight: 5 }]}>
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tagihan.totalTagihan)}
          </Text>
        </View>
      </View>

      {/* Totals Section */}
      <View style={pdfStyles.totalsSection}>
        <View style={pdfStyles.totalRow}>
          <Text style={pdfStyles.totalLabel}>Subtotal:</Text>
          <Text style={pdfStyles.totalValue}>
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tagihan.totalTagihan)}
          </Text>
        </View>
        <View style={pdfStyles.totalRow}>
          <Text style={pdfStyles.totalLabel}>PPN (11%):</Text>
          <Text style={pdfStyles.totalValue}>
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tagihan.totalTagihan * 0.11)}
          </Text>
        </View>
        <View style={pdfStyles.totalRow}>
          <Text style={[pdfStyles.totalLabel, pdfStyles.grandTotalLabel]}>TOTAL TAGIHAN:</Text>
          <Text style={[pdfStyles.totalValue, pdfStyles.grandTotalValue]}>
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tagihan.totalTagihan * 1.11)}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={pdfStyles.footer}>
        <Text>Terima kasih atas kepercayaan Anda kepada PT TAM</Text>
        <Text>Dokumen ini dibuat secara elektronik dan sah tanpa tanda tangan basah</Text>
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

export default function TagihanPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTagihan, setSelectedTagihan] = useState<TagihanItem | null>(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);

  // Form state for new invoice
  const [formData, setFormData] = useState<FormData>({
    customer: "",
    tanggal: new Date().toISOString().split('T')[0] || "",
    dueDate: "",
    coa: "",
    nomorReferensi: "",
    nomorPR: "",
    nomorPO: "",
    nomorSes: "",
    jobDescription: "",
    namaPekerjaan: "",
    qty: 1,
    rate: 0,
  });

  // Generate preview data for PDF
  const generatePreviewData = () => {
    const totalTagihan = formData.qty * formData.rate;
    const nextInvoiceNumber = `INV-TAM-FAB-2025-${String(sampleTagihan.length + 1).padStart(3, '0')}`;

    return {
      ...formData,
      nomorTagihan: nextInvoiceNumber,
      totalTagihan,
    };
  };

  const handleFormChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const columns: ColumnDef<TagihanItem>[] = [
    {
      accessorKey: "nomorTagihan",
      header: "No. Tagihan",
    },
    {
      accessorKey: "tanggal",
      header: "Tanggal",
      cell: ({ row }) => {
        return new Date(row.getValue("tanggal")).toLocaleDateString("id-ID");
      },
    },
    {
      accessorKey: "customer",
      header: "Customer",
    },
    {
      accessorKey: "namaPekerjaan",
      header: "Nama Pekerjaan",
    },
    {
      accessorKey: "totalTagihan",
      header: "Total",
      cell: ({ row }) => {
        return formatCurrency(row.getValue("totalTagihan"));
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return getStatusBadge(row.getValue("status"));
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const tagihan = row.original;
        return (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedTagihan(tagihan)}>
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
            <PDFDownloadLink
              document={<TagihanPDF tagihan={tagihan} />}
              fileName={`${tagihan.nomorTagihan}.pdf`}
            >
              {({ loading }) => (
                <Button variant="ghost" size="sm" disabled={loading} title="Download PDF">
                  <Download className="w-4 h-4" />
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        );
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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tagihan Fabrikasi</h2>
          <p className="text-muted-foreground">
            Kelola tagihan dan invoice untuk manpower fabrikasi
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
                <p className="text-xs text-muted-foreground">1 tagihan</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</div>
                <p className="text-xs text-muted-foreground">2 tagihan</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tagihan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Tagihan</CardTitle>
              <CardDescription>
                Semua tagihan untuk manpower fabrikasi
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
              <DataTable
                columns={columns as any}
                data={filteredData as any}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="laporan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Tagihan</CardTitle>
              <CardDescription>
                Laporan dan analisis tagihan fabrikasi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Laporan tagihan akan ditampilkan di sini
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced Create Tagihan Form Modal with PDF Preview */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-7xl max-h-[95vh] overflow-hidden">
            <CardHeader>
              <CardTitle>Buat Tagihan Baru</CardTitle>
              <CardDescription>
                Buat tagihan untuk job order fabrikasi dengan preview PDF
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-6 h-[80vh]">
              {/* Left Side - Form */}
              <div className="flex-1 space-y-6 overflow-y-auto pr-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer">Customer</Label>
                    <Select onValueChange={(value) => handleFormChange('customer', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih customer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PT ABC Manufacturing">PT ABC Manufacturing</SelectItem>
                        <SelectItem value="PT XYZ Industries">PT XYZ Industries</SelectItem>
                        <SelectItem value="PT DEF Corporation">PT DEF Corporation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tanggal">Tanggal Tagihan</Label>
                    <Input
                      type="date"
                      value={formData.tanggal}
                      onChange={(e) => handleFormChange('tanggal', e.target.value)}
                    />
                  </div>
                </div>

                {/* COA Section */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">COA (Chart of Account)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="coa">COA</Label>
                      <Input
                        placeholder="4100-001"
                        value={formData.coa}
                        onChange={(e) => handleFormChange('coa', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nomorReferensi">Nomor Referensi</Label>
                      <Input
                        placeholder="REF-TAM-001"
                        value={formData.nomorReferensi}
                        onChange={(e) => handleFormChange('nomorReferensi', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nomorPR">Nomor PR</Label>
                      <Input
                        placeholder="PR-2025-001"
                        value={formData.nomorPR}
                        onChange={(e) => handleFormChange('nomorPR', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nomorPO">Nomor PO</Label>
                      <Input
                        placeholder="PO-2025-001"
                        value={formData.nomorPO}
                        onChange={(e) => handleFormChange('nomorPO', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nomorSes">Nomor Ses</Label>
                      <Input
                        placeholder="SES-2025-001"
                        value={formData.nomorSes}
                        onChange={(e) => handleFormChange('nomorSes', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Tanggal Jatuh Tempo</Label>
                      <Input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => handleFormChange('dueDate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Job Details */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Detail Pekerjaan</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="jobDescription">Job Description</Label>
                      <Textarea
                        placeholder="Deskripsi lengkap pekerjaan..."
                        value={formData.jobDescription}
                        onChange={(e) => handleFormChange('jobDescription', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="namaPekerjaan">Nama Pekerjaan</Label>
                      <Input
                        placeholder="Nama spesifik pekerjaan"
                        value={formData.namaPekerjaan}
                        onChange={(e) => handleFormChange('namaPekerjaan', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="qty">Qty</Label>
                        <Input
                          type="number"
                          placeholder="1"
                          value={formData.qty}
                          onChange={(e) => handleFormChange('qty', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="rate">Rate</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={formData.rate}
                          onChange={(e) => handleFormChange('rate', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="total">Total Tagihan</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={formData.qty * formData.rate}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Batal
                  </Button>
                  <Button>
                    Simpan
                  </Button>
                </div>
              </div>

              {/* Right Side - PDF Preview */}
              <div className="flex-1 border-l pl-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Preview PDF</h3>
                  <PDFDownloadLink
                    document={<TagihanPDF tagihan={generatePreviewData()} />}
                    fileName={`Preview-${generatePreviewData().nomorTagihan}.pdf`}
                  >
                    {({ loading }) => (
                      <Button variant="outline" size="sm" disabled={loading}>
                        <Download className="mr-2 h-4 w-4" />
                        {loading ? 'Generating...' : 'Download'}
                      </Button>
                    )}
                  </PDFDownloadLink>
                </div>
                <div className="border rounded-lg overflow-hidden" style={{ height: 'calc(100% - 60px)' }}>
                  <PDFViewer style={{ width: '100%', height: '100%' }}>
                    <TagihanPDF tagihan={generatePreviewData()} />
                  </PDFViewer>
                </div>
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
                Informasi lengkap tagihan
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
                  {({ loading }) => (
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
