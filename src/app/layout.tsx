import type { Metadata } from "next";
import "./theme/lux/bootstrap.min.css";
import "./theme/icons/bootstrap-icons.css";
import "./globals.css";
import BootstrapClient from "@/components/BootstrapClient";
import Toaster from "@/components/custom_toast/Toaster";
import { DialogProvider } from "@/components/dialogs/DialogProvider";



export const metadata: Metadata = {
  title: "Image Arch",
  description: "Store and share photos with all your friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <DialogProvider>
          {children}
        </DialogProvider>
        <BootstrapClient />
        <Toaster />
      </body>
    </html>
  );
}
