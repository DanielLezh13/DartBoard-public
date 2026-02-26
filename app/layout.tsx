import type { Metadata } from "next";
import "./globals.css";
import { ClientLayoutWrapper } from "@/components/ClientLayoutWrapper";
import { UI_THEME_PICKER_ENABLED, UI_THEME_STORAGE_KEY } from "@/lib/uiTheme";

export const metadata: Metadata = {
  title: "DartBoard",
  description: "Local AI environment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initThemeScript = `(() => {
    try {
      const allowMono = ${UI_THEME_PICKER_ENABLED ? "true" : "false"};
      const raw = localStorage.getItem("${UI_THEME_STORAGE_KEY}");
      const theme = allowMono && raw === "mono" ? "mono" : "brand";
      document.documentElement.setAttribute("data-ui-theme", theme);
      if (document.body) document.body.setAttribute("data-ui-theme", theme);
    } catch {
      document.documentElement.setAttribute("data-ui-theme", "brand");
      if (document.body) document.body.setAttribute("data-ui-theme", "brand");
    }
  })();`;

  return (
    <html lang="en" className="dark" data-ui-theme="brand" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: initThemeScript }} />
      </head>
      <body className="antialiased bg-transparent">
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
