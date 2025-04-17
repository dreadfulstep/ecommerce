"use client";

import { useTranslate } from "@/hooks/useTranslate";
import { Languages } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const MissingLangKeys = () => {
  const { missingKeys } = useTranslate();

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <button
            className="fixed bottom-4 right-4 flex items-center justify-center gap-2 p-2 border bg-tertiary hover:bg-tertiary/60 text-foreground rounded-full shadow-lg transition-all"
          >
            <Languages className="size-5" />
            {missingKeys.length !== 0 && (
              <span className="text-sm">{missingKeys.length} Missing</span>
            )}
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-lg w-full bg-background p-6 rounded-lg shadow-lg">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="text-xl font-semibold">Missing Translation Keys</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              The following translation keys are missing in your current language configuration.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-auto max-h-60">
            <ul className="space-y-2">
              {missingKeys.length > 0 ? (
                missingKeys.map((key, index) => (
                  <li key={index} className="text-sm text-muted-foreground">{key}</li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground">No missing keys</li>
              )}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
