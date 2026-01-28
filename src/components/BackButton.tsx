"use client";

export default function BackButton({
  className = "",
  fallbackHref = "/timeline",
}: {
  className?: string;
  fallbackHref?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        // if user entered directly (no history), go to fallback
        if (window.history.length > 1) window.history.back();
        else window.location.href = fallbackHref;
      }}
      className={className}
    >
      ← Back
    </button>
  );
}
