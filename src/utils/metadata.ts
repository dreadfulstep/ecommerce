import type { Metadata } from "next";

const defaultMetadata: Metadata = {
  title: "Zylo Labs - The Ultimate Discord Bot List",
  description:
    "Discover, explore, and vote for the best Discord bots on Zylo Labs!",
  openGraph: {
    title: "Zylo Labs - The Ultimate Discord Bot List",
    description:
      "Find the best Discord bots, explore their features, and add them to your server effortlessly!",
    url: "https://zylolabs.xyz",
    siteName: "Zylo Labs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zylo Labs - The Ultimate Discord Bot List",
    description:
      "Browse and vote for top Discord bots. Add the best bots to your server today!",
  },
};

export const generateMetadata = (
  overrides: Partial<Metadata> = {},
): Metadata => {
  return {
    ...defaultMetadata,
    ...overrides,
    openGraph: {
      ...defaultMetadata.openGraph,
      ...overrides.openGraph,
    },
    twitter: {
      ...defaultMetadata.twitter,
      ...overrides.twitter,
    },
  };
};
