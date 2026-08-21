import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#6c5ce7] p-3 antialiased font-sans md:p-6">
        <div className="mx-auto flex min-h-[92vh] w-full max-w-[1400px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
          {children}
        </div>
      </body>
    </html>
  );
}