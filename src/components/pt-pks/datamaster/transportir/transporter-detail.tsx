"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Loader2, ArrowLeft, Truck, Users, DollarSign, FileText, MapPin, Phone, Mail, Building2, Edit } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface Vehicle {
  id: string;
  plateNo: string;
  type: string;
  capacityTons?: number | null;
  stnkValidThru?: string | null;
  kirValidThru?: string | null;
  gpsId?: string | null;
}

interface Driver {
  id: string;
  name: string;
  phone?: string | null;
  nik?: string | null;
  simType?: string | null;
  simValidThru?: string | null;
}

interface Tariff {
  id: string;
  origin: string;
  destination: string;
  commodity: string;
  unit: "TON" | "KM" | "TRIP";
  price: number;
  includeToll: boolean;
  includeUnload: boolean;
  includeTax: boolean;
  notes?: string | null;
}

interface Contract {
  id: string;
  contractNo: string;
  commodity: string;
  startDate?: string | null;
  endDate?: string | null;
  dokUrl?: string | null;
}

interface Transporter {
  id: string;
  type: "PERUSAHAAN" | "PERORANGAN";
  legalName: string;
  tradeName?: string | null;
  npwp?: string | null;
  pkpStatus: "NON_PKP" | "PKP_11" | "PKP_1_1";
  addressLine?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  picName?: string | null;
  picPhone?: string | null;
  picEmail?: string | null;
  bankName?: string | null;
  bankAccountNo?: string | null;
  bankAccountNm?: string | null;
  statementUrl?: string | null;
  notes?: string | null;
  status: "AKTIF" | "NONAKTIF";
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  vehicles: Vehicle[];
  drivers: Driver[];
  tariffs: Tariff[];
  contracts: Contract[];
}

const typeLabels = {
  PERUSAHAAN: "Perusahaan",
  PERORANGAN: "Perorangan",
};

const pkpLabels = {
  NON_PKP: "Non PKP",
  PKP_11: "PKP 11%",
  PKP_1_1: "PKP 1.1%",
};

const statusLabels = {
  AKTIF: "Aktif",
  NONAKTIF: "Nonaktif",
};

const statusVariants = {
  AKTIF: "default" as const,
  NONAKTIF: "destructive" as const,
};

const unitLabels = {
  TON: "Per Ton",
  KM: "Per KM",
  TRIP: "Per Trip",
};

interface TransporterDetailProps {
  transporterId: string;
}

export function TransporterDetail({ transporterId }: TransporterDetailProps) {
  const router = useRouter();
  const [transporter, setTransporter] = useState<Transporter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransporter = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/transporters/${transporterId}`);
        const result = await response.json();

        if (result.success && result.data) {
          setTransporter(result.data);
        } else {
          toast.error("Transportir tidak ditemukan");
          router.push("/dashboard/pt-pks/datamaster/transportir");
        }
      } catch (error) {
        console.error("Error loading transporter:", error);
        toast.error("Terjadi kesalahan saat memuat data");
        router.push("/dashboard/pt-pks/datamaster/transportir");
      } finally {
        setLoading(false);
      }
    };

    void loadTransporter();
  }, [transporterId, router]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: localeId });
    } catch {
      return "-";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!transporter) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{transporter.legalName}</h1>
            <p className="text-muted-foreground">{transporter.tradeName || "Detail Transportir"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={statusVariants[transporter.status]}>{statusLabels[transporter.status]}</Badge>
          <Button onClick={() => router.push(`/dashboard/pt-pks/datamaster/transportir/${transporterId}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Main Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Umum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Tipe</p>
              <p className="font-medium">{typeLabels[transporter.type]}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status PKP</p>
              <Badge variant="secondary">{pkpLabels[transporter.pkpStatus]}</Badge>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Nama Legal</p>
              <p className="font-medium">{transporter.legalName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nama Dagang</p>
              <p className="font-medium">{transporter.tradeName || "-"}</p>
            </div>
          </div>

          {transporter.npwp && (
            <div>
              <p className="text-sm text-muted-foreground">NPWP</p>
              <p className="font-mono font-medium">{transporter.npwp}</p>
            </div>
          )}

          <Separator />

          <div>
            <p className="mb-2 text-sm font-semibold">Alamat</p>
            <div className="flex items-start gap-2">
              <MapPin className="mt-1 h-4 w-4 text-muted-foreground" />
              <div>
                <p>{transporter.addressLine || "-"}</p>
                <p className="text-sm text-muted-foreground">
                  {transporter.city}, {transporter.province} {transporter.postalCode}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <p className="mb-2 text-sm font-semibold">Person In Charge (PIC)</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <p>{transporter.picName || "-"}</p>
              </div>
              {transporter.picPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p>{transporter.picPhone}</p>
                </div>
              )}
              {transporter.picEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p>{transporter.picEmail}</p>
                </div>
              )}
            </div>
          </div>

          {transporter.bankName && (
            <>
              <Separator />
              <div>
                <p className="mb-2 text-sm font-semibold">Rekening Bank</p>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Bank:</span> {transporter.bankName}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">No. Rekening:</span> {transporter.bankAccountNo}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Atas Nama:</span> {transporter.bankAccountNm}
                  </p>
                </div>
              </div>
            </>
          )}

          {transporter.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Catatan</p>
                <p>{transporter.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tabs for nested data */}
      <Tabs defaultValue="armada">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="armada">
            <Truck className="mr-2 h-4 w-4" />
            Armada ({transporter.vehicles.length})
          </TabsTrigger>
          <TabsTrigger value="pengemudi">
            <Users className="mr-2 h-4 w-4" />
            Pengemudi ({transporter.drivers.length})
          </TabsTrigger>
          <TabsTrigger value="tarif">
            <DollarSign className="mr-2 h-4 w-4" />
            Tarif ({transporter.tariffs.length})
          </TabsTrigger>
          <TabsTrigger value="kontrak">
            <FileText className="mr-2 h-4 w-4" />
            Kontrak ({transporter.contracts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="armada">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Armada</CardTitle>
            </CardHeader>
            <CardContent>
              {transporter.vehicles.length === 0 ? (
                <p className="text-center text-muted-foreground">Belum ada armada terdaftar</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nomor Plat</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Kapasitas</TableHead>
                      <TableHead>STNK Valid</TableHead>
                      <TableHead>KIR Valid</TableHead>
                      <TableHead>GPS ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transporter.vehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">{vehicle.plateNo}</TableCell>
                        <TableCell>{vehicle.type}</TableCell>
                        <TableCell>{vehicle.capacityTons ? `${vehicle.capacityTons} ton` : "-"}</TableCell>
                        <TableCell>{formatDate(vehicle.stnkValidThru)}</TableCell>
                        <TableCell>{formatDate(vehicle.kirValidThru)}</TableCell>
                        <TableCell>{vehicle.gpsId || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pengemudi">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Pengemudi</CardTitle>
            </CardHeader>
            <CardContent>
              {transporter.drivers.length === 0 ? (
                <p className="text-center text-muted-foreground">Belum ada pengemudi terdaftar</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Telepon</TableHead>
                      <TableHead>NIK</TableHead>
                      <TableHead>Tipe SIM</TableHead>
                      <TableHead>SIM Valid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transporter.drivers.map((driver) => (
                      <TableRow key={driver.id}>
                        <TableCell className="font-medium">{driver.name}</TableCell>
                        <TableCell>{driver.phone || "-"}</TableCell>
                        <TableCell className="font-mono text-sm">{driver.nik || "-"}</TableCell>
                        <TableCell>{driver.simType || "-"}</TableCell>
                        <TableCell>{formatDate(driver.simValidThru)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tarif">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Tarif Dasar</CardTitle>
            </CardHeader>
            <CardContent>
              {transporter.tariffs.length === 0 ? (
                <p className="text-center text-muted-foreground">Belum ada tarif terdaftar</p>
              ) : (
                <div className="space-y-4">
                  {transporter.tariffs.map((tariff) => (
                    <Card key={tariff.id}>
                      <CardContent className="pt-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-sm text-muted-foreground">Rute</p>
                            <p className="font-medium">
                              {tariff.origin} → {tariff.destination}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Komoditas</p>
                            <p className="font-medium">{tariff.commodity}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Harga</p>
                            <p className="font-medium">
                              {formatCurrency(tariff.price)} / {unitLabels[tariff.unit]}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Termasuk</p>
                            <div className="flex flex-wrap gap-1">
                              {tariff.includeToll && <Badge variant="outline">Tol</Badge>}
                              {tariff.includeUnload && <Badge variant="outline">Bongkar</Badge>}
                              {tariff.includeTax && <Badge variant="outline">Pajak</Badge>}
                              {!tariff.includeToll && !tariff.includeUnload && !tariff.includeTax && "-"}
                            </div>
                          </div>
                        </div>
                        {tariff.notes && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground">Catatan: {tariff.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kontrak">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Kontrak</CardTitle>
            </CardHeader>
            <CardContent>
              {transporter.contracts.length === 0 ? (
                <p className="text-center text-muted-foreground">Belum ada kontrak terdaftar</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nomor Kontrak</TableHead>
                      <TableHead>Komoditas</TableHead>
                      <TableHead>Periode</TableHead>
                      <TableHead>Dokumen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transporter.contracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.contractNo}</TableCell>
                        <TableCell>{contract.commodity}</TableCell>
                        <TableCell>
                          {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                        </TableCell>
                        <TableCell>
                          {contract.dokUrl ? (
                            <a
                              href={contract.dokUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Lihat Dokumen
                            </a>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

