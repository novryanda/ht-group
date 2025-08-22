"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Checkbox } from "~/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import {
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Download,
  Eye
} from "lucide-react";

// Interface for supplier data based on the form image
interface SupplierFormData {
  // Header Info
  nomorForm: string;
  tipeSupplier: 'ramp-peron' | 'kud' | 'kelompok-tani';

  // Identitas
  namaPemilik: string;
  alamat: string;
  nomorHpTelp: string;
  namaPerusahaan: string;
  alamatRampPeron: string;

  // Profil Kebun
  tahunTanam: string;
  luasKebun: string;
  estimasiSupplyTBS: string;
  total: string;

  // Tipe Pengelolaan Kebun
  swadaya: string;
  kelompok: string;
  perusahaan: string;
  jenisBibit: string;
  sertifikasiKebun: {
    ispo: boolean;
    rspo: boolean;
  };

  // Profil Izin Usaha
  aktePendirian: string;
  aktePerubahan: string;
  nib: string;
  siup: string;
  npwp: string;

  // Penjualan TBS
  langsungPKS: string;
  agen: string;

  // Transportasi
  milikSendiri: string;
  jasaPihakKe3: string;

  // Catatan dan tanda tangan
  catatan: string;
}

interface Supplier {
  id: string;
  nomorForm: string;
  namaPemilik: string;
  namaPerusahaan: string;
  tipeSupplier: string;
  status: "draft" | "pending" | "approved" | "rejected";
  tanggalDaftar: string;
  rating?: number;
}

// Sample existing suppliers
const sampleSuppliers: Supplier[] = [
  {
    id: "1",
    nomorForm: "PKS/TRT/SUPP-TBS/001/2024",
    namaPemilik: "Ahmad Suryanto",
    namaPerusahaan: "PT Sawit Makmur",
    tipeSupplier: "Kelompok Tani",
    status: "approved",
    tanggalDaftar: "15 Jan 2023",
    rating: 4.8
  },
  {
    id: "2",
    nomorForm: "PKS/TRT/SUPP-TBS/002/2024",
    namaPemilik: "Siti Nurhaliza",
    namaPerusahaan: "CV Bumi Hijau",
    tipeSupplier: "KUD",
    status: "approved",
    tanggalDaftar: "22 Mar 2023",
    rating: 4.5
  },
  {
    id: "3",
    nomorForm: "PKS/TRT/SUPP-TBS/003/2024",
    namaPemilik: "Budi Santoso",
    namaPerusahaan: "PT Kelapa Sawit Nusantara",
    tipeSupplier: "Ramp/Peron",
    status: "pending",
    tanggalDaftar: "10 Aug 2025"
  }
];

// PDF Styles based on the form layout
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  formNumber: {
    fontSize: 10,
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#000000',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    padding: 5,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#000000',
    minHeight: 25,
  },
  cell: {
    padding: 3,
    fontSize: 8,
    borderRightWidth: 0.5,
    borderRightColor: '#000000',
    justifyContent: 'center',
  },
  labelCell: {
    width: '30%',
    fontWeight: 'bold',
  },
  valueCell: {
    width: '70%',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  checkbox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: '#000000',
    marginRight: 5,
  },
  checkedBox: {
    backgroundColor: '#000000',
  },
  signatureSection: {
    flexDirection: 'row',
    marginTop: 20,
  },
  signatureBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000000',
    height: 80,
    margin: 5,
    padding: 5,
  },
  signatureTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  signatureLine: {
    fontSize: 8,
    textAlign: 'center',
    marginTop: 50,
  }
});

// PDF Component
const SupplierFormPDF = ({ data }: { data: SupplierFormData }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      {/* Header */}
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.title}>PT. TARO RAKAYA TASYRA</Text>
        <Text style={pdfStyles.subtitle}>FORM CALON SUPPLIER TBS SAWIT</Text>
        <Text style={pdfStyles.formNumber}>Nomor: {data.nomorForm}</Text>
      </View>

      {/* Type Supplier */}
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Type Supplier :</Text>
        <View style={pdfStyles.row}>
          <View style={[pdfStyles.cell, { flexDirection: 'row', alignItems: 'center' }]}>
            <Text>Ramp/Peron </Text>
            <View style={[pdfStyles.checkbox, ...(data.tipeSupplier === 'ramp-peron' ? [pdfStyles.checkedBox] : [])]} />
            <Text style={{ marginLeft: 20 }}>KUD </Text>
            <View style={[pdfStyles.checkbox, ...(data.tipeSupplier === 'kud' ? [pdfStyles.checkedBox] : [])]} />
            <Text style={{ marginLeft: 20 }}>Kelompok Tani </Text>
            <View style={[pdfStyles.checkbox, ...(data.tipeSupplier === 'kelompok-tani' ? [pdfStyles.checkedBox] : [])]} />
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={{ flexDirection: 'row' }}>
        {/* Left Column */}
        <View style={{ flex: 1, marginRight: 10 }}>
          {/* Identitas */}
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>IDENTITAS</Text>
            <View style={pdfStyles.row}>
              <View style={[pdfStyles.cell, pdfStyles.labelCell]}>
                <Text>Nama Pemilik</Text>
              </View>
              <View style={[pdfStyles.cell, pdfStyles.valueCell]}>
                <Text>{data.namaPemilik}</Text>
              </View>
            </View>
            <View style={pdfStyles.row}>
              <View style={[pdfStyles.cell, pdfStyles.labelCell]}>
                <Text>Alamat</Text>
              </View>
              <View style={[pdfStyles.cell, pdfStyles.valueCell]}>
                <Text>{data.alamat}</Text>
              </View>
            </View>
            <View style={pdfStyles.row}>
              <View style={[pdfStyles.cell, pdfStyles.labelCell]}>
                <Text>Nomor HP/Telp</Text>
              </View>
              <View style={[pdfStyles.cell, pdfStyles.valueCell]}>
                <Text>{data.nomorHpTelp}</Text>
              </View>
            </View>
            <View style={pdfStyles.row}>
              <View style={[pdfStyles.cell, pdfStyles.labelCell]}>
                <Text>Nama Perusahaan</Text>
              </View>
              <View style={[pdfStyles.cell, pdfStyles.valueCell]}>
                <Text>{data.namaPerusahaan}</Text>
              </View>
            </View>
            <View style={pdfStyles.row}>
              <View style={[pdfStyles.cell, pdfStyles.labelCell]}>
                <Text>Alamat Ramp/Peron</Text>
              </View>
              <View style={[pdfStyles.cell, pdfStyles.valueCell]}>
                <Text>{data.alamatRampPeron}</Text>
              </View>
            </View>
          </View>

          {/* Tipe Pengelolaan Kebun */}
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>TIPE PENGELOLAAN KEBUN</Text>
            <View style={pdfStyles.row}>
              <View style={[pdfStyles.cell, pdfStyles.labelCell]}>
                <Text>Swadaya</Text>
              </View>
              <View style={[pdfStyles.cell, pdfStyles.valueCell]}>
                <Text>{data.swadaya}</Text>
              </View>
            </View>
            <View style={pdfStyles.row}>
              <View style={[pdfStyles.cell, pdfStyles.labelCell]}>
                <Text>Kelompok</Text>
              </View>
              <View style={[pdfStyles.cell, pdfStyles.valueCell]}>
                <Text>{data.kelompok}</Text>
              </View>
            </View>
            <View style={pdfStyles.row}>
              <View style={[pdfStyles.cell, pdfStyles.labelCell]}>
                <Text>Perusahaan</Text>
              </View>
              <View style={[pdfStyles.cell, pdfStyles.valueCell]}>
                <Text>{data.perusahaan}</Text>
              </View>
            </View>
            <View style={pdfStyles.row}>
              <View style={[pdfStyles.cell, pdfStyles.labelCell]}>
                <Text>Jenis Bibit</Text>
              </View>
              <View style={[pdfStyles.cell, pdfStyles.valueCell]}>
                <Text>{data.jenisBibit}</Text>
              </View>
            </View>
            <View style={pdfStyles.row}>
              <View style={[pdfStyles.cell, pdfStyles.labelCell]}>
                <Text>Sertifikasi Kebun</Text>
              </View>
              <View style={[pdfStyles.cell, pdfStyles.valueCell, { flexDirection: 'row' }]}>
                <Text>ISPO </Text>
                <View style={[pdfStyles.checkbox, ...(data.sertifikasiKebun.ispo ? [pdfStyles.checkedBox] : [])]} />
                <Text style={{ marginLeft: 20 }}>RSPO </Text>
                <View style={[pdfStyles.checkbox, ...(data.sertifikasiKebun.rspo ? [pdfStyles.checkedBox] : [])]} />
              </View>
            </View>
          </View>

          {/* Profil Izin Usaha */}
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>PROFIL IZIN USAHA</Text>
            <View style={pdfStyles.row}>
              <View style={[pdfStyles.cell, pdfStyles.labelCell]}>
                <Text>Akte Pendirian</Text>
              </View>
              <View style={[pdfStyles.cell, pdfStyles.valueCell]}>
                <Text>{data.aktePendirian}</Text>
              </View>
            </View>
            <View style={pdfStyles.row}>
              <View style={[pdfStyles.cell, pdfStyles.labelCell]}>
                <Text>Akte Perubahan</Text>
              </View>
              <View style={[pdfStyles.cell, pdfStyles.valueCell]}>
                <Text>{data.aktePerubahan}</Text>
              </View>
            </View>
            <View style={pdfStyles.row}>
              <View style={[pdfStyles.cell, pdfStyles.labelCell]}>
                <Text>NIB</Text>
              </View>
              <View style={[pdfStyles.cell, pdfStyles.valueCell]}>
                <Text>{data.nib}</Text>
              </View>
            </View>
            <View style={pdfStyles.row}>
              <View style={[pdfStyles.cell, pdfStyles.labelCell]}>
                <Text>SIUP</Text>
              </View>
              <View style={[pdfStyles.cell, pdfStyles.valueCell]}>
                <Text>{data.siup}</Text>
              </View>
            </View>
            <View style={pdfStyles.row}>
              <View style={[pdfStyles.cell, pdfStyles.labelCell]}>
                <Text>NPWP</Text>
              </View>
              <View style={[pdfStyles.cell, pdfStyles.valueCell]}>
                <Text>{data.npwp}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Right Column */}
        <View style={{ flex: 1, marginLeft: 10 }}>
          {/* Profil Kebun */}
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>PROFIL KEBUN</Text>
            <View style={pdfStyles.row}>
              <View style={[pdfStyles.cell, pdfStyles.labelCell]}>
                <Text>Tahun Tanam</Text>
              </View>
              <View style={[pdfStyles.cell, { width: '35%' }]}>
                <Text>Luas Kebun</Text>
              </View>
              <View style={[pdfStyles.cell, { width: '35%' }]}>
                <Text>Estimasi Supply TBS</Text>
              </View>
            </View>
            <View style={pdfStyles.row}>
              <View style={[pdfStyles.cell, pdfStyles.labelCell]}>
                <Text>{data.tahunTanam}</Text>
              </View>
              <View style={[pdfStyles.cell, { width: '35%' }]}>
                <Text>{data.luasKebun}</Text>
              </View>
              <View style={[pdfStyles.cell, { width: '35%' }]}>
                <Text>{data.estimasiSupplyTBS}</Text>
              </View>
            </View>
            <View style={pdfStyles.row}>
              <View style={[pdfStyles.cell, pdfStyles.labelCell]}>
                <Text>Total</Text>
              </View>
              <View style={[pdfStyles.cell, { width: '70%' }]}>
                <Text>{data.total}</Text>
              </View>
            </View>
          </View>

          {/* Penjualan TBS */}
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>PENJUALAN TBS</Text>
            <View style={pdfStyles.row}>
              <View style={[pdfStyles.cell, pdfStyles.labelCell]}>
                <Text>Langsung PKS</Text>
              </View>
              <View style={[pdfStyles.cell, pdfStyles.valueCell]}>
                <Text>{data.langsungPKS}</Text>
              </View>
            </View>
            <View style={pdfStyles.row}>
              <View style={[pdfStyles.cell, pdfStyles.labelCell]}>
                <Text>Agen</Text>
              </View>
              <View style={[pdfStyles.cell, pdfStyles.valueCell]}>
                <Text>{data.agen}</Text>
              </View>
            </View>
          </View>

          {/* Transportasi */}
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>TRANSPORTASI</Text>
            <View style={pdfStyles.row}>
              <View style={[pdfStyles.cell, pdfStyles.labelCell]}>
                <Text>Milik Sendiri</Text>
              </View>
              <View style={[pdfStyles.cell, pdfStyles.valueCell]}>
                <Text>{data.milikSendiri} unit</Text>
              </View>
            </View>
            <View style={pdfStyles.row}>
              <View style={[pdfStyles.cell, pdfStyles.labelCell]}>
                <Text>Jasa Pihak ke3</Text>
              </View>
              <View style={[pdfStyles.cell, pdfStyles.valueCell]}>
                <Text>{data.jasaPihakKe3} unit</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Signature Section */}
      <View style={pdfStyles.signatureSection}>
        <View style={pdfStyles.signatureBox}>
          <Text style={pdfStyles.signatureTitle}>Catatan:</Text>
          <Text style={{ fontSize: 8, marginTop: 5 }}>{data.catatan}</Text>
          <Text style={pdfStyles.signatureLine}>(tim pembelian)</Text>
        </View>
        <View style={pdfStyles.signatureBox}>
          <Text style={pdfStyles.signatureTitle}>Pkl. Kerinci, ..../...../ 2024</Text>
          <Text style={pdfStyles.signatureLine}>(calon supplier)</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default function PendaftaranSupplierPage() {
  const [suppliers] = useState<Supplier[]>(sampleSuppliers);
  const [activeTab, setActiveTab] = useState("list");
  const [formData, setFormData] = useState<SupplierFormData>({
    nomorForm: `PKS/TRT/SUPP-TBS/${String(suppliers.length + 1).padStart(3, '0')}/2024`,
    tipeSupplier: 'ramp-peron',
    namaPemilik: '',
    alamat: '',
    nomorHpTelp: '',
    namaPerusahaan: '',
    alamatRampPeron: '',
    tahunTanam: '',
    luasKebun: '',
    estimasiSupplyTBS: '',
    total: '',
    swadaya: '',
    kelompok: '',
    perusahaan: '',
    jenisBibit: '',
    sertifikasiKebun: {
      ispo: false,
      rspo: false,
    },
    aktePendirian: '',
    aktePerubahan: '',
    nib: '',
    siup: '',
    npwp: '',
    langsungPKS: '',
    agen: '',
    milikSendiri: '',
    jasaPihakKe3: '',
    catatan: '',
  });

  const handleInputChange = (field: keyof SupplierFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Here you would typically send the data to your backend
    alert('Form supplier berhasil disimpan!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pendaftaran Supplier</h1>
          <p className="text-muted-foreground">
            Kelola pendaftaran dan data supplier bahan baku
          </p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => setActiveTab("form")}
        >
          <Plus className="h-4 w-4" />
          Daftarkan Supplier
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Daftar Supplier</TabsTrigger>
          <TabsTrigger value="form">Form Pendaftaran</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Supplier</CardTitle>
                <Building2 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">
                  Supplier terdaftar
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Supplier Aktif</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">20</div>
                <p className="text-xs text-muted-foreground">
                  87% dari total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">
                  Menunggu verifikasi
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Supplier Baru</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  Bulan ini
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Cari Supplier
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter Status
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daftar Supplier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suppliers.map((supplier) => (
                  <div key={supplier.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{supplier.namaPerusahaan}</h3>
                      <p className="text-sm text-muted-foreground">{supplier.namaPemilik} - {supplier.tipeSupplier}</p>
                      <p className="text-xs text-muted-foreground">
                        {supplier.nomorForm} | Terdaftar: {supplier.tanggalDaftar}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        supplier.status === 'approved' ? 'default' :
                        supplier.status === 'pending' ? 'secondary' : 'outline'
                      }>
                        {supplier.status === 'approved' ? 'Aktif' :
                         supplier.status === 'pending' ? 'Pending' : 'Inactive'}
                      </Badge>
                      {supplier.rating && (
                        <p className="text-sm font-semibold mt-1">Rating: {supplier.rating}/5</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Calon Supplier TBS Sawit</CardTitle>
              <p className="text-sm text-muted-foreground">
                Nomor: {formData.nomorForm}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Type Supplier */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Type Supplier</Label>
                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ramp-peron"
                      checked={formData.tipeSupplier === 'ramp-peron'}
                      onCheckedChange={() => handleInputChange('tipeSupplier', 'ramp-peron')}
                    />
                    <Label htmlFor="ramp-peron">Ramp/Peron</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="kud"
                      checked={formData.tipeSupplier === 'kud'}
                      onCheckedChange={() => handleInputChange('tipeSupplier', 'kud')}
                    />
                    <Label htmlFor="kud">KUD</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="kelompok-tani"
                      checked={formData.tipeSupplier === 'kelompok-tani'}
                      onCheckedChange={() => handleInputChange('tipeSupplier', 'kelompok-tani')}
                    />
                    <Label htmlFor="kelompok-tani">Kelompok Tani</Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Identitas */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">IDENTITAS</h3>
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="namaPemilik">Nama Pemilik</Label>
                        <Input
                          id="namaPemilik"
                          value={formData.namaPemilik}
                          onChange={(e) => handleInputChange('namaPemilik', e.target.value)}
                          placeholder="Masukkan nama pemilik"
                        />
                      </div>
                      <div>
                        <Label htmlFor="alamat">Alamat</Label>
                        <Textarea
                          id="alamat"
                          value={formData.alamat}
                          onChange={(e) => handleInputChange('alamat', e.target.value)}
                          placeholder="Masukkan alamat lengkap"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nomorHpTelp">Nomor HP/Telp</Label>
                        <Input
                          id="nomorHpTelp"
                          value={formData.nomorHpTelp}
                          onChange={(e) => handleInputChange('nomorHpTelp', e.target.value)}
                          placeholder="Masukkan nomor HP/Telp"
                        />
                      </div>
                      <div>
                        <Label htmlFor="namaPerusahaan">Nama Perusahaan</Label>
                        <Input
                          id="namaPerusahaan"
                          value={formData.namaPerusahaan}
                          onChange={(e) => handleInputChange('namaPerusahaan', e.target.value)}
                          placeholder="Masukkan nama perusahaan"
                        />
                      </div>
                      <div>
                        <Label htmlFor="alamatRampPeron">Alamat Ramp/Peron</Label>
                        <Textarea
                          id="alamatRampPeron"
                          value={formData.alamatRampPeron}
                          onChange={(e) => handleInputChange('alamatRampPeron', e.target.value)}
                          placeholder="Masukkan alamat ramp/peron"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tipe Pengelolaan Kebun */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">TIPE PENGELOLAAN KEBUN</h3>
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="swadaya">Swadaya</Label>
                        <Input
                          id="swadaya"
                          value={formData.swadaya}
                          onChange={(e) => handleInputChange('swadaya', e.target.value)}
                          placeholder="Masukkan data swadaya"
                        />
                      </div>
                      <div>
                        <Label htmlFor="kelompok">Kelompok</Label>
                        <Input
                          id="kelompok"
                          value={formData.kelompok}
                          onChange={(e) => handleInputChange('kelompok', e.target.value)}
                          placeholder="Masukkan data kelompok"
                        />
                      </div>
                      <div>
                        <Label htmlFor="perusahaan">Perusahaan</Label>
                        <Input
                          id="perusahaan"
                          value={formData.perusahaan}
                          onChange={(e) => handleInputChange('perusahaan', e.target.value)}
                          placeholder="Masukkan data perusahaan"
                        />
                      </div>
                      <div>
                        <Label htmlFor="jenisBibit">Jenis Bibit</Label>
                        <Input
                          id="jenisBibit"
                          value={formData.jenisBibit}
                          onChange={(e) => handleInputChange('jenisBibit', e.target.value)}
                          placeholder="Masukkan jenis bibit"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Sertifikasi Kebun</Label>
                        <div className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="ispo"
                              checked={formData.sertifikasiKebun.ispo}
                              onCheckedChange={(checked) =>
                                handleInputChange('sertifikasiKebun', {
                                  ...formData.sertifikasiKebun,
                                  ispo: checked === true
                                })
                              }
                            />
                            <Label htmlFor="ispo">ISPO</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="rspo"
                              checked={formData.sertifikasiKebun.rspo}
                              onCheckedChange={(checked) =>
                                handleInputChange('sertifikasiKebun', {
                                  ...formData.sertifikasiKebun,
                                  rspo: checked === true
                                })
                              }
                            />
                            <Label htmlFor="rspo">RSPO</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profil Izin Usaha */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">PROFIL IZIN USAHA</h3>
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="aktePendirian">Akte Pendirian</Label>
                        <Input
                          id="aktePendirian"
                          value={formData.aktePendirian}
                          onChange={(e) => handleInputChange('aktePendirian', e.target.value)}
                          placeholder="Masukkan akte pendirian"
                        />
                      </div>
                      <div>
                        <Label htmlFor="aktePerubahan">Akte Perubahan</Label>
                        <Input
                          id="aktePerubahan"
                          value={formData.aktePerubahan}
                          onChange={(e) => handleInputChange('aktePerubahan', e.target.value)}
                          placeholder="Masukkan akte perubahan"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nib">NIB</Label>
                        <Input
                          id="nib"
                          value={formData.nib}
                          onChange={(e) => handleInputChange('nib', e.target.value)}
                          placeholder="Masukkan NIB"
                        />
                      </div>
                      <div>
                        <Label htmlFor="siup">SIUP</Label>
                        <Input
                          id="siup"
                          value={formData.siup}
                          onChange={(e) => handleInputChange('siup', e.target.value)}
                          placeholder="Masukkan SIUP"
                        />
                      </div>
                      <div>
                        <Label htmlFor="npwp">NPWP</Label>
                        <Input
                          id="npwp"
                          value={formData.npwp}
                          onChange={(e) => handleInputChange('npwp', e.target.value)}
                          placeholder="Masukkan NPWP"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Profil Kebun */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">PROFIL KEBUN</h3>
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="tahunTanam">Tahun Tanam</Label>
                        <Input
                          id="tahunTanam"
                          value={formData.tahunTanam}
                          onChange={(e) => handleInputChange('tahunTanam', e.target.value)}
                          placeholder="Masukkan tahun tanam"
                        />
                      </div>
                      <div>
                        <Label htmlFor="luasKebun">Luas Kebun</Label>
                        <Input
                          id="luasKebun"
                          value={formData.luasKebun}
                          onChange={(e) => handleInputChange('luasKebun', e.target.value)}
                          placeholder="Masukkan luas kebun"
                        />
                      </div>
                      <div>
                        <Label htmlFor="estimasiSupplyTBS">Estimasi Supply TBS</Label>
                        <Input
                          id="estimasiSupplyTBS"
                          value={formData.estimasiSupplyTBS}
                          onChange={(e) => handleInputChange('estimasiSupplyTBS', e.target.value)}
                          placeholder="Masukkan estimasi supply TBS"
                        />
                      </div>
                      <div>
                        <Label htmlFor="total">Total</Label>
                        <Input
                          id="total"
                          value={formData.total}
                          onChange={(e) => handleInputChange('total', e.target.value)}
                          placeholder="Masukkan total"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Penjualan TBS */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">PENJUALAN TBS</h3>
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="langsungPKS">Langsung PKS</Label>
                        <Input
                          id="langsungPKS"
                          value={formData.langsungPKS}
                          onChange={(e) => handleInputChange('langsungPKS', e.target.value)}
                          placeholder="Masukkan data langsung PKS"
                        />
                      </div>
                      <div>
                        <Label htmlFor="agen">Agen</Label>
                        <Input
                          id="agen"
                          value={formData.agen}
                          onChange={(e) => handleInputChange('agen', e.target.value)}
                          placeholder="Masukkan data agen"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Transportasi */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">TRANSPORTASI</h3>
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="milikSendiri">Milik Sendiri</Label>
                        <Input
                          id="milikSendiri"
                          value={formData.milikSendiri}
                          onChange={(e) => handleInputChange('milikSendiri', e.target.value)}
                          placeholder="....... unit"
                        />
                      </div>
                      <div>
                        <Label htmlFor="jasaPihakKe3">Jasa Pihak ke3</Label>
                        <Input
                          id="jasaPihakKe3"
                          value={formData.jasaPihakKe3}
                          onChange={(e) => handleInputChange('jasaPihakKe3', e.target.value)}
                          placeholder="....... unit"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Catatan */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">CATATAN</h3>
                    <Textarea
                      value={formData.catatan}
                      onChange={(e) => handleInputChange('catatan', e.target.value)}
                      placeholder="Masukkan catatan tambahan"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t">
                <div className="flex gap-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Preview PDF
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl h-[90vh]">
                      <DialogHeader>
                        <DialogTitle>Preview Form Supplier</DialogTitle>
                      </DialogHeader>
                      <div className="h-full">
                        <PDFViewer width="100%" height="100%">
                          <SupplierFormPDF data={formData} />
                        </PDFViewer>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <PDFDownloadLink
                    document={<SupplierFormPDF data={formData} />}
                    fileName={`supplier-form-${formData.nomorForm}.pdf`}
                  >
                    {({ loading }) => (
                      <Button variant="outline" disabled={loading} className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        {loading ? 'Generating...' : 'Download PDF'}
                      </Button>
                    )}
                  </PDFDownloadLink>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setActiveTab("list")}>
                    Batal
                  </Button>
                  <Button onClick={handleSubmit}>
                    Simpan & Kirim
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
