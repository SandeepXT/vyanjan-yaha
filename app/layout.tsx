import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/ui/Navbar";

const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], weight: ["400","600","700","900"], style: ["normal","italic"] });
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], weight: ["300","400","500","600","700"] });
const dmMono = DM_Mono({ variable: "--font-dm-mono", subsets: ["latin"], weight: ["400","500"] });

export const metadata: Metadata = {
  title: "Vyanjan Yaha — Premium Food Delivery",
  description: "From our kitchen to your door. Multi-cuisine premium food delivery — Indian classics, Western favourites, and inspired fusion.",
  keywords: ["food delivery", "Indian food", "restaurant", "order online", "vyanjan"],
  openGraph: { title: "Vyanjan Yaha", description: "Premium food delivery — Indian & Western cuisine", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body className="noise-overlay">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
