import { Inter } from "next/font/google";
import "./globals.css";
import { cn, contructMetaData } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";
import "react-loading-skeleton/dist/skeleton.css";
import "simplebar-react/dist/simplebar.min.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = contructMetaData();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <Providers>
        <body
          className={cn("min-h-screen antialiased grainy", inter.className)}>
          <Toaster />
          <Navbar />
          {children}
        </body>
      </Providers>
    </html>
  );
}
