import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "~/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { SupplierApiClient } from "~/lib/supplier-utils";
import { type Supplier } from "~/server/types/pt-pks/supplier";

interface SupplierDeleteDialogProps {
  supplier: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SupplierDeleteDialog({
                                       supplier,
                                       isOpen,
                                       onClose,
                                       onSuccess,
                                     }: SupplierDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!supplier) return;
    setIsDeleting(true);
    try {
      const result = await SupplierApiClient.deleteSupplier(supplier.id);
      if (result.success) {
        onSuccess();
        onClose();
        alert("Supplier berhasil dihapus!");
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Terjadi kesalahan saat menghapus supplier");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!supplier) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            Konfirmasi Hapus Supplier
          </AlertDialogTitle>

          {/* GANTI elemen default <p> menjadi <div> agar boleh berisi block elements */}
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>Apakah Anda yakin ingin menghapus supplier berikut?</p>

              <div className="bg-gray-50 p-3 rounded-md">
                <p><strong>Nama Pemilik:</strong> {supplier.namaPemilik}</p>
                <p><strong>Perusahaan:</strong> {supplier.namaPerusahaan || "-"}</p>
                <p><strong>Nomor Form:</strong> {supplier.nomorForm || "-"}</p>
                <p><strong>Tipe:</strong> {supplier.typeSupplier}</p>
              </div>

              <p className="text-red-600 font-medium">
                Tindakan ini tidak dapat dibatalkan. Semua data supplier akan dihapus permanen.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Menghapus..." : "Ya, Hapus Supplier"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
