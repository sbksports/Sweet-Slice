import "./globals.css";

export const metadata = {
  title: "Sweet Slice By Suma | Home Baked Premium Cakes",
  description: "Sweet Slice By Suma - Premium home-baked birthday cakes and desserts. Healthy food for a healthy life. Order customized cakes online.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          precedence="default"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
