import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tagihan Fabrikasi | PT TAM",
  description: "Kelola tagihan dan invoice untuk manpower fabrikasi PT TAM",
};

export default function TagihanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
