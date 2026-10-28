import type { ReactNode } from "react";

type AuthCenterLayoutProps = {
  children: ReactNode;
  footer?: ReactNode;
};

/** Layout auth centré (référence Onime Menu). */
export function AuthCenterLayout({ children, footer }: AuthCenterLayoutProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-6 sm:px-6">
      <main id="contenu" className="flex flex-1 flex-col items-center justify-center py-6 sm:py-10">
        <div className="w-full">{children}</div>
      </main>
      {footer ? (
        <footer className="shrink-0 py-4 text-center text-caption text-muted-foreground">{footer}</footer>
      ) : null}
    </div>
  );
}
