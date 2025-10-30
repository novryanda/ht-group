// src/server/types/pt-pks/mutu-labels.ts

/**
 * Label mapping untuk payload Mutu Produksi PT-PKS
 * Mengikuti struktur layout Google Sheets DATA_MUTU
 */

// 1) Kamus item → label persis seperti di cell layout
const ITEM_LABELS: Record<string, string> = {
  // Blok A (kiri & kanan)
  tbs_diolah: "TBS Diolah",
  oer: "% OER",
  brondolan_jk: "Brondolan di Janjangan Kosong",
  jk: "Janjangan Kosong",
  fiber_press: "Fiber Press",
  nut: "Nut",
  final_effluent: "Final Effluent",
  total: "TOTAL",
  sludge_centrifuge: "Sludge ex Centrifuge",

  // Blok B
  ker: "% KER",
  fibre_cyclone: "Fibre Cyclone",
  ltds: "LTDS",
  claybath: "Claybath",

  // Panel Average (B)
  avg_fibre_cyclone: "Average Fiber Cyclone",
  avg_ltds: "Average LTDS",
  avg_cangkang_claybath: "Ave Cangkang Claybath",

  // Blok C
  cpo_produksi: "CPO Produksi",
  ffa: "% FFA",
  moisture: "% Moisture",
  dirt: "% Dirt",
  m_i: "M + I",
  dobi: "DOBI",
  karitene: "Karitene",

  // Blok D
  kernel_produksi: "Kernel Produksi",
  broken_kernel: "% Broken Kernel",

  // Blok E
  usb: "USB",
};

// 2) Label kolom (sufiks)
const FIELD_LABELS: Record<string, string> = {
  hari: "Hari Ini",
  sd: "s/d Hari Ini",
  target: "Target",
  komentar: "Komentar",
};

// 3) Label bagian (prefix kelompok)
const SECTION_LABELS: Record<string, string> = {
  "A_TBS": "A. Minyak terhadap TBS",
  "A_ODM": "A. Kehilangan Minyak dalam % O/DM",
  "OWM": "Panel O/WM",
  "ODM": "Panel O/DM",
  "B_TBS": "B. Kehilangan Kernel Terhadap TBS",
  "B_SAMPLE": "B. Kehilangan Kernel Terhadap Sample",
  "B_AVG": "B. Average",
  "C": "C. Mutu CPO",
  "D": "D. Mutu Kernel",
  "E": "E. Efisiensi Sterilizer/Thresing/SSBC",
};

// 4) Beberapa header non-pola
const SPECIAL_LABELS: Record<string, string> = {
  row_id: "Row ID",
  tanggal: "Tanggal",
  shift: "Shift",
  created_at: "Created At",
  updated_at: "Updated At",
  sent_at: "Sent At",
  sync_status: "Sync Status",
};

// 5) Konversi key → label tampil (human)
export function keyToPrettyLabel(key: string): string {
  // Special / meta fields
  if (SPECIAL_LABELS[key]) return SPECIAL_LABELS[key];

  // Pola umum: <SECTION>_<item>_<field>
  // Contoh:
  //  - A_TBS_tbs_diolah_hari
  //  - A_ODM_oer_sd
  //  - OWM_jk_hari
  //  - ODM_final_effluent_sd
  //  - B_TBS_ker_target
  //  - B_SAMPLE_claybath_sd
  //  - B_AVG_avg_ltds_hari
  //  - C_ffa_komentar
  //  - D_kernel_produksi_target
  //  - E_usb_hari
  const parts = key.split("_");
  
  if (parts.length === 0) return key;

  // Tangani blok C/D/E yang bentuknya: C_<item>_<field>
  if (parts[0] && ["C", "D", "E"].includes(parts[0])) {
    const section = parts[0];                      // "C" | "D" | "E"
    const field = parts.at(-1) ?? "";              // hari | sd | target | komentar
    const item = parts.slice(1, -1).join("_");     // gabungkan sisa jadi nama item

    const sectionLabel = SECTION_LABELS[section] ?? section;
    const itemLabel = ITEM_LABELS[item] ?? item;
    const fieldLabel = FIELD_LABELS[field] ?? field;

    return `${sectionLabel} • ${itemLabel} — ${fieldLabel}`;
  }

  // Tangani panel OWM/ODM: OWM_<item>_<field> | ODM_<item>_<field>
  if (parts[0] && ["OWM", "ODM"].includes(parts[0])) {
    const section = parts[0];          // OWM | ODM
    const field = parts.at(-1) ?? "";  // hari | sd
    const item = parts.slice(1, -1).join("_");

    const sectionLabel = SECTION_LABELS[section] ?? section;
    const itemLabel = ITEM_LABELS[item] ?? item;
    const fieldLabel = FIELD_LABELS[field] ?? field;

    return `${sectionLabel} • ${itemLabel} — ${fieldLabel}`;
  }

  // Tangani A_TBS_* dan A_ODM_* : A_TBS_<item>_<field>
  if (parts.length >= 4 && parts[0] === "A" && parts[1]) {
    const section = `${parts[0]}_${parts[1]}`;     // "A_TBS" | "A_ODM"
    const item = parts.slice(2, -1).join("_");
    const field = parts.at(-1) ?? "";

    const sectionLabel = SECTION_LABELS[section] ?? section;
    const itemLabel = ITEM_LABELS[item] ?? item;
    const fieldLabel = FIELD_LABELS[field] ?? field;

    return `${sectionLabel} • ${itemLabel} — ${fieldLabel}`;
  }

  // Tangani B_* : B_TBS_..., B_SAMPLE_..., B_AVG_...
  if (parts[0] === "B" && parts[1]) {
    const subgroup = `B_${parts[1]}`;              // "B_TBS" | "B_SAMPLE" | "B_AVG"
    const item = parts.slice(2, -1).join("_");
    const field = parts.at(-1) ?? "";

    const sectionLabel = SECTION_LABELS[subgroup] ?? subgroup;
    const itemLabel = ITEM_LABELS[item] ?? item;
    const fieldLabel = FIELD_LABELS[field] ?? field;

    return `${sectionLabel} • ${itemLabel} — ${fieldLabel}`;
  }

  // Fallback: kembalikan apa adanya
  return key;
}

// 6) Helper untuk unit/format bila mau dipakai di UI
export function guessUnit(key: string): "percent" | "number" | "text" {
  if (key.endsWith("_komentar")) return "text";
  // field yang mengandung persen
  if (/(^|_)(oer|ker|ffa|moisture|dirt|broken_kernel)(_|$)/.test(key)) return "percent";
  return "number";
}

// 7) Group key untuk pengelompokan
export function groupKey(key: string): string {
  if (key.startsWith("A_TBS_")) return "A_TBS";
  if (key.startsWith("A_ODM_")) return "A_ODM";
  if (key.startsWith("OWM_")) return "OWM";
  if (key.startsWith("ODM_")) return "ODM";
  if (key.startsWith("B_TBS_")) return "B_TBS";
  if (key.startsWith("B_SAMPLE_")) return "B_SAMPLE";
  if (key.startsWith("B_AVG_")) return "B_AVG";
  if (key.startsWith("C_")) return "C";
  if (key.startsWith("D_")) return "D";
  if (key.startsWith("E_")) return "E";
  return "META";
}

// 8) Label untuk group
export function groupLabel(group: string): string {
  return SECTION_LABELS[group] ?? group;
}

// 9) Format value berdasarkan unit
export function formatValue(value: unknown, unit: "percent" | "number" | "text"): string {
  if (value === null || value === undefined || value === "") return "-";
  
  if (unit === "text") return String(value);
  
  const numVal = typeof value === "number" ? value : parseFloat(String(value));
  if (isNaN(numVal)) return String(value);
  
  if (unit === "percent") {
    return `${numVal.toLocaleString("id-ID", { maximumFractionDigits: 2 })}%`;
  }
  
  return numVal.toLocaleString("id-ID", { maximumFractionDigits: 2 });
}
