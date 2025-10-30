import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import { FileText, Printer, X, Download } from "lucide-react";
import { type Supplier } from "~/server/types/pt-pks/supplier";
import { SupplierApiClient } from "~/lib/supplier-utils";

const suratPernyataanSchema = z.object({
  bank: z.string().min(1, "Nama bank wajib diisi"),
  nomorRekening: z.string().min(1, "Nomor rekening wajib diisi"),
  atasNama: z.string().min(1, "Atas nama wajib diisi"),
});

type SuratPernyataanFormData = z.infer<typeof suratPernyataanSchema>;

interface SupplierSuratPernyataanModalProps {
  supplier: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SupplierSuratPernyataanModal({ supplier, isOpen, onClose, onSuccess }: SupplierSuratPernyataanModalProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const form = useForm<SuratPernyataanFormData>({
    resolver: zodResolver(suratPernyataanSchema),
    defaultValues: {
      bank: supplier?.bankName ?? "",
      nomorRekening: supplier?.bankAccountNo ?? "",
      atasNama: supplier?.bankAccountName ?? "",
    }
  });

  // Reset form when supplier changes
  useEffect(() => {
    if (supplier) {
      form.reset({
        bank: supplier.bankName ?? "",
        nomorRekening: supplier.bankAccountNo ?? "",
        atasNama: supplier.bankAccountName ?? "",
      });
    }
  }, [supplier, form]);

  const onSubmit = (data: SuratPernyataanFormData) => {
    setShowPreview(true);
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Dynamic import to avoid SSR issues
      const { pdf } = await import('@react-pdf/renderer');
      const { SuratPernyataanPDF } = await import('./surat-pernyataan-pdf');

      const formData = form.getValues();

      // Save bank info to database first using API client
      const result = await SupplierApiClient.updateBankInfo(supplier!.id, {
        bankName: formData.bank,
        bankAccountNo: formData.nomorRekening,
        bankAccountName: formData.atasNama,
      });

      if (!result.success) {
        throw new Error(result.error || 'Gagal menyimpan informasi bank');
      }

      // Generate PDF blob
      const blob = await pdf(
        <SuratPernyataanPDF supplier={supplier!} bankData={formData} />
      ).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Surat_Pernyataan_${supplier!.namaPemilik.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show success message
      alert("PDF berhasil diunduh dan informasi bank berhasil disimpan!");
      
      // Call onSuccess to refresh data
      onSuccess();

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(error instanceof Error ? error.message : "Terjadi kesalahan saat membuat PDF atau menyimpan data bank");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const printPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // For print, we'll use the browser's print function with the preview
      window.print();
    } catch (error) {
      console.error("Error printing PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleClose = () => {
    setShowPreview(false);
    form.reset();
    onClose();
  };

  if (!supplier) return null;

  if (showPreview) {
    const formData = form.getValues();

    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto z-[9999] bg-white shadow-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Surat Pernyataan - {supplier.namaPemilik}</DialogTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={generatePDF}
                  disabled={isGeneratingPDF}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isGeneratingPDF ? "Generating..." : "Download PDF"}
                </Button>
                <Button
                  variant="outline"
                  onClick={printPDF}
                  disabled={isGeneratingPDF}
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <Card>
            <CardContent className="p-8">
              <div className="surat-pernyataan-preview" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', lineHeight: '1.6' }}>
                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-xl font-bold mb-4">SURAT PERNYATAAN</h1>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <p>Saya yang bertanda tangan dibawah ini</p>

                  <div className="ml-4 space-y-1">
                    <div className="flex">
                      <span className="w-20">Nama</span>
                      <span className="w-4">:</span>
                      <span className="font-medium">{supplier.namaPemilik}</span>
                    </div>
                    <div className="flex">
                      <span className="w-20">Alamat</span>
                      <span className="w-4">:</span>
                      <span className="font-medium">{supplier.alamatPemilik || "-"}</span>
                    </div>
                    <div className="flex">
                      <span className="w-20">NPWP</span>
                      <span className="w-4">:</span>
                      <span className="font-medium">{supplier.npwp || "-"}</span>
                    </div>
                  </div>

                  <p className="mt-6">
                    Dengan ini saya sebagai Supplier TBS Sawit di PT. Taro Rakaya Tasyra menyatakan dengan sebenarnya :
                  </p>

                  <div className="space-y-4 mt-4">
                    <div>
                      <p>
                        <strong>1.</strong> Bahwa Rekening Bank yang saya pakai selaku Supplier TBS Sawit untuk pembayaran TBS Sawit oleh PT. Taro Rakaya Tasyra, yaitu hanya menggunakan
                      </p>
                      <div className="ml-6 mt-2 space-y-1">
                        <div className="flex">
                          <span className="w-32">Bank</span>
                          <span className="w-4">:</span>
                          <span className="font-medium">{formData.bank}</span>
                        </div>
                        <div className="flex">
                          <span className="w-32">Nomor Rekening</span>
                          <span className="w-4">:</span>
                          <span className="font-medium">{formData.nomorRekening}</span>
                        </div>
                        <div className="flex">
                          <span className="w-32">Atas Nama</span>
                          <span className="w-4">:</span>
                          <span className="font-medium">{formData.atasNama}</span>
                        </div>
                      </div>
                    </div>

                    <p>
                      <strong>2.</strong> Bahwa TBS Sawit yang dikirimkan ke PT. Taro Rakaya Tasyra adalah TBS Sawit Resmi dari perkebunan saya sendiri dan/atau TBS yang saya beli secara sah, bukan TBS Sawit yang dibeli secara tidak resmi atau bertentangan dengan hukum yang berlaku, serta disengaja maupun tidak disengaja.
                    </p>

                    <p>
                      <strong>3.</strong> Bertindak selaku supplier TBS, dengan ini saya menyatakan kepada PT. Taro Rakaya Tasyra, bahwa saya Pengusaha Kena Pajak (PKP) sehingga akan menerbitkan faktur pajak dan mengenakan PPN 1,1% atas penjualan.
                    </p>

                    <p>
                      <strong>4.</strong> Bahwa apabila terjadi penyalahgunaan terhadap Surat Pengantar Buah (SPB)/SP TBS yang diserahkan oleh PT. Taro Rakaya Tasyra, maka PT. Taro Rakaya Tasyra tidak bertanggung jawab terhadap masalah tersebut dan permasalahan tersebut menjadi tanggung jawab saya sebagai Supplier TBS Sawit.
                    </p>

                    <p>
                      <strong>5.</strong> Bahwa apabila terjadi permasalahan yang ditimbulkan oleh sebab yang tercantum pada Point 1 s/d 4 di atas, maka PT. Taro Rakaya Tasyra dibebaskan dari segala tuntutan hukum.
                    </p>
                  </div>

                  <p className="mt-6">
                    Demikian Surat Pernyataan ini saya buat dengan sebenarnya dan untuk digunakan sebagaimana mestinya.
                  </p>

                  {/* Signature Section */}
                  <div className="mt-12 flex justify-end">
                    <div className="text-center">
                      <p className="mb-1">Lubuk Ogung, {new Date().toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}</p>
                      <p className="mb-12">Yang Menyatakan,</p>

                      <div className="mb-4">
                        <div className="border border-black p-2 text-xs bg-gray-50">
                          (materai Rp10.000)
                        </div>
                      </div>

                      <div className="border-b border-black w-48 mb-2"></div>
                      <p className="text-sm">({supplier.namaPemilik})</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Print Styles */}
          <style jsx>{`
            @media print {
              body * {
                visibility: hidden;
              }
              .surat-pernyataan-preview, .surat-pernyataan-preview * {
                visibility: visible;
              }
              .surat-pernyataan-preview {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 20px;
              }
            }
          `}</style>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md z-[9999] bg-white shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Surat Pernyataan
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm font-medium">Supplier:</p>
            <p className="text-sm">{supplier.namaPemilik}</p>
            <p className="text-xs text-gray-600">{supplier.namaPerusahaan || "-"}</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="bank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Bank *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Contoh: Bank BCA, Bank Mandiri, dll"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nomorRekening"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Rekening *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Contoh: 1234567890"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="atasNama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Atas Nama *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nama pemilik rekening"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Batal
                </Button>
                <Button type="submit">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Surat
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
