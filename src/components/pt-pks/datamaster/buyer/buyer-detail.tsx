"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Loader2, ArrowLeft, FileText, Mail, Phone, MapPin, Building2, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface BuyerContact {
  id: string;
  name: string;
  role?: string | null;
  email: string;
  phone: string;
  isBilling: boolean;
}

interface BuyerDoc {
  id: string;
  kind: string;
  fileUrl: string;
  fileName: string;
}

interface Buyer {
  id: string;
  buyerCode: string;
  type: "COMPANY" | "PERSON";
  legalName: string;
  tradeName?: string | null;
  npwp?: string | null;
  pkpStatus: "NON_PKP" | "PKP_11" | "PKP_1_1";
  addressLine: string;
  city: string;
  province: string;
  postalCode?: string | null;
  billingEmail: string;
  phone: string;
  destinationName: string;
  destinationAddr: string;
  status: "DRAFT" | "VERIFIED" | "INACTIVE";
  verifiedAt?: string | null;
  verifiedById?: string | null;
  createdAt: string;
  updatedAt: string;
  contacts: BuyerContact[];
  docs: BuyerDoc[];
}

const typeLabels = {
  COMPANY: "Perusahaan",
  PERSON: "Perorangan",
};

const pkpLabels = {
  NON_PKP: "Non PKP",
  PKP_11: "PKP 11%",
  PKP_1_1: "PKP 1.1%",
};

const statusLabels = {
  DRAFT: "Draft",
  VERIFIED: "Terverifikasi",
  INACTIVE: "Tidak Aktif",
};

const statusVariants = {
  DRAFT: "secondary" as const,
  VERIFIED: "default" as const,
  INACTIVE: "destructive" as const,
};

interface BuyerDetailProps {
  buyerId: string;
}

export function BuyerDetail({ buyerId }: BuyerDetailProps) {
  const router = useRouter();
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBuyer = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/buyers/${buyerId}`);
        const result = await response.json();

        if (result.success && result.data) {
          setBuyer(result.data);
        } else {
          toast.error("Buyer tidak ditemukan");
          router.push("/dashboard/pt-pks/datamaster/buyer");
        }
      } catch (error) {
        console.error("Error loading buyer:", error);
        toast.error("Terjadi kesalahan saat memuat data");
      } finally {
        setLoading(false);
      }
    };

    void loadBuyer();
  }, [buyerId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!buyer) {
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
            <h1 className="text-2xl font-bold">{buyer.legalName}</h1>
            <p className="text-sm text-muted-foreground">
              {buyer.buyerCode} • {typeLabels[buyer.type]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariants[buyer.status]}>
            {statusLabels[buyer.status]}
          </Badge>
          <Button onClick={() => router.push(`/dashboard/pt-pks/kontrak/new?buyerId=${buyer.id}`)}>
            <FileText className="mr-2 h-4 w-4" />
            Buat Kontrak
          </Button>
        </div>
      </div>

      {/* Profil */}
      <Card>
        <CardHeader>
          <CardTitle>Profil Buyer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nama Legal</p>
              <p className="mt-1">{buyer.legalName}</p>
            </div>
            {buyer.tradeName && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nama Dagang</p>
                <p className="mt-1">{buyer.tradeName}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tipe</p>
              <p className="mt-1">{typeLabels[buyer.type]}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status PKP</p>
              <p className="mt-1">{pkpLabels[buyer.pkpStatus]}</p>
            </div>
            {buyer.npwp && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">NPWP</p>
                <p className="mt-1 font-mono">{buyer.npwp}</p>
              </div>
            )}
            {buyer.verifiedAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Terverifikasi</p>
                <p className="mt-1">
                  {format(new Date(buyer.verifiedAt), "dd MMMM yyyy HH:mm", {
                    locale: localeId,
                  })}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alamat & Kontak */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Alamat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Alamat Lengkap</p>
              <p className="mt-1">{buyer.addressLine}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Kota/Kabupaten</p>
              <p className="mt-1">{buyer.city}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Provinsi</p>
              <p className="mt-1">{buyer.province}</p>
            </div>
            {buyer.postalCode && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kode Pos</p>
                <p className="mt-1">{buyer.postalCode}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Kontak Penagihan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="mt-1">{buyer.billingEmail}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Telepon</p>
              <p className="mt-1">{buyer.phone}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logistik */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informasi Logistik
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nama Gudang/Bulking</p>
            <p className="mt-1">{buyer.destinationName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Alamat Tujuan</p>
            <p className="mt-1">{buyer.destinationAddr}</p>
          </div>
        </CardContent>
      </Card>

      {/* Kontak Person */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Kontak Person
          </CardTitle>
          <CardDescription>{buyer.contacts.length} kontak terdaftar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {buyer.contacts.map((contact, index) => (
              <div key={contact.id}>
                {index > 0 && <Separator className="my-4" />}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nama</p>
                    <p className="mt-1 flex items-center gap-2">
                      {contact.name}
                      {contact.isBilling && (
                        <Badge variant="outline" className="text-xs">
                          Billing
                        </Badge>
                      )}
                    </p>
                  </div>
                  {contact.role && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Jabatan</p>
                      <p className="mt-1">{contact.role}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="mt-1">{contact.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Telepon</p>
                    <p className="mt-1">{contact.phone}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dokumen */}
      {buyer.docs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Dokumen
            </CardTitle>
            <CardDescription>{buyer.docs.length} dokumen terlampir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {buyer.docs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{doc.kind}</p>
                    <p className="text-sm text-muted-foreground">{doc.fileName}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                      Lihat
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

