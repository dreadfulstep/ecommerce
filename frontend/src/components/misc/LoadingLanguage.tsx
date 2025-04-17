import { Languages } from "lucide-react";

const LoadingLanguage = ({ language } : { language: string }) => (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/5 pointer-events-none select-none backdrop-blur-sm text-white z-50">

        <div className="mb-4">
            <div className="flex items-center gap-2 text-foreground font-heading font-bold text-2xl">
                zylolabs.xyz
                <div className="border-2 border-primary/50 bg-primary/10 text-primary/80 px-1 py-0.5 rounded-lg text-xs font-bold uppercase backdrop-blur-lg">
                    BETA
                </div>
            </div>
        </div>

        <div className="w-48 h-1 bg-foreground/20 rounded-full overflow-hidden">
            <div className="w-[150%] h-full bg-primary rounded-full animate-progress-indeterminate"></div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Languages className="size-4" /> {language}
        </p>
    </div>
);

export default LoadingLanguage;
