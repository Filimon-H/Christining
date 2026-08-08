"use client";

import { useEffect, useState } from "react";

type Remaining = { days: number; hours: number; minutes: number } | null;

function computeRemaining(target: number): Remaining {
  const diff = target - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
  };
}

/**
 * A quiet countdown. Small type, minute resolution, no ticking seconds.
 *
 * Renders nothing on the server or first client paint: the value depends on
 * the current time, so committing to one during hydration would guarantee a
 * mismatch. Once the date has passed it becomes a thank-you line instead.
 */
export default function Countdown({ isoDate }: { isoDate: string }) {
  const [remaining, setRemaining] = useState<Remaining>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const target = new Date(isoDate).getTime();
    if (Number.isNaN(target)) return;

    setRemaining(computeRemaining(target));
    setReady(true);

    const interval = window.setInterval(() => {
      setRemaining(computeRemaining(target));
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [isoDate]);

  if (!ready) return null;

  if (!remaining) {
    return (
      <p className="t-body italic text-ink-muted">
        With grateful hearts, thank you for celebrating with us.
      </p>
    );
  }

  const units = [
    { value: remaining.days, label: remaining.days === 1 ? "Day" : "Days" },
    { value: remaining.hours, label: remaining.hours === 1 ? "Hour" : "Hours" },
    {
      value: remaining.minutes,
      label: remaining.minutes === 1 ? "Minute" : "Minutes",
    },
  ];

  return (
    <dl className="flex items-start justify-center gap-xl">
      {units.map((unit) => (
        <div key={unit.label} className="flex flex-col items-center gap-hair">
          <dd className="t-numeral">{String(unit.value).padStart(2, "0")}</dd>
          <dt className="t-label">{unit.label}</dt>
        </div>
      ))}
    </dl>
  );
}
