import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { type Supplier } from "~/server/types/pt-pks/supplier";

interface SuratPernyataanPDFProps {
  supplier: Supplier;
  bankData: {
    bank: string;
    nomorRekening: string;
    atasNama: string;
  };
}

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  label: {
    width: 120,
    fontSize: 11,
  },
  colon: {
    width: 10,
    fontSize: 11,
  },
  value: {
    flex: 1,
    fontSize: 11,
    fontWeight: 'bold',
  },
  paragraph: {
    marginBottom: 10,
    textAlign: 'justify',
    fontSize: 11,
    lineHeight: 1.5,
  },
  numberedParagraph: {
    marginBottom: 10,
    textAlign: 'justify',
    fontSize: 11,
    lineHeight: 1.5,
    paddingLeft: 20,
  },
  bankSection: {
    marginLeft: 20,
    marginTop: 5,
    marginBottom: 10,
  },
  signature: {
    marginTop: 40,
    alignItems: 'flex-end',
    paddingRight: 30,
  },
  signatureBox: {
    textAlign: 'center',
    width: 200,
  },
  signatureText: {
    fontSize: 11,
    marginBottom: 60,
  },
  materaiBox: {
    border: '1px solid black',
    padding: 5,
    marginBottom: 10,
    fontSize: 9,
    textAlign: 'center',
    backgroundColor: '#f5f5f5',
  },
  underline: {
    borderBottom: '1px solid black',
    marginBottom: 5,
    height: 1,
  },
  nameSignature: {
    fontSize: 11,
    textAlign: 'center',
  },
});

export const SuratPernyataanPDF = ({ supplier, bankData }: SuratPernyataanPDFProps) => {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <Text style={styles.title}>SURAT PERNYATAAN</Text>

        {/* Opening */}
        <Text style={styles.paragraph}>
          Saya yang bertanda tangan dibawah ini
        </Text>

        {/* Personal Info */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Nama</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{supplier.namaPemilik}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Alamat</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{supplier.alamatPemilik || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>NPWP</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{supplier.npwp || "-"}</Text>
          </View>
        </View>

        {/* Main Statement */}
        <Text style={styles.paragraph}>
          Dengan ini saya sebagai Supplier TBS Sawit di PT. Taro Rakaya Tasyra menyatakan dengan sebenarnya :
        </Text>

        {/* Point 1 - Bank Details */}
        <Text style={styles.numberedParagraph}>
          1. Bahwa Rekening Bank yang saya pakai selaku Supplier TBS Sawit untuk pembayaran TBS Sawit oleh PT. Taro Rakaya Tasyra, yaitu hanya menggunakan
        </Text>

        <View style={styles.bankSection}>
          <View style={styles.row}>
            <Text style={styles.label}>Bank</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{bankData.bank}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Nomor Rekening</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{bankData.nomorRekening}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Atas Nama</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{bankData.atasNama}</Text>
          </View>
        </View>

        {/* Point 2 */}
        <Text style={styles.numberedParagraph}>
          2. Bahwa TBS Sawit yang dikirimkan ke PT. Taro Rakaya Tasyra adalah TBS Sawit Resmi dari perkebunan saya sendiri dan/atau TBS yang saya beli secara sah, bukan TBS Sawit yang dibeli secara tidak resmi atau bertentangan dengan hukum yang berlaku, serta disengaja maupun tidak disengaja.
        </Text>

        {/* Point 3 */}
        <Text style={styles.numberedParagraph}>
          3. Bertindak selaku supplier TBS, dengan ini saya menyatakan kepada PT. Taro Rakaya Tasyra, bahwa saya Pengusaha Kena Pajak (PKP) sehingga akan menerbitkan faktur pajak dan mengenakan PPN 1,1% atas penjualan.
        </Text>

        {/* Point 4 */}
        <Text style={styles.numberedParagraph}>
          4. Bahwa apabila terjadi penyalahgunaan terhadap Surat Pengantar Buah (SPB)/SP TBS yang diserahkan oleh PT. Taro Rakaya Tasyra, maka PT. Taro Rakaya Tasyra tidak bertanggung jawab terhadap masalah tersebut dan permasalahan tersebut menjadi tanggung jawab saya sebagai Supplier TBS Sawit.
        </Text>

        {/* Point 5 */}
        <Text style={styles.numberedParagraph}>
          5. Bahwa apabila terjadi permasalahan yang ditimbulkan oleh sebab yang tercantum pada Point 1 s/d 4 di atas, maka PT. Taro Rakaya Tasyra dibebaskan dari segala tuntutan hukum.
        </Text>

        {/* Closing */}
        <Text style={styles.paragraph}>
          Demikian Surat Pernyataan ini saya buat dengan sebenarnya dan untuk digunakan sebagaimana mestinya.
        </Text>

        {/* Signature Section */}
        <View style={styles.signature}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureText}>
              Lubuk Ogung, {currentDate}{'\n'}
              Yang Menyatakan,
            </Text>

            <View style={styles.materaiBox}>
              <Text>(materai Rp10.000)</Text>
            </View>

            <View style={styles.underline}></View>
            <Text style={styles.nameSignature}>({supplier.namaPemilik})</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
