import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface OutboundPDFData {
  docNumber: string;
  date: string;
  targetDept: string;
  purpose?: string;
  pickerName?: string;
  lines: Array<{
    itemName: string;
    kategoriName?: string;
    jenisName?: string;
    unitName: string;
    qty: number;
  }>;
}

export function generateBarangKeluarPDF(data: OutboundPDFData) {
  // Create PDF with A4 size
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Get date info
  const dateObj = new Date(data.date);
  const dayName = format(dateObj, "EEEE", { locale: localeId });
  const formattedDate = format(dateObj, "dd MMMM yyyy", { locale: localeId });

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("BARANG KELUAR", 105, 20, { align: "center" });

  // No. Dokumen lebih kecil, lebih dekat ke judul
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(data.docNumber, 105, 25, { align: "center" });

  // Document info
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  let yPos = 32;
  if (data.purpose) {
    doc.text(`Tujuan: ${data.purpose}`, 15, yPos);
    yPos += 7;
  }
  doc.text(`Hari: ${dayName}`, 15, yPos);
  yPos += 7;
  doc.text(`Tanggal: ${formattedDate}`, 15, yPos);
  yPos += 7;
  doc.text(`Divisi: ${data.targetDept}`, 15, yPos);
  yPos += 10;

  // Prepare table data
  const tableData = data.lines.map((line, index) => [
    (index + 1).toString(),
    line.itemName,
    line.kategoriName || "-",
    line.jenisName || "-",
    line.unitName,
    line.qty.toString(),
    data.pickerName || "-",
  ]);

  // Table
  autoTable(doc, {
    startY: yPos,
    head: [
      [
        "No",
        "Nama Barang",
        "Kategori",
        "Jenis",
        "Satuan",
        "Jumlah",
        "Diambil Oleh",
      ],
    ],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 }, // No
      1: { cellWidth: 50 }, // Nama Barang
      2: { cellWidth: 30 }, // Kategori
      3: { cellWidth: 30 }, // Jenis
      4: { halign: "center", cellWidth: 20 }, // Satuan
      5: { halign: "right", cellWidth: 20 }, // Jumlah
      6: { cellWidth: 30 }, // Diambil Oleh
    },
  });

  // Footer signature section
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;

  doc.setFontSize(9);
  const signatureY = finalY + 15;


  // Left signature (Diserahkan Oleh)
  const leftAreaX = 20;
  const leftAreaWidth = 60;
  const leftLabel = "Diserahkan Oleh,";
  const leftLine = "_____________________";
  const leftName = "";
  // Label rata tengah
  doc.text(leftLabel, leftAreaX + leftAreaWidth / 2, signatureY, { align: "center" });
  // Garis rata tengah
  const leftLineWidthPx = doc.getTextWidth(leftLine);
  const leftLineX = leftAreaX + (leftAreaWidth - leftLineWidthPx) / 2;
  doc.text(leftLine, leftLineX, signatureY + 20);
  // Nama rata tengah
  const leftNameText = `(${leftName || "                           "})`;
  const leftNameWidth = doc.getTextWidth(leftNameText);
  const leftNameX = leftAreaX + (leftAreaWidth - leftNameWidth) / 2;
  doc.text(leftNameText, leftNameX, signatureY + 25);

  // Right signature (Diterima Oleh)
  const rightAreaX = 130;
  const rightAreaWidth = 60;
  const rightLabel = "Diterima Oleh,";
  const rightLine = "_____________________";
  const rightName = data.pickerName || "";
  // Label rata tengah
  doc.text(rightLabel, rightAreaX + rightAreaWidth / 2, signatureY, { align: "center" });
  // Garis rata tengah
  const rightLineWidthPx = doc.getTextWidth(rightLine);
  const rightLineX = rightAreaX + (rightAreaWidth - rightLineWidthPx) / 2;
  doc.text(rightLine, rightLineX, signatureY + 20);
  // Nama rata tengah
  const rightNameText = `(${rightName || "                           "})`;
  const rightNameWidth = doc.getTextWidth(rightNameText);
  const rightNameX = rightAreaX + (rightAreaWidth - rightNameWidth) / 2;
  doc.text(rightNameText, rightNameX, signatureY + 25);

  return doc;
}
