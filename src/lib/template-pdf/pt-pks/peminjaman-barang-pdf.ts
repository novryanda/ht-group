
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PeminjamanBarangPDFData {
  docNumber: string;
  date: string;
  loanReceiver: string;
  targetDept: string;
  expectedReturnAt: string;
  items: Array<{
    sku: string;
    name: string;
    unit: string;
    qty: number;
    note?: string;
  }>;
  pemberiNama: string;
  peminjamNama: string;
}


export function generatePeminjamanBarangPDF(data: PeminjamanBarangPDFData): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN PEMINJAMAN BARANG', 105, 20, { align: 'center' });

  // Doc Number
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`No. Dokumen: ${data.docNumber}`, 105, 30, { align: 'center' });

  // Info Section
  doc.setFontSize(11);
  doc.text(`Tanggal: ${data.date}`, 20, 42);
  doc.text(`Dept/Unit: ${data.targetDept}`, 120, 42);
  doc.text(`Nama Peminjam: ${data.loanReceiver}`, 20, 50);
  doc.text(`Jatuh Tempo: ${data.expectedReturnAt}`, 120, 50);

  // Table Section
  const tableStartY = 62;
  const tableBody = (data.items && data.items.length > 0)
    ? data.items.map(item => [
        item.sku,
        item.name,
        item.unit,
        String(item.qty),
        item.note || ''
      ])
    : [['', 'Tidak ada barang yang dipinjam', '', '', '']];

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: 18, right: 18 },
    head: [['SKU', 'Nama Barang', 'Satuan', 'Jumlah', 'Catatan']],
    body: tableBody,
    styles: { fontSize: 11, cellPadding: 2.5 },
    headStyles: { fillColor: [220, 220, 220], textColor: 20, fontStyle: 'bold', halign: 'center' },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 65 },
      2: { cellWidth: 28 },
      3: { cellWidth: 22 },
      4: { cellWidth: 40 },
    },
    didDrawPage: (data) => {
      // Tambahkan jarak antar section jika perlu
    },
  });

  // Signature Area
  const finalY = (doc as any).lastAutoTable.finalY || (tableStartY + 40);
  const signatureY = finalY + 24;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Pemberi:', 40, signatureY);
  doc.text('Peminjam:', 140, signatureY);
  doc.setFont('helvetica', 'bold');
  doc.text(data.pemberiNama, 40, signatureY + 18);
  doc.text(data.peminjamNama, 140, signatureY + 18);

  return doc;
}
