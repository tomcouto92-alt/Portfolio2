"use client";

export function Spinner({ size = "md" }: { size?: "sm" | "md" }) {
  const s = size === "sm" ? "w-3.5 h-3.5 border-2" : "w-8 h-8 border-2";
  return (
    <span
      className={`${s} border-white/20 border-t-white rounded-full animate-spin inline-block`}
    />
  );
}

export function Label({ text }: { text: string }) {
  return (
    <div className="text-xs uppercase tracking-[0.2em] text-[#B8B8B8] mb-2">{text}</div>
  );
}

type SaveButtonProps = {
  onClick: () => void;
  saving: boolean;
  saved: boolean;
  disabled?: boolean;
  label?: string;
};

export function SaveButton({
  onClick,
  saving,
  saved,
  disabled,
  label = "Guardar",
}: SaveButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={saving || disabled}
      className={`min-w-[180px] px-8 py-3.5 rounded-full text-sm font-semibold transition-all duration-200 ${
        saved
          ? "bg-emerald-500 text-white scale-[1.02]"
          : saving
          ? "bg-white/20 text-white/60 cursor-not-allowed"
          : "bg-white text-black hover:bg-white/90 hover:scale-[1.02] active:scale-[0.99] shadow-lg shadow-white/10"
      }`}
    >
      {saving ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner size="sm" />
          Guardando...
        </span>
      ) : saved ? (
        "✓ Guardado"
      ) : (
        label
      )}
    </button>
  );
}
