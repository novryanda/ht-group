import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { type Supplier } from "~/server/types/pt-pks/supplier";
import { PajakPKPLabels } from "~/server/types/pt-pks/supplier";

interface SupplierFormPDFProps {
  supplier: Partial<Supplier>;
  profilKebun: Array<{
    tahunTanam: string;
    luasKebun: number;
    estimasiSupplyTBS: number;
  }>;
}

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.3,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  nomorForm: {
    fontSize: 10,
    marginBottom: 15,
  },
  typeSupplier: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginRight: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  checkboxBox: {
    width: 12,
    height: 12,
    border: '2px solid #000000',
    backgroundColor: '#ffffff',
    marginRight: 3,
  },
  checkboxChecked: {
    width: 12,
    height: 12,
    border: '2px solid #000000',
    backgroundColor: '#000000',
    marginRight: 3,
  },
  checkboxText: {
    fontSize: 10,
    marginLeft: 2,
  },
  twoColumns: {
    flexDirection: 'row',
    gap: 20,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    padding: 3,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'center',
  },
  label: {
    width: 80,
    fontSize: 9,
  },
  colon: {
    width: 8,
    fontSize: 9,
  },
  underline: {
    flex: 1,
    borderBottom: '1px solid black',
    minHeight: 12,
    fontSize: 9,
    paddingLeft: 2,
  },
  table: {
    border: '1px solid black',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1px solid black',
    backgroundColor: '#f0f0f0',
  },
  tableHeaderCell: {
    flex: 1,
    borderRight: '1px solid black',
    padding: 3,
    fontSize: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid black',
  },
  tableCell: {
    flex: 1,
    borderRight: '1px solid black',
    padding: 3,
    fontSize: 8,
    textAlign: 'center',
    minHeight: 15,
  },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  signatureSection: {
    marginTop: 30,
    flexDirection: 'row',
    gap: 20,
  },
  signatureBox: {
    flex: 1,
    alignItems: 'center',
  },
  signatureTitle: {
    fontSize: 9,
    marginBottom: 5,
  },
  signatureSpace: {
    border: '1px solid black',
    width: 120,
    height: 80,
    marginBottom: 10,
  },
  signatureLabel: {
    fontSize: 8,
    textAlign: 'center',
  },
});

export const SupplierFormPDF = ({ supplier, profilKebun }: SupplierFormPDFProps) => {
  // Calculate totals from profilKebun data - handle both array and single object
  let totalLuas = 0;
  let totalEstimasi = 0;
  let displayProfilKebun: any[] = [];

  // Handle different data formats properly
  if (Array.isArray(profilKebun) && profilKebun.length > 0) {
    // From form input - array of multiple rows (keep as separate rows)
    displayProfilKebun = profilKebun;
    totalLuas = profilKebun.reduce((sum, row) => sum + (row.luasKebun || 0), 0);
    totalEstimasi = profilKebun.reduce((sum, row) => sum + (row.estimasiSupplyTBS || 0), 0);
  } else if (supplier.profilKebun) {
    // From database - check if it's array or single object
    if (Array.isArray(supplier.profilKebun)) {
      // Multiple rows from database (keep as separate rows)
      displayProfilKebun = supplier.profilKebun;
      totalLuas = supplier.profilKebun.reduce((sum: number, row: any) => sum + (row.luasKebun || 0), 0);
      totalEstimasi = supplier.profilKebun.reduce((sum: number, row: any) => sum + (row.estimasiSupplyTBS || 0), 0);
    } else {
      // Single JSON object from database
      displayProfilKebun = [supplier.profilKebun];
      const kebun = supplier.profilKebun as any;
      totalLuas = kebun.luasKebun || 0;
      totalEstimasi = kebun.estimasiSupplyTBS || 0;
    }
  }

  // Add fallback empty rows if no data
  if (displayProfilKebun.length === 0) {
    displayProfilKebun = [{ tahunTanam: '', luasKebun: 0, estimasiSupplyTBS: 0 }];
  }

  // Generate document number automatically
  const generateDocumentNumber = () => {
    if (supplier.nomorForm) {
      return supplier.nomorForm;
    }

    const currentDate = supplier.createdAt ? new Date(supplier.createdAt) : new Date();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();

    // Generate sequential number based on supplier ID or use current timestamp
    const sequentialNumber = supplier.id ?
      String(parseInt(supplier.id.slice(-4), 16) % 1000).padStart(3, '0') :
      String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');

    return `${sequentialNumber}/PT.TRT/SUPP-TBS/${month}/${year}`;
  };

  const documentNumber = generateDocumentNumber();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>PT. TARO RAKAYA TASYA</Text>
          <Text style={styles.subtitle}>FORM CALON SUPPLIER TBS SAWIT</Text>
          <Text style={styles.nomorForm}>Nomor: {documentNumber}</Text>
        </View>

        {/* Type Supplier */}
        <View style={styles.typeSupplier}>
          <Text style={styles.typeLabel}>Type Supplier :</Text>
          <View style={styles.checkboxContainer}>
            <View style={styles.checkbox}>
              <Text style={supplier.typeSupplier === 'RAMP_PERON' ? styles.checkboxChecked : styles.checkboxBox}>
                {supplier.typeSupplier === 'RAMP_PERON' ? '✓' : ''}
              </Text>
              <Text style={styles.checkboxText}>Ramp/Peron</Text>
            </View>
            <View style={styles.checkbox}>
              <Text style={supplier.typeSupplier === 'KUD' ? styles.checkboxChecked : styles.checkboxBox}>
                {supplier.typeSupplier === 'KUD' ? '✓' : ''}
              </Text>
              <Text style={styles.checkboxText}>KUD</Text>
            </View>
            <View style={styles.checkbox}>
              <Text style={supplier.typeSupplier === 'KELOMPOK_TANI' ? styles.checkboxChecked : styles.checkboxBox}>
                {supplier.typeSupplier === 'KELOMPOK_TANI' ? '✓' : ''}
              </Text>
              <Text style={styles.checkboxText}>Kelompok Tani</Text>
            </View>
          </View>
        </View>

        {/* PKP Tax Information */}
        <View style={styles.typeSupplier}>
          <Text style={styles.typeLabel}>Pajak PKP :</Text>
          <View style={styles.checkboxContainer}>
            <View style={styles.checkbox}>
              <Text style={supplier.pajakPKP === 'NON_PKP' ? styles.checkboxChecked : styles.checkboxBox}>
                {supplier.pajakPKP === 'NON_PKP' ? '✓' : ''}
              </Text>
              <Text style={styles.checkboxText}>Non PKP</Text>
            </View>
            <View style={styles.checkbox}>
              <Text style={supplier.pajakPKP === 'PKP_1_1_PERSEN' ? styles.checkboxChecked : styles.checkboxBox}>
                {supplier.pajakPKP === 'PKP_1_1_PERSEN' ? '✓' : ''}
              </Text>
              <Text style={styles.checkboxText}>PKP 1,1%</Text>
            </View>
            <View style={styles.checkbox}>
              <Text style={supplier.pajakPKP === 'PKP_11_PERSEN' ? styles.checkboxChecked : styles.checkboxBox}>
                {supplier.pajakPKP === 'PKP_11_PERSEN' ? '✓' : ''}
              </Text>
              <Text style={styles.checkboxText}>PKP 11%</Text>
            </View>
          </View>
        </View>

        {/* Two Columns Layout */}
        <View style={styles.twoColumns}>
          {/* Left Column */}
          <View style={styles.leftColumn}>
            {/* IDENTITAS */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>IDENTITAS</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Nama Pemilik</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.underline}>{supplier.namaPemilik || ''}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Alamat</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.underline}>{supplier.alamatPemilik || ''}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Nomor HP/Telp</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.underline}>{supplier.hpPemilik || ''}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Nama Perusahaan</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.underline}>{supplier.namaPerusahaan || ''}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Alamat Ramp / Peron</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.underline}>{supplier.alamatRampPeron || ''}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Nomor HP/Telp</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.underline}>{supplier.hpPerusahaan || ''}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Bujur</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.underline}>{supplier.bujur || ''}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Lintang</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.underline}>{supplier.lintang || ''}</Text>
              </View>
            </View>

            {/* TIPE PENGELOLAAN KEBUN */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>TIPE PENGELOLAAN KEBUN</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Swadaya</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.underline}>{supplier.pengelolaanSwadaya || ''}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Kelompok</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.underline}>{supplier.pengelolaanKelompok || ''}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Perusahaan</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.underline}>{supplier.pengelolaanPerusahaan || ''}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Jenis Bibit</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.underline}>{supplier.jenisBibit || ''}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Sertifikasi Kebun :</Text>
                <View style={styles.checkbox}>
                  <Text style={supplier.sertifikasiISPO ? styles.checkboxChecked : styles.checkboxBox}>
                    {supplier.sertifikasiISPO ? '✓' : ''}
                  </Text>
                  <Text style={styles.checkboxText}>ISPO</Text>
                </View>
                <View style={styles.checkbox}>
                  <Text style={supplier.sertifikasiRSPO ? styles.checkboxChecked : styles.checkboxBox}>
                    {supplier.sertifikasiRSPO ? '✓' : ''}
                  </Text>
                  <Text style={styles.checkboxText}>RSPO</Text>
                </View>
              </View>
            </View>

            {/* PROFIL IZIN USAHA */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PROFIL IZIN USAHA</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Akte Pendirian</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.underline}>{supplier.aktePendirian || ''}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Akte Perubahan</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.underline}>{supplier.aktePerubahan || ''}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>NIB</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.underline}>{supplier.nib || ''}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>SIUP</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.underline}>{supplier.siup || ''}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>NPWP</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.underline}>{supplier.npwp || ''}</Text>
              </View>
            </View>
          </View>

          {/* Right Column */}
          <View style={styles.rightColumn}>
            {/* PROFIL KEBUN */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PROFIL KEBUN</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderCell}>Tahun Tanam</Text>
                  <Text style={styles.tableHeaderCell}>Luas Kebun (Ha)</Text>
                  <Text style={styles.tableHeaderCell}>Estimasi Supply TBS (Ton)</Text>
                </View>
                {displayProfilKebun.map((row, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{row.tahunTanam || ''}</Text>
                    <Text style={styles.tableCell}>{row.luasKebun || ''}</Text>
                    <Text style={styles.tableCell}>{row.estimasiSupplyTBS || ''}</Text>
                  </View>
                ))}
                {/* Add empty rows if needed to maintain consistent table height */}
                {Array.from({ length: Math.max(0, 5 - displayProfilKebun.length) }, (_, i) => (
                  <View key={`empty-${i}`} style={styles.tableRow}>
                    <Text style={styles.tableCell}></Text>
                    <Text style={styles.tableCell}></Text>
                    <Text style={styles.tableCell}></Text>
                  </View>
                ))}
                <View style={styles.totalRow}>
                  <Text style={styles.tableCell}>Total</Text>
                  <Text style={styles.tableCell}>{totalLuas}</Text>
                  <Text style={styles.tableCell}>{totalEstimasi}</Text>
                </View>
              </View>
            </View>

            {/* PENJUALAN TBS */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PENJUALAN TBS</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Langsung PKS</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.underline}>{supplier.penjualanLangsungPKS || ''}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Agen</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.underline}>{supplier.penjualanAgen || ''}</Text>
              </View>
            </View>

            {/* TRANSPORTASI */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>TRANSPORTASI</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Milik Sendiri</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.underline}>{supplier.transportMilikSendiri || ''} unit</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Jasa Pihak ke3</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.underline}>{supplier.transportPihak3 || ''} unit</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>Catatan:</Text>
            <View style={styles.signatureSpace}></View>
            <Text style={styles.signatureLabel}>(tim pembelian)</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>Pkl. Kerinci, ...../...../ 2024</Text>
            <View style={styles.signatureSpace}></View>
            <Text style={styles.signatureLabel}>(calon supplier)</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
