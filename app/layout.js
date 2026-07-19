import "./globals.css";

export const metadata = {
  title: "Career Console",
  description: "Schedule LinkedIn posts, track web dev job leads, manage applications.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
