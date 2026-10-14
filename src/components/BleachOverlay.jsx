"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { CHARACTERS, TIER_META, ACHIEVEMENTS, getDialogueImage, GROUP_IMAGE, GROUP_EMPTY_IMAGE } from "@/lib/bleach";

/* ── Bleach dialogue toast ─────────────────────────────────────────────── */
/* Shows a character avatar (image) + name + their line, styled as an anime subtitle. */

export function BleachDialogue({ dialogue, onDismiss }) {
  const [visible, setVisible] = useState(false);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (dialogue) {
      setVisible(true);
      const t = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [dialogue, onDismiss]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!dialogue) return null;
  const char = CHARACTERS[dialogue.who] || CHARACTERS.ichigo;
  const imgSrc = getDialogueImage(dialogue.context, dialogue.who);

  return (
    <div
      className={`pointer-events-none fixed left-1/2 top-16 z-[70] -translate-x-1/2 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      }`}
      style={{ width: "calc(100% - 32px)", maxWidth: "358px" }}
    >
      <div
        className="flex items-start gap-3 rounded-2xl border-2 p-3 backdrop-blur-md"
        style={{
          background: "rgba(11,11,12,0.94)",
          borderColor: `${char.color}66`,
          boxShadow: `0 0 22px ${char.color}44, 4px 5px 0 rgba(0,0,0,0.5)`,
        }}
      >
        {/* Character image in a glowing rounded frame with a pop-in animation */}
        <div
          className="tb-char-pop relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full"
          style={{
            border: `2px solid ${char.color}`,
            background: `${char.color}22`,
            boxShadow: `0 0 14px ${char.color}aa, inset 0 0 10px ${char.color}33`,
          }}
        >
          { }
          <img
            src={imgSrc}
            alt={char.name}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <div
            className="text-[12px] font-bold"
            style={{ color: char.color, fontFamily: "var(--font-patrick-hand), cursive", fontSize: "16px" }}
          >
            {char.name}
          </div>
          <div className="mt-0.5 text-[13px] leading-snug text-white/90" style={{ fontFamily: "var(--font-patrick-hand), cursive", fontSize: "15px" }}>
            «{dialogue.line}»
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tb-char-pop {
          0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
          60% { transform: scale(1.1) rotate(3deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .tb-char-pop { animation: tb-char-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
      `}</style>
    </div>
  );
}

/* ── Achievement unlock overlay ────────────────────────────────────────── */
/* Full-screen energy effect + badge animation, tier-scaled. */

export function BleachAchievement({ achievement, onDismiss }) {
  const [phase, setPhase] = useState(0); // 0=enter, 1=show, 2=exit
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (achievement) {
      setPhase(0);
      const t1 = setTimeout(() => setPhase(1), 50);
      const t2 = setTimeout(() => setPhase(2), 3000);
      const t3 = setTimeout(() => onDismiss(), 3400);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [achievement, onDismiss]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!achievement) return null;
  const tier = TIER_META[achievement.tier] || TIER_META.common;
  const isBankai = achievement.tier === "extraordinary";

  return (
    <div
      className={`fixed inset-0 z-[75] flex items-center justify-center px-6 transition-opacity duration-400 ${
        phase === 2 ? "opacity-0" : "opacity-100"
      }`}
      style={{ background: "rgba(11,11,12,0.7)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
      onClick={onDismiss}
    >
      {/* energy rays */}
      {isBankai && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="tb-bankai-rays"
            style={{
              width: "600px",
              height: "600px",
              background: `conic-gradient(from 0deg, transparent 0deg, ${tier.color}22 10deg, transparent 20deg, transparent 30deg, ${tier.color}22 40deg, transparent 50deg, transparent 60deg, ${tier.color}22 70deg, transparent 80deg, transparent 90deg, ${tier.color}22 100deg, transparent 110deg, transparent 120deg, ${tier.color}22 130deg, transparent 140deg, transparent 150deg, ${tier.color}22 160deg, transparent 170deg, transparent 180deg, ${tier.color}22 190deg, transparent 200deg, transparent 210deg, ${tier.color}22 220deg, transparent 230deg, transparent 240deg, ${tier.color}22 250deg, transparent 260deg, transparent 270deg, ${tier.color}22 280deg, transparent 290deg, transparent 300deg, ${tier.color}22 310deg, transparent 320deg, transparent 330deg, ${tier.color}22 340deg, transparent 350deg)`,
              borderRadius: "999px",
              animation: "tb-spin 8s linear infinite",
            }}
          />
        </div>
      )}

      {/* the badge card */}
      <div
        className={`relative z-10 flex flex-col items-center rounded-2xl border-2 p-6 text-center transition-all duration-500 ${
          phase === 0 ? "scale-50 opacity-0" : phase === 1 ? "scale-100 opacity-100" : "scale-110 opacity-0"
        }`}
        style={{
          background: "rgba(20,20,22,0.95)",
          borderColor: tier.color,
          boxShadow: `0 0 40px ${tier.color}66, 0 0 80px ${tier.color}33`,
          maxWidth: "320px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* tier label */}
        <div
          className="mb-2 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest"
          style={{ background: tier.color, color: "#0b0b0c" }}
        >
          {tier.label}
        </div>

        {/* achievement image with halo + dramatic entrance */}
        <div className="relative mb-3 flex h-28 w-28 items-center justify-center">
          {/* glow halo */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${tier.color}55 0%, ${tier.color}22 45%, transparent 70%)`,
              filter: "blur(6px)",
              animation: "tb-pulse-glow 1.2s ease-in-out infinite",
            }}
          />
          {/* image container */}
          <div
            className="tb-ach-image relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full"
            style={{
              background: `${tier.color}22`,
              border: `2px solid ${tier.color}`,
              boxShadow: `0 0 20px ${tier.color}88`,
            }}
          >
            { }
            <img
              src={achievement.image}
              alt={achievement.title}
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
        </div>

        <div className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Logro desbloqueado</div>
        <div
          className="mt-1 text-2xl font-bold"
          style={{ color: tier.color, fontFamily: "var(--font-patrick-hand), cursive", fontSize: "26px" }}
        >
          {achievement.title}
        </div>
        <div className="mt-1 text-[13px] text-white/70" style={{ fontFamily: "var(--font-patrick-hand), cursive", fontSize: "15px" }}>
          {achievement.desc}
        </div>
      </div>

      {/* keyframes injected via a style tag */}
      <style>{`
        @keyframes tb-spin { to { transform: rotate(360deg); } }
        @keyframes tb-pulse-glow {
          0%,100% { box-shadow: 0 0 20px ${tier.color}88; transform: scale(1); opacity: 0.85; }
          50% { box-shadow: 0 0 40px ${tier.color}cc; transform: scale(1.08); opacity: 1; }
        }
        @keyframes tb-ach-pop {
          0% { transform: scale(0) rotate(-25deg); opacity: 0; }
          55% { transform: scale(1.18) rotate(8deg); opacity: 1; }
          75% { transform: scale(0.95) rotate(-3deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .tb-ach-image { animation: tb-ach-pop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
      `}</style>
    </div>
  );
}

/* ── Achievement gallery (in the stats sheet) ──────────────────────────── */

export function AchievementGallery({ unlockedIds }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {ACHIEVEMENTS.map((a) => {
        const unlocked = unlockedIds.includes(a.id);
        const tier = TIER_META[a.tier];
        return (
          <div
            key={a.id}
            className={`flex items-center gap-2 rounded-lg border p-2 transition-opacity ${
              unlocked ? "opacity-100" : "opacity-30"
            }`}
            style={{ borderColor: unlocked ? tier.color : "rgba(255,255,255,0.1)", background: unlocked ? `${tier.color}11` : "rgba(255,255,255,0.03)" }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md"
              style={{
                background: unlocked ? `${tier.color}22` : "rgba(255,255,255,0.05)",
                border: `1px solid ${unlocked ? tier.color : "rgba(255,255,255,0.08)"}`,
              }}
            >
              { }
              <img
                src={a.image}
                alt={a.title}
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
            <div className="min-w-0">
              <div className="truncate text-[12px] font-bold" style={{ color: unlocked ? tier.color : "#fff", fontFamily: "var(--font-patrick-hand), cursive", fontSize: "14px" }}>
                {a.title}
              </div>
              <div className="truncate text-[10px] text-white/50">{a.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
