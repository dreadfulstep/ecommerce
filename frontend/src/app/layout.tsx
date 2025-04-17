import { Manrope, Prompt, Inter } from "next/font/google";
import { generateMetadata } from "@/utils/metadata";
import { getPrimaryColour, getTheme } from "@/lib/theme";
import { headers } from "next/headers";
import { TranslationProvider } from "@/hooks/useTranslate";
import { getPreferredLanguageFromHeader, loadTranslation } from "@/utils/translate";
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";
import { MissingLangKeys } from "@/components/misc/MissingLangKeys";

const manropeFont = Manrope({ variable: "--font-number", subsets: ["latin"] });
const promptFont = Prompt({ variable: "--font-heading", weight: "700", subsets: ["latin"] });
const interFont = Inter({ variable: "--font-text", subsets: ["latin"] });

export const metadata = generateMetadata();

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const acceptLanguageHeader = headersList.get("accept-language") || "";
  const rawIp = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '0.0.0.0';
  let ip = rawIp;
  
  if (rawIp.includes('::ffff:')) {
    ip = rawIp.split('::ffff:')[1];
  }
  
  if (ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  } 
  const cookieHeader = headersList.get("cookie") || "";

  const theme = getTheme(cookieHeader);
  const { hsl, hue } = getPrimaryColour(cookieHeader);
  const rotatedHue = (Number(hue) - 50 + 360) % 360;
  const rotatedHslValue = `${rotatedHue}, 100%, 50%`;

  const lightness = parseInt(hsl.split(",")[2]);
  const primaryForeground = lightness > 40 ? "#000000" : "#FFFFFF";

  const cookies = Object.fromEntries(
    cookieHeader
      .split("; ")
      .map((c) => c.split("="))
  );

  const cookieLanguage = cookies["language"];
  const language = cookieLanguage ? cookieLanguage : await getPreferredLanguageFromHeader(acceptLanguageHeader);
  const translations = await loadTranslation(language as string);

  return (
    <html
      className={theme ? "dark" : "light"}
      style={{
        "--primary": hsl,
        "--hue": hue,
        "--primary-rotated": rotatedHslValue,
        "--primary-foreground": primaryForeground
      } as React.CSSProperties}
      data-ip={ip}
    >
      <body className={`${manropeFont.variable} ${promptFont.variable} ${interFont.variable} antialiased`}>
        <TranslationProvider 
            devMode={process.env.NODE_ENV === 'development'} 
            initialLanguage={language as string}
            initialTranslations={translations}
        >
          <TooltipProvider delayDuration={0}>
            {children}
            <Toaster theme={theme ? "dark" : "light"} />
            {process.env.NODE_ENV === 'development' && <MissingLangKeys />}
          </TooltipProvider>
        </TranslationProvider>
      </body>
    </html>
  );
}
