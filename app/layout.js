import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import localFont from "next/font/local";

const myriad = localFont({
  src: [
    {
      path: "../public/fonts/Myreid/MyriadPro-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Myreid/MyriadPro-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Myreid/MyriadPro-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-myriad",
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={myriad.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
          rel="stylesheet"
        />
{/* 
        <link
          href="https://fonts.googleapis.com/css2?family=Philosopher:wght@400;700&display=swap"
          rel="stylesheet"
        /> */}
      </head>

      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}