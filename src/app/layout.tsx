import { Inter, Prompt } from "next/font/google";
import { generateMetadata } from "@/utils/metadata";
import { getPrimaryColour, getTheme } from "@/lib/theme";
import { headers } from "next/headers";
import "./globals.css";
import ClientProviders from "@/components/layout/ClientProviders";
import Script from "next/script";

// const manropeFont = Manrope({ variable: "--font-number", subsets: ["latin"] });
const promptFont = Prompt({
  variable: "--font-heading",
  weight: "700",
  subsets: ["latin"],
});
const interFont = Inter({ variable: "--font-text", subsets: ["latin"] });

export const metadata = generateMetadata();

const GA_MEASUREMENT_ID = "G-LBCZSBFL5P";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const cookieHeader = headersList.get("cookie") || "";

  const theme = getTheme(cookieHeader);
  const { hsl, hue } = getPrimaryColour(cookieHeader);
  const rotatedHue = (Number(hue) - 50 + 360) % 360;
  const rotatedHslValue = `${rotatedHue}, 100%, 50%`;

  const lightness = parseInt(hsl.split(",")[2]);
  const primaryForeground = lightness > 40 ? "#000000" : "#FFFFFF";

  return (
    <html
      lang="en"
      className={theme ? "dark" : "light"}
      style={
        {
          "--primary": hsl,
          "--hue": hue,
          "--primary-rotated": rotatedHslValue,
          "--primary-foreground": primaryForeground,
        } as React.CSSProperties
      }
    >
      <body className={`${interFont.variable} ${promptFont.variable} antialiased`}>
        <ClientProviders theme={theme ? "dark" : "light"}>
          {children}
        </ClientProviders>
        <Script
          strategy="lazyOnload"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <Script
          id="google-analytics-config"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `,
          }}
        />
      </body>
    </html>
  );
}
