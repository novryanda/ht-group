import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tagihan Fabrikasi | PT NILO",
  description: "Kelola tagihan dan invoice untuk manpower fabrikasi PT NILO",
};

export default function TagihanNiloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
