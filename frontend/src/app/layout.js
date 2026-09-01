import "./globals.css";
import { CartProvider } from "@/provider/CartContext";
import QueryProvider from "@/provider/QueryProvider";
export const metadata = {
  title: "Modern Multi-Vendor E-Commerce Platform",
  description: "Browse products from verified vendors",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#6c5ce7] p-3 antialiased font-sans md:p-6">
        <div className="mx-auto flex min-h-[92vh] w-full max-w-[1400px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
       
          <QueryProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </QueryProvider>
        </div>
      </body>
    </html>
  );
}
