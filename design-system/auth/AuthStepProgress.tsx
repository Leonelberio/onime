type AuthStepProgressProps = {
  /** Nombre total d'étapes */
  stepCount: number;
  /** Index de l'étape courante (0-based) */
  currentStep: number;
  /** Titre de l'étape courante (lecteur d'écran) */
  currentTitle?: string;
  className?: string;
};

/** Barres de progression auth (style Onime Menu). */
export function AuthStepProgress({
  stepCount,
  currentStep,
  currentTitle,
  className = "mt-4",
}: AuthStepProgressProps) {
  const safeCount = Math.max(1, stepCount);
  const safeStep = Math.min(Math.max(0, currentStep), safeCount - 1);

  return (
    <>
      <div className={`flex justify-center gap-1 ${className}`.trim()} aria-hidden="true">
        {Array.from({ length: safeCount }, (_, i) => (
          <span
            key={i}
            className={`h-0.5 w-8 rounded-pill transition-colors ${
              i <= safeStep ? "bg-primary" : "bg-surface"
            }`}
          />
        ))}
      </div>
      {currentTitle ? (
        <p className="sr-only" role="status">
          Étape {safeStep + 1} sur {safeCount} : {currentTitle}
        </p>
      ) : null}
    </>
  );
}
