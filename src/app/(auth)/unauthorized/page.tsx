import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Unauthorized - HT Group ERP",
  description: "Akses tidak diizinkan",
};

export default function UnauthorizedPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Akses Tidak Diizinkan</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Anda tidak memiliki izin untuk mengakses halaman ini. 
            Silakan hubungi administrator sistem untuk mendapatkan akses.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">
                Login dengan Akun Lain
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
