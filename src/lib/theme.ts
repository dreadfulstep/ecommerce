import config from "@/data/theme.json";

export const colourOptions = config.colours;

export const getDefaultPrimaryColour = () => ({
  hsl: config.defaultColor.hsl,
  hue: config.defaultColor.hue,
});

export const getPrimaryColour = (cookieHeader: string | null) => {
  const cookies = Object.fromEntries((cookieHeader || "").split("; ").map((c) => c.split("=")));
  const savedColour = cookies["primary-colour"] || "ocean";

  return (
    colourOptions.find((c) => c.value === savedColour) || getDefaultPrimaryColour()
  );
};

export const getTheme = (cookieHeader: string | null): boolean => {
  if (!cookieHeader) return true;

  const cookies = Object.fromEntries(
    cookieHeader
      .split("; ")
      .map((c) => c.split("="))
  );

  return cookies["dark-mode"] !== "false";
};