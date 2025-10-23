import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ArrowLeft, Save, Download, Printer } from "lucide-react";

interface ProfilKebunRow {
  tahunTanam: string;
  luasKebun: number;
  estimasiSupplyTBS: number;
}

interface SupplierFormPDFPreviewProps {
  data: any;
  profilKebun: ProfilKebunRow[];
  onBack: () => void;
  onSave: () => void;
  isSubmitting: boolean;
}

export function SupplierFormPDFPreview({
  data,
  profilKebun,
  onBack,
  onSave,
  isSubmitting
}: SupplierFormPDFPreviewProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Dynamic import to avoid SSR issues
      const { pdf } = await import('@react-pdf/renderer');
      const { SupplierFormPDF } = await import('./supplier-form-pdf');

      // Generate PDF blob
      const blob = await pdf(
        <SupplierFormPDF supplier={data} profilKebun={profilKebun} />
      ).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Form_Supplier_${data.namaPemilik?.replace(/\s+/g, '_') || 'Draft'}.pdf`;
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

  const handleSave = async () => {
    console.log("=== PDF PREVIEW SAVE CLICKED ===");

    try {
      console.log("PDF Preview: handleSave called");
      console.log("Current data:", data);
      console.log("Current profilKebun:", profilKebun);

      // Check if we have minimum required data
      if (!data.namaPemilik || data.namaPemilik.trim() === "") {
        alert("Nama pemilik wajib diisi");
        return;
      }

      console.log("Calling onSave function...");
      // Call onSave which should trigger the actual form submission
      await onSave();
      console.log("onSave function completed");

    } catch (error) {
      console.error("Error in handleSave:", error);
      alert("Terjadi kesalahan saat menyimpan data. Periksa console untuk detail.");
    }
  };

  const totalLuas = profilKebun.reduce((sum, row) => sum + (row.luasKebun || 0), 0);
  const totalEstimasi = profilKebun.reduce((sum, row) => sum + (row.estimasiSupplyTBS || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Form
        </Button>
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
            {isGeneratingPDF ? "Generating..." : "Print PDF"}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Menyimpan..." : "Simpan & Daftar"}
          </Button>
        </div>
      </div>

      {/* PDF Preview */}
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="pdf-preview" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', lineHeight: '1.4' }}>
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-lg font-bold mb-1">PT. TARO RAKAYA TASYA</h1>
              <h2 className="text-base font-semibold mb-1">FORM CALON SUPPLIER TBS SAWIT</h2>
              <p className="text-sm">Nomor: ......./PT.TRT/SUPP-TBS/mm/2024</p>
            </div>

            {/* Type Supplier */}
            <div className="mb-4">
              <span className="font-semibold">Type Supplier : </span>
              <span className="inline-flex gap-4">
                <label className="flex items-center gap-1">
                  Ramp/Peron
                  <span className="border border-black w-4 h-4 inline-block text-center">
                    {data.typeSupplier === 'RAMP_PERON' ? '✓' : ''}
                  </span>
                </label>
                <label className="flex items-center gap-1">
                  KUD
                  <span className="border border-black w-4 h-4 inline-block text-center">
                    {data.typeSupplier === 'KUD' ? '✓' : ''}
                  </span>
                </label>
                <label className="flex items-center gap-1">
                  Kelompok Tani
                  <span className="border border-black w-4 h-4 inline-block text-center">
                    {data.typeSupplier === 'KELOMPOK_TANI' ? '✓' : ''}
                  </span>
                </label>
              </span>
            </div>

            {/* PKP Tax Information */}
            <div className="mb-4">
              <span className="font-semibold">Pajak PKP : </span>
              <span className="inline-flex gap-4">
                <label className="flex items-center gap-1">
                  Non PKP
                  <span className="border border-black w-4 h-4 inline-block text-center">
                    {data.pajakPKP === 'NON_PKP' ? '✓' : ''}
                  </span>
                </label>
                <label className="flex items-center gap-1">
                  PKP 1,1%
                  <span className="border border-black w-4 h-4 inline-block text-center">
                    {data.pajakPKP === 'PKP_1_1_PERSEN' ? '✓' : ''}
                  </span>
                </label>
                <label className="flex items-center gap-1">
                  PKP 11%
                  <span className="border border-black w-4 h-4 inline-block text-center">
                    {data.pajakPKP === 'PKP_11_PERSEN' ? '✓' : ''}
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
                      <span className="border-b border-black flex-1 min-h-[1em]">{data.namaPemilik || ''}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 shrink-0">Alamat</span>
                      <span className="w-4">:</span>
                      <span className="border-b border-black flex-1 min-h-[1em]">{data.alamatPemilik || ''}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 shrink-0">Nomor HP/Telp</span>
                      <span className="w-4">:</span>
                      <span className="border-b border-black flex-1 min-h-[1em]">{data.hpPemilik || ''}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 shrink-0">Nama Perusahaan</span>
                      <span className="w-4">:</span>
                      <span className="border-b border-black flex-1 min-h-[1em]">{data.namaPerusahaan || ''}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 shrink-0">Alamat Ramp / Peron</span>
                      <span className="w-4">:</span>
                      <span className="border-b border-black flex-1 min-h-[1em]">{data.alamatRampPeron || ''}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 shrink-0">Nomor HP/Telp</span>
                      <span className="w-4">:</span>
                      <span className="border-b border-black flex-1 min-h-[1em]">{data.hpPerusahaan || ''}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 shrink-0">Bujur</span>
                      <span className="w-4">:</span>
                      <span className="border-b border-black flex-1 min-h-[1em]">{data.bujur || ''}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 shrink-0">Lintang</span>
                      <span className="w-4">:</span>
                      <span className="border-b border-black flex-1 min-h-[1em]">{data.lintang || ''}</span>
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
                      <span className="border-b border-black flex-1 min-h-[1em]">{data.pengelolaanSwadaya || ''}</span>
                    </div>
                    <div className="flex">
                      <span className="w-16 shrink-0">Kelompok</span>
                      <span className="w-4">:</span>
                      <span className="border-b border-black flex-1 min-h-[1em]">{data.pengelolaanKelompok || ''}</span>
                    </div>
                    <div className="flex">
                      <span className="w-16 shrink-0">Perusahaan</span>
                      <span className="w-4">:</span>
                      <span className="border-b border-black flex-1 min-h-[1em]">{data.pengelolaanPerusahaan || ''}</span>
                    </div>
                    <div className="flex">
                      <span className="w-16 shrink-0">Jenis Bibit</span>
                      <span className="w-4">:</span>
                      <span className="border-b border-black flex-1 min-h-[1em]">{data.jenisBibit || ''}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <span>Sertifikasi Kebun :</span>
                      <label className="flex items-center gap-1">
                        ISPO
                        <span className="border border-black w-4 h-4 inline-block text-center">
                          {data.sertifikasiISPO ? '✓' : ''}
                        </span>
                      </label>
                      <label className="flex items-center gap-1">
                        RSPO
                        <span className="border border-black w-4 h-4 inline-block text-center">
                          {data.sertifikasiRSPO ? '✓' : ''}
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
                      <span className="border-b border-black flex-1 min-h-[1em]">{data.aktePendirian || ''}</span>
                    </div>
                    <div className="flex">
                      <span className="w-20 shrink-0">Akte Perubahan</span>
                      <span className="w-4">:</span>
                      <span className="border-b border-black flex-1 min-h-[1em]">{data.aktePerubahan || ''}</span>
                    </div>
                    <div className="flex">
                      <span className="w-20 shrink-0">NIB</span>
                      <span className="w-4">:</span>
                      <span className="border-b border-black flex-1 min-h-[1em]">{data.nib || ''}</span>
                    </div>
                    <div className="flex">
                      <span className="w-20 shrink-0">SIUP</span>
                      <span className="w-4">:</span>
                      <span className="border-b border-black flex-1 min-h-[1em]">{data.siup || ''}</span>
                    </div>
                    <div className="flex">
                      <span className="w-20 shrink-0">NPWP</span>
                      <span className="w-4">:</span>
                      <span className="border-b border-black flex-1 min-h-[1em]">{data.npwp || ''}</span>
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
                          <th className="border-r border-black p-1 text-center">Luas Kebun (Ha)</th>
                          <th className="p-1 text-center">Estimasi Supply TBS (Ton)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profilKebun.map((row, index) => (
                          <tr key={index} className="border-b border-black">
                            <td className="border-r border-black p-1 text-center">{row.tahunTanam}</td>
                            <td className="border-r border-black p-1 text-center">{row.luasKebun}</td>
                            <td className="p-1 text-center">{row.estimasiSupplyTBS}</td>
                          </tr>
                        ))}
                        {/* Add empty rows if needed */}
                        {Array.from({ length: Math.max(0, 5 - profilKebun.length) }, (_, i) => (
                          <tr key={`empty-${i}`} className="border-b border-black">
                            <td className="border-r border-black p-1"></td>
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
                      <span className="border-b border-black flex-1 min-h-[1em]">{data.penjualanLangsungPKS || ''}</span>
                    </div>
                    <div className="flex">
                      <span className="w-20 shrink-0">Agen</span>
                      <span className="w-4">:</span>
                      <span className="border-b border-black flex-1 min-h-[1em]">{data.penjualanAgen || ''}</span>
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
                      <span className="border-b border-black w-16 text-center">{data.transportMilikSendiri || ''}</span>
                      <span className="ml-2">unit</span>
                    </div>
                    <div className="flex">
                      <span className="w-20 shrink-0">Jasa Pihak ke3</span>
                      <span className="w-4">:</span>
                      <span className="border-b border-black w-16 text-center">{data.transportPihak3 || ''}</span>
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
    </div>
  );
}
