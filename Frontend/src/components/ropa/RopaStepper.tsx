import { ropaStepLabels } from "@/config/ropa-steps";

type RopaStepperProps = {
  /** 1-based */
  currentStep: number;
};

const TEAL = "bg-[#2dd4bf]";
const LINE = "bg-slate-200";

export function RopaStepper({ currentStep }: RopaStepperProps) {
  const activeIndex = Math.min(Math.max(currentStep - 1, 0), 3);

  return (
    <div className="relative w-full px-2 sm:px-4">
      <div
        className="absolute left-[12%] right-[12%] top-[0.65rem] hidden h-0.5 sm:block"
        aria-hidden
      >
        <div className={`h-full w-full rounded-full ${LINE}`} />
        <div
          className={`absolute left-0 top-0 h-full rounded-full ${TEAL} transition-all duration-300`}
          style={{
            width: `${(activeIndex / (ropaStepLabels.length - 1)) * 100}%`,
          }}
        />
      </div>

      <ol className="relative z-[1] grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-2">
        {ropaStepLabels.map((label, index) => {
          const isActive = index === activeIndex;
          const isDone = index < activeIndex;

          return (
            <li key={label} className="flex flex-col items-center gap-2 text-center">
              <div
                className={`flex items-center justify-center rounded-full border-[3px] border-white shadow-sm transition-all ${
                  isActive
                    ? "h-7 w-7 bg-[#2dd4bf] ring-4 ring-teal-100"
                    : isDone
                      ? "h-6 w-6 bg-[#2dd4bf]"
                      : "h-6 w-6 bg-slate-300"
                }`}
              >
                {isActive ? (
                  <span className="h-2 w-2 rounded-full bg-white" />
                ) : isDone ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
                ) : null}
              </div>
              <span
                className={`max-w-[9rem] text-[11px] font-medium leading-snug sm:text-xs ${
                  isActive ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
