"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Calculator, Copy, X } from "lucide-react";

type Op = "+" | "-" | "×" | "÷";

function formatDisplay(value: number): string {
  if (!Number.isFinite(value)) return "Error";
  const rounded = Math.round(value * 1e8) / 1e8;
  if (Math.abs(rounded) >= 1e12) return rounded.toExponential(6);
  const text = String(rounded);
  return text.length > 14 ? rounded.toPrecision(10).replace(/\.?0+$/, "") : text;
}

function applyOp(left: number, right: number, op: Op): number {
  switch (op) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "×":
      return left * right;
    case "÷":
      return right === 0 ? NaN : left / right;
  }
}

type FormCalculatorProps = {
  className?: string;
  /** dock = always-open desktop sidebar; fab = mobile floating button */
  placement?: "dock" | "fab";
};

/**
 * Simple form helper calculator — especially for % charges (card readers, platform fees).
 * Example: 1500 × 1.75 % → 26.25
 */
export function FormCalculator({ className = "", placement = "dock" }: FormCalculatorProps) {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [display, setDisplay] = useState("0");
  const [accumulator, setAccumulator] = useState<number | null>(null);
  const [pendingOp, setPendingOp] = useState<Op | null>(null);
  const [freshEntry, setFreshEntry] = useState(true);
  const [copied, setCopied] = useState(false);

  const isFab = placement === "fab";
  const isDock = placement === "dock";

  useEffect(() => {
    if (!isFab || !open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const el = rootRef.current;
      if (!el) return;
      const target = e.target as Node | null;
      if (target && !el.contains(target)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, [isFab, open]);

  const current = Number.parseFloat(display);
  const safeCurrent = Number.isFinite(current) ? current : 0;

  const inputDigit = (digit: string) => {
    setDisplay((prev) => {
      if (freshEntry || prev === "0" || prev === "Error") {
        setFreshEntry(false);
        return digit === "." ? "0." : digit;
      }
      if (digit === "." && prev.includes(".")) return prev;
      if (prev.replace(".", "").length >= 12) return prev;
      return `${prev}${digit}`;
    });
  };

  const clearAll = () => {
    setDisplay("0");
    setAccumulator(null);
    setPendingOp(null);
    setFreshEntry(true);
  };

  const clearEntry = () => {
    setDisplay("0");
    setFreshEntry(true);
  };

  const backspace = () => {
    if (freshEntry) return;
    setDisplay((prev) => {
      if (prev.length <= 1 || prev === "Error") {
        setFreshEntry(true);
        return "0";
      }
      return prev.slice(0, -1);
    });
  };

  const chooseOp = (op: Op) => {
    if (pendingOp !== null && accumulator !== null && !freshEntry) {
      const next = applyOp(accumulator, safeCurrent, pendingOp);
      setAccumulator(next);
      setDisplay(formatDisplay(next));
    } else {
      setAccumulator(safeCurrent);
    }
    setPendingOp(op);
    setFreshEntry(true);
  };

  const equals = () => {
    if (pendingOp === null || accumulator === null) return;
    const next = applyOp(accumulator, safeCurrent, pendingOp);
    setDisplay(formatDisplay(next));
    setAccumulator(null);
    setPendingOp(null);
    setFreshEntry(true);
  };

  /** Percent for fee maths: after × or ÷, treats right-hand as a percent of left. */
  const percent = () => {
    if (pendingOp && accumulator !== null) {
      const pct = safeCurrent / 100;
      let next: number;
      if (pendingOp === "×") next = accumulator * pct;
      else if (pendingOp === "÷") next = pct === 0 ? NaN : accumulator / pct;
      else next = applyOp(accumulator, accumulator * pct, pendingOp);
      setDisplay(formatDisplay(next));
      setAccumulator(null);
      setPendingOp(null);
      setFreshEntry(true);
      return;
    }
    setDisplay(formatDisplay(safeCurrent / 100));
    setFreshEntry(true);
  };

  const copyAmount = async () => {
    const value = display === "Error" ? "" : display;
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore — user can still read the display
    }
  };

  const keyClass =
    "flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition active:scale-[0.97] disabled:opacity-50";

  const panel = (
    <div
      id={panelId}
      role={isFab ? "dialog" : "region"}
      aria-label="Percentage and amount calculator"
      className={
        isFab
          ? "absolute bottom-[4.25rem] right-0 z-40 w-[min(100vw-2rem,18.5rem)] rounded-2xl border border-black/10 bg-white p-3 shadow-xl shadow-black/10"
          : "w-full rounded-2xl border border-black/10 bg-white p-3 shadow-card"
      }
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Helper</p>
          <p className="text-sm font-semibold text-brand-black">Fee calculator</p>
        </div>
        {isFab ? (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close calculator"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <p className="mb-2 text-[11px] leading-snug text-brand-muted">
        Card / platform fees: enter amount, press <strong className="text-brand-black">×</strong>, enter %, press{" "}
        <strong className="text-brand-black">%</strong>. Example: <span className="tabular-nums">1500 × 1.75 %</span>
      </p>

      <div className="mb-2 rounded-xl border border-black/10 bg-neutral-50 px-3 py-3">
        <p className="text-right font-mono text-2xl font-semibold tabular-nums tracking-tight text-brand-black">
          {display}
        </p>
        {pendingOp && accumulator !== null ? (
          <p className="mt-0.5 text-right text-[11px] tabular-nums text-slate-400">
            {formatDisplay(accumulator)} {pendingOp}
          </p>
        ) : null}
      </div>

      <div className="mb-2 grid grid-cols-4 gap-1.5">
        <button type="button" className={`${keyClass} bg-slate-100 text-slate-700 hover:bg-slate-200`} onClick={clearAll}>
          AC
        </button>
        <button type="button" className={`${keyClass} bg-slate-100 text-slate-700 hover:bg-slate-200`} onClick={clearEntry}>
          CE
        </button>
        <button type="button" className={`${keyClass} bg-slate-100 text-slate-700 hover:bg-slate-200`} onClick={backspace}>
          ⌫
        </button>
        <button
          type="button"
          className={`${keyClass} bg-brand-mint text-brand-forest hover:bg-brand-green/20`}
          onClick={percent}
        >
          %
        </button>

        <button type="button" className={`${keyClass} bg-neutral-100 text-brand-black hover:bg-neutral-200`} onClick={() => inputDigit("7")}>
          7
        </button>
        <button type="button" className={`${keyClass} bg-neutral-100 text-brand-black hover:bg-neutral-200`} onClick={() => inputDigit("8")}>
          8
        </button>
        <button type="button" className={`${keyClass} bg-neutral-100 text-brand-black hover:bg-neutral-200`} onClick={() => inputDigit("9")}>
          9
        </button>
        <button type="button" className={`${keyClass} bg-slate-800 text-white hover:bg-slate-700`} onClick={() => chooseOp("÷")}>
          ÷
        </button>

        <button type="button" className={`${keyClass} bg-neutral-100 text-brand-black hover:bg-neutral-200`} onClick={() => inputDigit("4")}>
          4
        </button>
        <button type="button" className={`${keyClass} bg-neutral-100 text-brand-black hover:bg-neutral-200`} onClick={() => inputDigit("5")}>
          5
        </button>
        <button type="button" className={`${keyClass} bg-neutral-100 text-brand-black hover:bg-neutral-200`} onClick={() => inputDigit("6")}>
          6
        </button>
        <button type="button" className={`${keyClass} bg-slate-800 text-white hover:bg-slate-700`} onClick={() => chooseOp("×")}>
          ×
        </button>

        <button type="button" className={`${keyClass} bg-neutral-100 text-brand-black hover:bg-neutral-200`} onClick={() => inputDigit("1")}>
          1
        </button>
        <button type="button" className={`${keyClass} bg-neutral-100 text-brand-black hover:bg-neutral-200`} onClick={() => inputDigit("2")}>
          2
        </button>
        <button type="button" className={`${keyClass} bg-neutral-100 text-brand-black hover:bg-neutral-200`} onClick={() => inputDigit("3")}>
          3
        </button>
        <button type="button" className={`${keyClass} bg-slate-800 text-white hover:bg-slate-700`} onClick={() => chooseOp("-")}>
          −
        </button>

        <button type="button" className={`${keyClass} bg-neutral-100 text-brand-black hover:bg-neutral-200`} onClick={() => inputDigit("0")}>
          0
        </button>
        <button type="button" className={`${keyClass} bg-neutral-100 text-brand-black hover:bg-neutral-200`} onClick={() => inputDigit(".")}>
          .
        </button>
        <button type="button" className={`${keyClass} bg-brand-green text-white hover:bg-brand-green-dark`} onClick={equals}>
          =
        </button>
        <button type="button" className={`${keyClass} bg-slate-800 text-white hover:bg-slate-700`} onClick={() => chooseOp("+")}>
          +
        </button>
      </div>

      <button
        type="button"
        onClick={() => void copyAmount()}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-green/30 bg-brand-mint/40 px-3 py-2.5 text-xs font-semibold text-brand-forest transition hover:bg-brand-mint"
      >
        <Copy className="h-3.5 w-3.5" aria-hidden />
        {copied ? "Copied — paste into a £ field" : "Copy result to paste into amount"}
      </button>
    </div>
  );

  if (isDock) {
    return (
      <div ref={rootRef} className={className}>
        {panel}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`fixed bottom-5 right-4 z-40 sm:bottom-8 sm:right-8 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="inline-flex items-center gap-2.5 rounded-2xl border-2 border-brand-green bg-slate-200 px-3.5 py-3 text-brand-black shadow-lg shadow-black/10 transition hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-green/40"
        title="Open calculator for % fees and amounts"
      >
        <span
          className="grid grid-cols-2 gap-0.5 rounded-lg border border-brand-green/50 bg-slate-300/80 p-1"
          aria-hidden
        >
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-500 text-[8px] font-bold leading-none text-white">
            +
          </span>
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-500 text-[8px] font-bold leading-none text-white">
            −
          </span>
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-500 text-[8px] font-bold leading-none text-white">
            ×
          </span>
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-green text-[8px] font-bold leading-none text-white">
            %
          </span>
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-xs font-bold text-brand-black">Calculator</span>
          <span className="text-[10px] font-medium text-brand-muted">Fees &amp; %</span>
        </span>
        <Calculator className="h-4 w-4 text-brand-green" aria-hidden />
        <span className="sr-only">Open calculator</span>
      </button>

      {open ? panel : null}
    </div>
  );
}
