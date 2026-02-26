// components/AndOrToggle.tsx

type Mode = "AND" | "OR";

interface AndOrToggleProps {
  value: Mode;
  onChange: (value: Mode) => void;
}

export function AndOrToggle({ value, onChange }: AndOrToggleProps) {
  const isAnd = value === "AND";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(isAnd ? "OR" : "AND")}
        className={`relative inline-flex h-6 w-11 rounded-full transition-colors 
          ${isAnd ? "bg-blue-500" : "bg-slate-700/80"}`}
        aria-pressed={isAnd}
      >
        <span
          className={`absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-slate-950 shadow-md transform transition-transform
            ${isAnd ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
      {/* Text label to the right so it never sits under the knob */}
      <span className="text-[0.7rem] font-semibold tracking-wide uppercase text-slate-300">
        {value}
      </span>
    </div>
  );
}

