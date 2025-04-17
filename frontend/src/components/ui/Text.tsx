"use client";

import { useTranslate } from "@/hooks/useTranslate";

interface TextProps {
  textKey: string;
  className?: string;
}

export function Text({ textKey, className }: TextProps) {
  const { t } = useTranslate();

  return <span className={className}>{t(textKey)}</span>;
}