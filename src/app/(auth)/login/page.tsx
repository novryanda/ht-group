import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "~/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login - HT Group ERP",
  description: "Login to HT Group ERP System",
};

export default function LoginPage() {
  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          HT Group ERP
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Sistem ERP terintegrasi untuk mengelola operasional, HR, dan keuangan 
              seluruh unit bisnis HT Group.&rdquo;
            </p>
            <footer className="text-sm">HT Group Management</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Masuk ke Akun Anda
            </h1>
            <p className="text-sm text-muted-foreground">
              Masukkan email dan password untuk mengakses sistem ERP
            </p>
          </div>
          <Suspense fallback={<div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>}>
            <LoginForm />
          </Suspense>
          <p className="px-8 text-center text-sm text-muted-foreground">
            Dengan masuk, Anda menyetujui{" "}
            <a
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Syarat & Ketentuan
            </a>{" "}
            dan{" "}
            <a
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Kebijakan Privasi
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
