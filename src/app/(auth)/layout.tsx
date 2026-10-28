import { CLIENT_LEGAL_NAME } from "@/lib/branding";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-6 sm:px-6">
      <main id="contenu" className="flex flex-1 flex-col items-center justify-center py-6 sm:py-10">
        <div className="w-full">{children}</div>
      </main>
      <footer className="shrink-0 py-4 text-center text-caption text-muted-foreground">
        © {new Date().getFullYear()} {CLIENT_LEGAL_NAME}
      </footer>
    </div>
  );
}
