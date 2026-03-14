import type { Metadata } from "next";
import { RootProvider } from "fumadocs-ui/provider/next";
import { Inter } from "next/font/google";
import "./global.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "LangGraphJS Documentation",
    template: "%s | LangGraphJS",
  },
  description: "Build language agents as graphs with LangGraphJS",
  metadataBase: new URL("https://langchain-ai.github.io/langgraphjs/"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased">
        <RootProvider
          theme={{ enabled: true, defaultTheme: "system" }}
          search={{
            enabled: true,
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
