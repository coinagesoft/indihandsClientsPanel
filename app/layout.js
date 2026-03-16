import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";



export default function RootLayout({ children }) {
  return (
    <html lang="en">
         <head>
        {/* ✅ Remix Icons */}
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
          rel="stylesheet"
        />
        <link
  href="https://fonts.googleapis.com/css2?family=Philosopher:wght@400;700&display=swap"
  rel="stylesheet"
/>
      </head>
      <body suppressHydrationWarning >
        {children}
      </body>
    </html>
  );
}
