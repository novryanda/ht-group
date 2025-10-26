"use client"

import { useState } from "react"
import { Save, Download, Upload, Plus, Trash2, Printer } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"

export default function DailyReportForm() {
  // Data structure: 2D array representing the entire report
  const [data, setData] = useState<string[][]>([
    // Header Section
    ["LAPORAN HARIAN ANALISA LOSSES DAN KUALITAS", "", "", "", "", "", "", ""],
    ["BULAN SEPTEMBER 2025", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "Hari/Tanggal", ": Senin / 15 September 2025", "", "", ""],
    
    // Section A: Kehilangan Minyak - Header
    ["A. KEHILANGAN MINYAK", "", "", "", "", "", "", ""],
    ["Kehilangan Minyak Terhadap TBS", "", "", "", "", "", "", ""],
    ["Minyak Terhadap TBS", "Hari Ini", "s/d Hari Ini", "Target", "", "", "", ""],
    
    // Section A: Data Rows - Kehilangan Minyak Terhadap TBS
    ["TBS Diolah", "", "", "", "", "", "", ""],
    ["% OER", "", "", "", "", "", "", ""],
    ["Brondolan di Janjangan Kosong", "", "", "", "", "", "", ""],
    ["Janjangan Kosong", "", "", "", "", "", "", ""],
    ["Fiber Press", "", "", "", "", "", "", ""],
    ["Nut", "", "", "", "", "", "", ""],
    ["Final Effluent", "", "", "", "", "", "", ""],
    ["TOTAL", "", "", "", "", "", "", ""],
    ["Sludge ex Centrifuge", "", "", "", "", "", "", ""],
    
    // Section A: Kehilangan Minyak dalam % O/DM
    ["", "", "", "", "", "", "", ""],
    ["Kehilangan Minyak dalam % O/DM", "", "", "", "", "", "", ""],
    ["Minyak Terhadap TBS", "Hari Ini", "s/d Hari Ini", "Target", "", "", "", ""],
    ["Brondolan di Janjangan Kosong", "", "", "", "", "", "", ""],
    ["Janjangan Kosong", "", "", "", "", "", "", ""],
    ["Fiber Press", "", "", "", "", "", "", ""],
    ["Nut", "", "", "", "", "", "", ""],
    ["Final Effluent", "", "", "", "", "", "", ""],
    ["TOTAL", "", "", "", "", "", "", ""],
    ["Sludge ex Centrifuge", "", "", "", "", "", "", ""],
    
    // Section B: Kehilangan Kernel
    ["", "", "", "", "", "", "", ""],
    ["B. KEHILANGAN KERNEL", "", "", "", "", "", "", ""],
    ["Kehilangan Kernel Terhadap TBS", "", "", "Kehilangan Kernel Terhadap Sample", "", "", "", ""],
    ["Kernel Terhadap TBS", "Hari Ini", "s/d Hari Ini", "Target", "Kernel Terhadap Sample", "Hari Ini", "s/d Hari Ini", "Target"],
    ["% KER", "", "", "", "% KER", "", "", ""],
    ["Brondolan di Janjangan Kosong", "", "", "", "Brondolan di Janjangan Kosong", "", "", ""],
    ["Fibre Cyclone", "", "", "", "Fibre Cyclone", "", "", ""],
    ["LTDS", "", "", "", "LTDS", "", "", ""],
    ["Claybath", "", "", "", "Claybath", "", "", ""],
    ["TOTAL", "", "", "", "TOTAL", "", "", ""],
    
    // Average Values
    ["", "", "", "", "", "", "", ""],
    ["Nilai Average", "", "", "", "", "", "", ""],
    ["", "Average Fiber Cyclone %", "", "Average LTDS %", "", "Ave Cangkang Claybath %", "", ""],
    ["", "Value", "", "Value", "", "Value", "", ""],
    
    // Section C: Mutu CPO
    ["", "", "", "", "", "", "", ""],
    ["C. MUTU CPO", "", "", "", "", "", "", ""],
    ["Parameter", "Hari Ini", "s/d Hari Ini", "Target", "Komentar", "", "", ""],
    ["CPO Produksi", "", "", "", "", "", "", ""],
    ["% FFA", "", "", "", "", "", "", ""],
    ["% Moisture", "", "", "", "", "", "", ""],
    ["% Dirt", "", "", "", "", "", "", ""],
    ["M + I", "", "", "", "", "", "", ""],
    ["DOBI", "", "", "", "", "", "", ""],
    ["Karitene", "", "", "", "", "", "", ""],
    
    // Section D: Mutu Kernel
    ["", "", "", "", "", "", "", ""],
    ["D. MUTU KERNEL", "", "", "", "", "", "", ""],
    ["Parameter", "Hari Ini", "s/d Hari Ini", "Target", "Komentar", "", "", ""],
    ["Kernel Produksi", "", "", "", "", "", "", ""],
    ["% FFA", "", "", "", "", "", "", ""],
    ["% Moisture", "", "", "", "", "", "", ""],
    ["% Dirt", "", "", "", "", "", "", ""],
    ["% Broken Kernel", "", "", "", "", "", "", ""],
    
    // Section E: Effisiensi
    ["", "", "", "", "", "", "", ""],
    ["E. EFFISIENSI STERILIZER, THRESING DAN SSBC", "", "", "", "", "", "", ""],
    ["Parameter", "Hari Ini", "s/d Hari Ini", "Target", "Komentar", "", "", ""],
    ["USB", "", "", "", "", "", "", ""],
    
    // Signatures
    ["", "", "", "", "", "", "", ""],
    ["TANDA TANGAN", "", "", "", "", "", "", ""],
    ["Dibuat", "", "Diperiksa", "", "Mengetahui", "", "", ""],
    ["Nama:", "", "Nama:", "", "Nama:", "", "", ""],
    ["Jabatan:", "", "Jabatan:", "", "Jabatan:", "", "", ""],
  ])

  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null)
  const [editValue, setEditValue] = useState("")

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    // Cek apakah cell bisa diedit (tidak di header utama atau section header)
    const nonEditableRows = [0, 1, 2, 4, 5, 6, 17, 18, 19, 28, 29, 30, 39, 40, 41, 44, 45, 46, 56, 57, 58, 64, 65, 66, 69, 70, 71]
    
    if (nonEditableRows.includes(rowIndex)) return
    
    setActiveCell({ row: rowIndex, col: colIndex })
    setEditValue(data[rowIndex]?.[colIndex] ?? "")
  }

  const handleCellChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value)
  }

  const handleCellBlur = () => {
    if (activeCell) {
      const newData = [...data]
      if (newData[activeCell.row]) {
        newData[activeCell.row]![activeCell.col] = editValue
      }
      setData(newData)
      setActiveCell(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && activeCell) {
      handleCellBlur()
      // Move to next row
      if (activeCell.row < data.length - 1) {
        setActiveCell({ row: activeCell.row + 1, col: activeCell.col })
        setEditValue(data[activeCell.row + 1]?.[activeCell.col] ?? "")
      }
    }
    if (e.key === "Escape") {
      setActiveCell(null)
    }
    if (e.key === "Tab") {
      e.preventDefault()
      handleCellBlur()
      // Move to next column
      if (activeCell && activeCell.col < (data[0]?.length ?? 0) - 1) {
        setActiveCell({ row: activeCell.row, col: activeCell.col + 1 })
        setEditValue(data[activeCell.row]?.[activeCell.col + 1] ?? "")
      }
    }
  }

  const getCellStyle = (rowIndex: number, colIndex: number) => {
    // Header utama
    if (rowIndex === 0 || rowIndex === 1) {
      return "bg-blue-900 text-white font-bold text-center"
    }
    // Section headers (A, B, C, D, E)
    if (rowIndex === 4 || rowIndex === 28 || rowIndex === 44 || rowIndex === 56 || rowIndex === 64) {
      return "bg-gray-700 text-white font-semibold"
    }
    // Sub headers
    if (rowIndex === 5 || rowIndex === 17 || rowIndex === 29 || rowIndex === 39 || rowIndex === 45 || rowIndex === 57 || rowIndex === 65 || rowIndex === 70) {
      return "bg-gray-200 font-semibold text-center text-xs"
    }
    // Column headers
    if (rowIndex === 6 || rowIndex === 18 || rowIndex === 19 || rowIndex === 30 || rowIndex === 40 || rowIndex === 46 || rowIndex === 58 || rowIndex === 66 || rowIndex === 71) {
      return "bg-gray-300 font-semibold text-center text-xs"
    }
    // Row labels (first column)
    if (colIndex === 0 && rowIndex > 6) {
      return "bg-gray-100 font-medium text-xs"
    }
    // TOTAL rows
    if (data[rowIndex]?.[0] === "TOTAL") {
      return "bg-yellow-100 font-semibold text-xs"
    }
    // Signature section
    if (rowIndex >= 69) {
      return "bg-blue-50 font-medium text-xs"
    }
    // Editable cells
    return "bg-white hover:bg-blue-50 text-xs"
  }

  const getColSpan = (rowIndex: number, colIndex: number) => {
    if (rowIndex === 0 && colIndex === 0) return 8
    if (rowIndex === 1 && colIndex === 0) return 8
    if ((rowIndex === 4 || rowIndex === 28 || rowIndex === 44 || rowIndex === 56 || rowIndex === 64 || rowIndex === 69) && colIndex === 0) return 8
    if (rowIndex === 3 && colIndex === 4) return 2
    if (rowIndex === 5 && colIndex === 0) return 8
    if (rowIndex === 17 && colIndex === 0) return 8
    if (rowIndex === 29 && colIndex === 0) return 3
    if (rowIndex === 29 && colIndex === 3) return 5
    if (rowIndex === 39 && colIndex === 0) return 8
    if (rowIndex === 45 && colIndex === 0) return 8
    if (rowIndex === 46 && colIndex === 4) return 4
    if (rowIndex === 57 && colIndex === 0) return 8
    if (rowIndex === 58 && colIndex === 4) return 4
    if (rowIndex === 65 && colIndex === 0) return 8
    if (rowIndex === 66 && colIndex === 4) return 4
    return 1
  }

  const shouldRenderCell = (rowIndex: number, colIndex: number) => {
    if (rowIndex === 0 && colIndex > 0) return false
    if (rowIndex === 1 && colIndex > 0) return false
    if ((rowIndex === 4 || rowIndex === 28 || rowIndex === 44 || rowIndex === 56 || rowIndex === 64 || rowIndex === 69) && colIndex > 0) return false
    if (rowIndex === 3 && colIndex === 5) return false
    if (rowIndex === 5 && colIndex > 0) return false
    if (rowIndex === 17 && colIndex > 0) return false
    if (rowIndex === 29 && colIndex > 0 && colIndex < 3) return false
    if (rowIndex === 29 && colIndex > 3) return false
    if (rowIndex === 39 && colIndex > 0) return false
    if (rowIndex === 45 && colIndex > 0) return false
    if (rowIndex === 46 && colIndex > 4) return false
    if (rowIndex === 57 && colIndex > 0) return false
    if (rowIndex === 58 && colIndex > 4) return false
    if (rowIndex === 65 && colIndex > 0) return false
    if (rowIndex === 66 && colIndex > 4) return false
    return true
  }

  const handleSave = () => {
    console.log("Data saved:", data)
    alert("Data berhasil disimpan!")
  }

  const handleExport = () => {
    // TODO: Implement Excel export
    console.log("Exporting to Excel...")
    alert("Fitur export Excel akan segera hadir!")
  }

  const handleImport = () => {
    // TODO: Implement Excel import
    console.log("Importing from Excel...")
    alert("Fitur import Excel akan segera hadir!")
  }

  const handleAddRow = () => {
    const newRow = Array(8).fill("")
    setData([...data, newRow])
  }

  const handleDeleteRow = () => {
    if (activeCell && data.length > 1) {
      const newData = data.filter((_, index) => index !== activeCell.row)
      setData(newData)
      setActiveCell(null)
    } else {
      alert("Pilih cell pada baris yang ingin dihapus!")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="w-full h-screen bg-gray-100 p-4">
      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow-sm mb-4 p-3 flex gap-2 items-center print:hidden">
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save size={18} />
          Simpan
        </Button>
        <Button onClick={handleExport} variant="secondary" className="flex items-center gap-2">
          <Download size={18} />
          Export Excel
        </Button>
        <Button onClick={handleImport} variant="secondary" className="flex items-center gap-2">
          <Upload size={18} />
          Import Excel
        </Button>
        <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
          <Printer size={18} />
          Print
        </Button>
        <div className="ml-auto flex gap-2">
          <Button onClick={handleAddRow} variant="outline" className="flex items-center gap-2">
            <Plus size={18} />
            Tambah Baris
          </Button>
          <Button onClick={handleDeleteRow} variant="destructive" className="flex items-center gap-2">
            <Trash2 size={18} />
            Hapus Baris
          </Button>
        </div>
      </div>

      {/* Spreadsheet */}
      <Card className="print:shadow-none overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="print:hidden">
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-1 text-sm font-semibold w-12 sticky left-0 z-10 bg-gray-100">
                    #
                  </th>
                  {["A", "B", "C", "D", "E", "F", "G", "H"].map((col) => (
                    <th
                      key={col}
                      className="border border-gray-300 px-2 py-1 text-sm font-semibold min-w-[140px]"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="border border-gray-300 px-2 py-1 text-center text-sm font-semibold bg-gray-100 sticky left-0 z-10 print:hidden">
                      {rowIndex + 1}
                    </td>
                    {row.map((cell, colIndex) => {
                      if (!shouldRenderCell(rowIndex, colIndex)) return null

                      const isActive =
                        activeCell?.row === rowIndex && activeCell?.col === colIndex
                      const colSpan = getColSpan(rowIndex, colIndex)

                      return (
                        <td
                          key={colIndex}
                          colSpan={colSpan}
                          className={`border border-gray-300 px-2 py-2 ${getCellStyle(
                            rowIndex,
                            colIndex
                          )} ${isActive ? "ring-2 ring-blue-500" : ""} cursor-pointer transition-colors`}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                        >
                          {isActive ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={handleCellChange}
                              onBlur={handleCellBlur}
                              onKeyDown={handleKeyDown}
                              autoFocus
                              className="w-full outline-none bg-transparent"
                            />
                          ) : (
                            <span>{cell || "\u00A0"}</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Status Bar */}
      <div className="bg-white rounded-lg shadow-sm mt-4 p-2 text-sm text-gray-600 flex justify-between print:hidden">
        <div>
          {activeCell ? (
            <span>
              Cell aktif:{" "}
              <strong>
                {String.fromCharCode(65 + activeCell.col)}
                {activeCell.row + 1}
              </strong>
            </span>
          ) : (
            <span>Klik cell untuk edit</span>
          )}
        </div>
        <div>
          Total baris: <strong>{data.length}</strong> | Total kolom: <strong>8</strong>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4 print:hidden">
        <h3 className="font-semibold text-blue-900 mb-2">📝 Cara Penggunaan:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • Klik cell untuk mengedit (area putih yang bisa diedit)
          </li>
          <li>
            • Tekan <kbd className="px-2 py-1 bg-white rounded border">Enter</kbd> untuk pindah ke
            baris berikutnya
          </li>
          <li>
            • Tekan <kbd className="px-2 py-1 bg-white rounded border">Tab</kbd> untuk pindah ke
            kolom berikutnya
          </li>
          <li>
            • Tekan <kbd className="px-2 py-1 bg-white rounded border">Esc</kbd> untuk batal edit
          </li>
          <li>• Gunakan tombol toolbar untuk simpan, export, atau import data</li>
          <li>• Header section (biru/abu-abu gelap) tidak dapat diedit</li>
        </ul>
      </div>
    </div>
  )
}
