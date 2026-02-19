export const metadata = {
  title: "AuthCore Meme Quest",
  description: "Fun auth frontend for AuthCore backend",
};

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
