import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Card, CardContent } from "~/components/ui/card";
import { Printer, Download, X } from "lucide-react";
import { type Supplier } from "~/server/types/pt-pks/supplier";

interface SupplierViewModalProps {
  supplier: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SupplierViewModal({ supplier, isOpen, onClose }: SupplierViewModalProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!supplier) return null;

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Dynamic import to avoid SSR issues
      const { pdf } = await import('@react-pdf/renderer');
      const { SupplierFormPDF } = await import('./supplier-form-pdf');

      // Convert profilKebun JSON to array if it exists
      let profilKebunArray: any[] = [];
      if (Array.isArray(supplier.profilKebun)) {
        // Already an array from database
        profilKebunArray = supplier.profilKebun;
      } else if (supplier.profilKebun) {
        // Single object from database
        profilKebunArray = [supplier.profilKebun];
      }

      // Generate PDF blob with empty profilKebun prop since data is in supplier object
      const blob = await pdf(
        <SupplierFormPDF supplier={supplier} profilKebun={[]} />
      ).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Form_Supplier_${supplier.namaPemilik.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Terjadi kesalahan saat membuat PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const printPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      window.print();
    } catch (error) {
      console.error("Error printing PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Convert profilKebun JSON to array for display
  let displayProfilKebun: any[] = [];

  if (Array.isArray(supplier.profilKebun)) {
    // If it's already an array (from form input with multiple rows)
    displayProfilKebun = supplier.profilKebun;
  } else if (supplier.profilKebun) {
    // If it's a single JSON object (from database - current schema)
    displayProfilKebun = [supplier.profilKebun];
  }

  // Calculate totals from all rows
  const totalLuas = displayProfilKebun.reduce((sum: number, row: any) => {
    return sum + (row.luasKebun || 0);
  }, 0);

  const totalEstimasi = displayProfilKebun.reduce((sum: number, row: any) => {
    return sum + (row.estimasiSupplyTBS || 0);
  }, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto z-[9999] bg-white shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Detail Supplier - {supplier.namaPemilik}</DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isGeneratingPDF ? "Generating..." : "Download PDF"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={printPDF}
                disabled={isGeneratingPDF}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                {isGeneratingPDF ? "Generating..." : "Print PDF"}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Card>
          <CardContent className="p-6">
            <div className="pdf-preview" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', lineHeight: '1.4' }}>
              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-lg font-bold mb-1">PT. TARO RAKAYA TASYA</h1>
                <h2 className="text-base font-semibold mb-1">FORM CALON SUPPLIER TBS SAWIT</h2>
                <p className="text-sm">Nomor: {supplier.nomorForm || "......./PT.TRT/SUPP-TBS/mm/2024"}</p>
              </div>

              {/* Type Supplier */}
              <div className="mb-4">
                <span className="font-semibold">Type Supplier : </span>
                <span className="inline-flex gap-4">
                  <label className="flex items-center gap-1">
                    Ramp/Peron
                    <span className="border border-black w-4 h-4 inline-block text-center">
                      {supplier.typeSupplier === 'RAMP_PERON' ? '✓' : ''}
                    </span>
                  </label>
                  <label className="flex items-center gap-1">
                    KUD
                    <span className="border border-black w-4 h-4 inline-block text-center">
                      {supplier.typeSupplier === 'KUD' ? '✓' : ''}
                    </span>
                  </label>
                  <label className="flex items-center gap-1">
                    Kelompok Tani
                    <span className="border border-black w-4 h-4 inline-block text-center">
                      {supplier.typeSupplier === 'KELOMPOK_TANI' ? '✓' : ''}
                    </span>
                  </label>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* Left Column */}
                <div>
                  {/* IDENTITAS */}
                  <div className="mb-6">
                    <h3 className="font-bold text-sm mb-3 bg-gray-100 p-1">IDENTITAS</h3>
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="w-24 shrink-0">Nama Pemilik</span>
                        <span className="w-4">:</span>
                        <span className="border-b border-black flex-1 min-h-[1em]">{supplier.namaPemilik || ''}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 shrink-0">Alamat</span>
                        <span className="w-4">:</span>
                        <span className="border-b border-black flex-1 min-h-[1em]">{supplier.alamatPemilik || ''}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 shrink-0">Nomor HP/Telp</span>
                        <span className="w-4">:</span>
                        <span className="border-b border-black flex-1 min-h-[1em]">{supplier.hpPemilik || ''}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 shrink-0">Nama Perusahaan</span>
                        <span className="w-4">:</span>
                        <span className="border-b border-black flex-1 min-h-[1em]">{supplier.namaPerusahaan || ''}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 shrink-0">Alamat Ramp / Peron</span>
                        <span className="w-4">:</span>
                        <span className="border-b border-black flex-1 min-h-[1em]">{supplier.alamatRampPeron || ''}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 shrink-0">Nomor HP/Telp</span>
                        <span className="w-4">:</span>
                        <span className="border-b border-black flex-1 min-h-[1em]">{supplier.hpPerusahaan || ''}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 shrink-0">Titikord Ramp / Peron</span>
                        <span className="w-4">:</span>
                        <span className="border-b border-black flex-1 min-h-[1em]">{supplier.alamatRampPeron || ''}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 shrink-0">Bujur</span>
                        <span className="w-4">:</span>
                        <span className="border-b border-black flex-1 min-h-[1em]">{supplier.bujur || ''}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 shrink-0">Lintang</span>
                        <span className="w-4">:</span>
                        <span className="border-b border-black flex-1 min-h-[1em]">{supplier.lintang || ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* TIPE PENGELOLAAN KEBUN */}
                  <div className="mb-6">
                    <h3 className="font-bold text-sm mb-3 bg-gray-100 p-1">TIPE PENGELOLAAN KEBUN</h3>
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="w-16 shrink-0">Swadaya</span>
                        <span className="w-4">:</span>
                        <span className="border-b border-black flex-1 min-h-[1em]">{supplier.pengelolaanSwadaya || ''}</span>
                      </div>
                      <div className="flex">
                        <span className="w-16 shrink-0">Kelompok</span>
                        <span className="w-4">:</span>
                        <span className="border-b border-black flex-1 min-h-[1em]">{supplier.pengelolaanKelompok || ''}</span>
                      </div>
                      <div className="flex">
                        <span className="w-16 shrink-0">Perusahaan</span>
                        <span className="w-4">:</span>
                        <span className="border-b border-black flex-1 min-h-[1em]">{supplier.pengelolaanPerusahaan || ''}</span>
                      </div>
                      <div className="flex">
                        <span className="w-16 shrink-0">Jenis Bibit</span>
                        <span className="w-4">:</span>
                        <span className="border-b border-black flex-1 min-h-[1em]">{supplier.jenisBibit || ''}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <span>Sertifikasi Kebun :</span>
                        <label className="flex items-center gap-1">
                          ISPO
                          <span className="border border-black w-4 h-4 inline-block text-center">
                            {supplier.sertifikasiISPO ? '✓' : ''}
                          </span>
                        </label>
                        <label className="flex items-center gap-1">
                          RSPO
                          <span className="border border-black w-4 h-4 inline-block text-center">
                            {supplier.sertifikasiRSPO ? '✓' : ''}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* PROFIL IZIN USAHA */}
                  <div className="mb-6">
                    <h3 className="font-bold text-sm mb-3 bg-gray-100 p-1">PROFIL IZIN USAHA</h3>
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="w-20 shrink-0">Akte Pendirian</span>
                        <span className="w-4">:</span>
                        <span className="border-b border-black flex-1 min-h-[1em]">{supplier.aktePendirian || ''}</span>
                      </div>
                      <div className="flex">
                        <span className="w-20 shrink-0">Akte Perubahan</span>
                        <span className="w-4">:</span>
                        <span className="border-b border-black flex-1 min-h-[1em]">{supplier.aktePerubahan || ''}</span>
                      </div>
                      <div className="flex">
                        <span className="w-20 shrink-0">NIB</span>
                        <span className="w-4">:</span>
                        <span className="border-b border-black flex-1 min-h-[1em]">{supplier.nib || ''}</span>
                      </div>
                      <div className="flex">
                        <span className="w-20 shrink-0">SIUP</span>
                        <span className="w-4">:</span>
                        <span className="border-b border-black flex-1 min-h-[1em]">{supplier.siup || ''}</span>
                      </div>
                      <div className="flex">
                        <span className="w-20 shrink-0">NPWP</span>
                        <span className="w-4">:</span>
                        <span className="border-b border-black flex-1 min-h-[1em]">{supplier.npwp || ''}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  {/* PROFIL KEBUN */}
                  <div className="mb-6">
                    <h3 className="font-bold text-sm mb-3 bg-gray-100 p-1">PROFIL KEBUN</h3>
                    <div className="border border-black">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-black">
                            <th className="border-r border-black p-1 text-center">Tahun Tanam</th>
                            <th className="border-r border-black p-1 text-center">Luas Kebun</th>
                            <th className="p-1 text-center">Estimasi Supply TBS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayProfilKebun.map((row: any, index: number) => (
                            <tr key={index} className="border-b border-black">
                              <td className="border-r border-black p-1 text-center">{row.tahunTanam || ''}</td>
                              <td className="border-r border-black p-1 text-center">{row.luasKebun || ''}</td>
                              <td className="p-1 text-center">{row.estimasiSupplyTBS || ''}</td>
                            </tr>
                          ))}
                          {/* Add empty rows if needed */}
                          {Array.from({ length: Math.max(0, 5 - displayProfilKebun.length) }, (_, i) => (
                            <tr key={`empty-${i}`} className="border-b border-black">
                              <td className="border-r border-black p-1 h-6"></td>
                              <td className="border-r border-black p-1"></td>
                              <td className="p-1"></td>
                            </tr>
                          ))}
                          <tr className="border-b border-black font-semibold">
                            <td className="border-r border-black p-1 text-center">Total</td>
                            <td className="border-r border-black p-1 text-center">{totalLuas}</td>
                            <td className="p-1 text-center">{totalEstimasi}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* PENJUALAN TBS */}
                  <div className="mb-6">
                    <h3 className="font-bold text-sm mb-3 bg-gray-100 p-1">PENJUALAN TBS</h3>
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="w-20 shrink-0">Langsung PKS</span>
                        <span className="w-4">:</span>
                        <span className="border-b border-black flex-1 min-h-[1em]">{supplier.penjualanLangsungPKS || ''}</span>
                      </div>
                      <div className="flex">
                        <span className="w-20 shrink-0">Agen</span>
                        <span className="w-4">:</span>
                        <span className="border-b border-black flex-1 min-h-[1em]">{supplier.penjualanAgen || ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* TRANSPORTASI */}
                  <div className="mb-6">
                    <h3 className="font-bold text-sm mb-3 bg-gray-100 p-1">TRANSPORTASI</h3>
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="w-20 shrink-0">Milik Sendiri</span>
                        <span className="w-4">:</span>
                        <span className="border-b border-black w-16 text-center">{supplier.transportMilikSendiri || ''}</span>
                        <span className="ml-2">unit</span>
                      </div>
                      <div className="flex">
                        <span className="w-20 shrink-0">Jasa Pihak ke3</span>
                        <span className="w-4">:</span>
                        <span className="border-b border-black w-16 text-center">{supplier.transportPihak3 || ''}</span>
                        <span className="ml-2">unit</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 mt-8 pt-4 border-t border-black">
                <div className="text-center">
                  <div className="mb-2">Catatan:</div>
                  <div className="border border-black h-24 mb-4"></div>
                  <div className="text-sm">(tim pembelian)</div>
                </div>
                <div className="text-center">
                  <div className="mb-2">Pkl. Kerinci, ...../...../ 2024</div>
                  <div className="border border-black h-24 mb-4"></div>
                  <div className="text-sm">(calon supplier)</div>
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
            .pdf-preview, .pdf-preview * {
              visibility: visible;
            }
            .pdf-preview {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
