"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Filter,
  Clock,
  Plus,
  Check,
  Sparkles,
  Pencil,
  Trash2,
  Brush,
  PartyPopper,
  Flame,
  Calendar,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  MoreHorizontal,
  CopyPlus,
  Search,
  Share2,
  X,
  Shuffle,
  Hourglass,
  Keyboard,
  Sunrise,
  Sun,
  Moon,
  Focus,
  Tag,
  Briefcase,
  Heart,
  Palette,
  ShoppingCart,
  Dumbbell,
  Flag,
  BarChart3,
  Volume2,
  VolumeX,
  Zap,
  EllipsisVertical,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  Inbox,
  CircleAlert,
  Undo2,
  Repeat,
  Bell,
  Sunset,
  MoonStar,
  Coffee,
  ListChecks,
  CheckSquare,
  Square,
  CircleDot,
  Timer,
  User,
  PencilLine,
  Save,
  Smile,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  pickDialogue,
  CHARACTERS,
  ACHIEVEMENTS,
  TIER_META,
  GROUP_IMAGE,
  GROUP_EMPTY_IMAGE,
  playAchievementSound,
  playCompleteSound,
  playFailSound,
  playWowSound,
} from "@/lib/bleach";
import { BleachDialogue, BleachAchievement, AchievementGallery } from "@/components/BleachOverlay";
import { ToastAction } from "@/components/ui/toast";
import { usePushNotifications } from "@/hooks/use-push-notifications";

/**
 * Mock task data.
 * Colors cycle through: #39ff14, #ffe94a, #ff4fa3, #9d4dff, #ff8a3d
 * Rotations are kept between -3 and 3.
 *
 * Shape: { id, title, emoji, color, startTime, endTime, duration, rotation }
 */
const NEON_COLORS = ["#39ff14", "#ffe94a", "#ff4fa3", "#9d4dff", "#ff8a3d"];

const TAGS = [
  { id: "work",      label: "Trabajo",      icon: Briefcase,   color: "#3b82f6" },
  { id: "personal",  label: "Personal",  icon: Heart,       color: "#ff4fa3" },
  { id: "creative",  label: "Creativo",  icon: Palette,     color: "#9d4dff" },
  { id: "errands",   label: "Recados",   icon: ShoppingCart, color: "#ff8a3d" },
  { id: "health",    label: "Salud",    icon: Dumbbell,    color: "#39ff14" },
];
const TAG_MAP = Object.fromEntries(TAGS.map((t) => [t.id, t]));

const PRIORITIES = [
  { id: 1, label: "P1", name: "Alta",   color: "#ff4fa3", icon: Zap },
  { id: 2, label: "P2", name: "Media", color: "#ffe94a", icon: Flag },
  { id: 3, label: "P3", name: "Baja",    color: "#9d4dff", icon: Flag },
];
const PRIORITY_MAP = Object.fromEntries(PRIORITIES.map((p) => [p.id, p]));

const RECURRENCE = [
  { id: "none",   label: "Ninguna",   icon: Repeat, color: "#ffffff" },
  { id: "daily",  label: "Diaria",  icon: Repeat, color: "#39ff14" },
  { id: "weekly", label: "Semanal", icon: Repeat, color: "#3b82f6" },
];
const RECURRENCE_MAP = Object.fromEntries(RECURRENCE.map((r) => [r.id, r]));

const MOCK_TASKS = [
  { id: 1, title: "Estiramiento matutino y una taza de té tranquila", emoji: "🧘", color: NEON_COLORS[0], startTime: "7am", endTime: "7:15am", duration: 15, rotation: -2, tag: "health", priority: 3, recurrence: "daily", subtasks: [] },
  { id: 2, title: "Bocetar ideas de logo en el cuaderno", emoji: "✏️", color: NEON_COLORS[1], startTime: "9:30am", endTime: "10:15am", duration: 45, rotation: 3, tag: "creative", priority: 2, recurrence: "none", subtasks: [
    { id: "s1", text: "Mood board de 10 referencias", done: true },
    { id: "s2", text: "3 conceptos rápidos", done: false },
    { id: "s3", text: "Elegir un favorito", done: false },
  ] },
  { id: 3, title: "Café con Mia en la cafetería de la esquina", emoji: "☕", color: NEON_COLORS[2], startTime: "11am", endTime: "11:45am", duration: 45, rotation: -1, tag: "personal", priority: 3, recurrence: "none", subtasks: [] },
  { id: 4, title: "Terminar las diapositivas para la presentación del martes", emoji: "💼", color: NEON_COLORS[3], startTime: "1pm", endTime: "1:30pm", duration: 30, rotation: 2, tag: "work", priority: 1, recurrence: "none", subtasks: [
    { id: "s4", text: "Diapositiva de introducción", done: true },
    { id: "s5", text: "Problema + solución", done: true },
    { id: "s6", text: "Nivel de precios", done: false },
    { id: "s7", text: "Llamada a la acción final", done: false },
  ] },
  { id: 5, title: "Regar las plantas y ordenar el escritorio", emoji: "🌿", color: NEON_COLORS[4], startTime: "3:15pm", endTime: "3:30pm", duration: 15, rotation: -3, tag: "errands", priority: 3, recurrence: "weekly", subtasks: [] },
  { id: 6, title: "Paseo nocturno + podcast junto al río", emoji: "🎧", color: NEON_COLORS[0], startTime: "6pm", endTime: "6:30pm", duration: 30, rotation: 1, tag: "health", priority: 2, recurrence: "daily", subtasks: [] },
];

const EMOJI_CHOICES = [
  "📝", "🎨", "🏃", "📞", "🛒", "🍳", "📚", "💡",
  "🌱", "🎯", "💧", "🎵", "🧘", "✏️", "💼", "🎧",
];

/* Avatar emoji options for the profile + their accent background colors. */
const AVATAR_CHOICES = [
  { emoji: "🙂", color: "#3b82f6" },
  { emoji: "😎", color: "#ffe94a" },
  { emoji: "🤓", color: "#39ff14" },
  { emoji: "🥳", color: "#ff4fa3" },
  { emoji: "😺", color: "#ff8a3d" },
  { emoji: "🦊", color: "#ff8a3d" },
  { emoji: "🐼", color: "#9d4dff" },
  { emoji: "🦄", color: "#ff4fa3" },
  { emoji: "🌸", color: "#ff4fa3" },
  { emoji: "⭐", color: "#ffe94a" },
  { emoji: "🌙", color: "#9d4dff" },
  { emoji: "🍀", color: "#39ff14" },
];

const DURATION_CHOICES = [10, 15, 30, 45, 60, 90];

const FILTERS = [
  { id: "all", label: "Todas" },
  { id: "active", label: "Activas" },
  { id: "done", label: "Completadas" },
  { id: "quick", label: "Rápidas ≤30m" },
];

const STORAGE_KEY = "taskboard.v2";

const STATUS_META = {
  active:   { label: "NOW",     color: "#39ff14", glow: "tb-ring-active" },
  soon:     { label: "SOON",    color: "#ffe94a", glow: null },
  overdue:  { label: "PAST",    color: "#ff4fa3", glow: "tb-ring-overdue" },
  later:    { label: "LATER",   color: "#9d4dff", glow: null },
};

/* Curved connector paths (viewBox 0 0 390 56) */
const PATH_LEFT_TO_RIGHT = "M 74 0 C 74 30, 270 26, 270 56";
const PATH_RIGHT_TO_LEFT = "M 316 0 C 316 30, 120 26, 120 56";

function loadStored() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.tasks)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function getGreetingParts(hour) {
  if (hour < 5) return { word: "Buenas noches", emoji: "🌙" };
  if (hour < 12) return { word: "Buenos días", emoji: "☀️" };
  if (hour < 17) return { word: "Buenas tardes", emoji: "🌤️" };
  if (hour < 21) return { word: "Buenas tardes", emoji: "🌆" };
  return { word: "Buenas noches", emoji: "🌙" };
}

/* Parse "7am", "9:30am", "1pm", "12:30pm" → minutes since midnight (local). */
function parseTimeToMinutes(str) {
  if (!str) return null;
  const m = String(str).toLowerCase().replace(/\s+/g, "").match(/^(\d{1,2})(?::(\d{2}))?(am|pm)$/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const ap = m[3];
  if (ap === "am") { if (h === 12) h = 0; }
  else { if (h !== 12) h += 12; }
  return h * 60 + min;
}

function taskStatus(task, isDone, now) {
  if (isDone) return "done";
  if (!now) return "later"; // before client mount — no status pill
  const start = parseTimeToMinutes(task.startTime);
  const end = parseTimeToMinutes(task.endTime);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  if (start == null || end == null) return "later";
  if (nowMin >= start && nowMin <= end) return "active";
  if (nowMin < start && start - nowMin <= 60) return "soon";
  if (nowMin > end) return "overdue";
  return "later";
}

function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

function parseDayKey(key) {
  const [y, m, d] = String(key).split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dayDiff(aKey, bKey) {
  if (!aKey || !bKey) return Infinity;
  return Math.round((parseDayKey(bKey).getTime() - parseDayKey(aKey).getTime()) / 86400000);
}

function formatDateChip(d = new Date()) {
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${days[d.getDay()]} · ${months[d.getMonth()]} ${d.getDate()}`;
}

/* Web Audio sound effects — created lazily on first use (respects autoplay policies).
   Returns no-op if AudioContext is unavailable or sounds are disabled. */
let __audioCtx = null;
function getAudioCtx() {
  if (typeof window === "undefined") return null;
  if (!__audioCtx) {
    try { __audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch { __audioCtx = null; }
  }
  return __audioCtx;
}
function playTone(freq, duration = 0.12, type = "sine", volume = 0.08, when = 0) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(volume, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  } catch { /* ignore */ }
}
function playComplete() {
  playTone(660, 0.10, "triangle", 0.07, 0);
  playTone(880, 0.14, "triangle", 0.07, 0.08);
}
function playCelebrate() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => playTone(f, 0.16, "triangle", 0.08, i * 0.12));
}

function FlowerDoodle({ className = "" }) {
  return (
    <svg viewBox="0 0 64 80" className={className} fill="none" aria-hidden="true">
      <path d="M32 44 C 30 56, 34 66, 31 78" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 60 C 24 56, 17 60, 16 67 C 24 68, 31 66, 32 60 Z" fill="#4ade80" fillOpacity="0.85" stroke="#16a34a" strokeWidth="1.2" strokeLinejoin="round" />
      <g transform="translate(32 30)" stroke="#3b82f6" strokeWidth="2.2" fill="rgba(59,130,246,0.18)" strokeLinejoin="round">
        <g transform="rotate(0)"><path d="M0 0 C -8 -8, -8 -22, 0 -28 C 8 -22, 8 -8, 0 0 Z" /></g>
        <g transform="rotate(72)"><path d="M0 0 C -8 -8, -8 -22, 0 -28 C 8 -22, 8 -8, 0 0 Z" /></g>
        <g transform="rotate(144)"><path d="M0 0 C -8 -8, -8 -22, 0 -28 C 8 -22, 8 -8, 0 0 Z" /></g>
        <g transform="rotate(216)"><path d="M0 0 C -8 -8, -8 -22, 0 -28 C 8 -22, 8 -8, 0 0 Z" /></g>
        <g transform="rotate(288)"><path d="M0 0 C -8 -8, -8 -22, 0 -28 C 8 -22, 8 -8, 0 0 Z" /></g>
      </g>
      <circle cx="32" cy="30" r="7" fill="#ffe94a" stroke="#3b82f6" strokeWidth="2.2" />
      {/* kawaii smiley face on the flower center */}
      <ellipse cx="29.6" cy="28.8" rx="0.9" ry="1.25" fill="#1a1a2e" />
      <ellipse cx="34.4" cy="28.8" rx="0.9" ry="1.25" fill="#1a1a2e" />
      <circle cx="29.3" cy="28.4" r="0.3" fill="#fff" />
      <circle cx="34.1" cy="28.4" r="0.3" fill="#fff" />
      <path d="M29.4 31.2 Q32 33.6 34.6 31.2" stroke="#1a1a2e" strokeWidth="0.95" strokeLinecap="round" fill="none" />
      <circle cx="28.2" cy="31.6" r="0.85" fill="#ff4fa3" opacity="0.55" />
      <circle cx="35.8" cy="31.6" r="0.85" fill="#ff4fa3" opacity="0.55" />
    </svg>
  );
}

function GreetingDoodle({ emoji, className = "" }) {
  if (emoji === "☀️") {
    return (
      <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="8" fill="#ffe94a" />
        <g stroke="#ffe94a" strokeWidth="2.5" strokeLinecap="round">
          <path d="M24 6 L24 12" /><path d="M24 36 L24 42" /><path d="M6 24 L12 24" /><path d="M36 24 L42 24" />
          <path d="M11 11 L15 15" /><path d="M33 33 L37 37" /><path d="M37 11 L33 15" /><path d="M15 33 L11 37" />
        </g>
      </svg>
    );
  }
  if (emoji === "🌤️") {
    return (
      <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true">
        <circle cx="17" cy="17" r="6" fill="#ffe94a" />
        <path d="M14 34 a8 8 0 0 1 1-15.8 a10 10 0 0 1 18.4 3.2 a6.5 6.5 0 0 1 -1.4 12.6 z" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
  if (emoji === "🌆") {
    return (
      <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true">
        <path d="M4 34 H44" stroke="#ff8a3d" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M9 34 a9 9 0 0 1 30 0" fill="rgba(255,138,61,0.25)" stroke="#ff8a3d" strokeWidth="2" />
        <circle cx="24" cy="24" r="4" fill="#ffe94a" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true">
      <path d="M30 10 a16 16 0 1 0 8 22 a12 12 0 0 1 -8 -22 z" fill="rgba(157,77,255,0.25)" stroke="#9d4dff" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="13" cy="14" r="1.4" fill="#fff" /><circle cx="20" cy="9" r="1" fill="#fff" /><circle cx="9" cy="22" r="1" fill="#fff" />
    </svg>
  );
}

function BgDoodles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg className="absolute left-3 top-44 h-6 w-6 text-white/10" viewBox="0 0 24 24" fill="none">
        <path d="M12 2 L14 9 L22 9 L15.5 13.5 L18 21 L12 16.5 L6 21 L8.5 13.5 L2 9 L10 9 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <svg className="absolute right-2 top-72 h-16 w-16 text-white/[0.06]" viewBox="0 0 80 80" fill="none">
        <path d="M8 40 C 20 20, 40 60, 60 30 S 78 18, 76 40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 5" />
      </svg>
      <svg className="absolute left-4 top-[420px] h-5 w-5 text-[#ff4fa3]/30" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10z" />
      </svg>
      <svg className="absolute right-6 top-[600px] h-5 w-5 text-[#9d4dff]/30" viewBox="0 0 24 24" fill="none">
        <path d="M12 3 L13.5 9 L20 9 L14.5 13 L16 19 L12 15.5 L8 19 L9.5 13 L4 9 L10.5 9 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <svg className="absolute left-8 top-[820px] h-4 w-4 text-[#39ff14]/30" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="3" />
      </svg>
      <svg className="absolute right-4 top-[940px] h-14 w-14 text-white/[0.05]" viewBox="0 0 80 80" fill="none">
        <path d="M10 40 C 24 24, 44 56, 70 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 6" />
      </svg>
    </div>
  );
}

/* Hand-drawn dashed frame around the board with corner doodles */
function DoodleFrame() {
  return (
    <div className="pointer-events-none absolute inset-2 z-0" aria-hidden="true">
      <div className="absolute inset-0 rounded-2xl border border-dashed border-white/[0.07]" />
      <svg className="absolute -left-1 -top-1 h-5 w-5 text-[#ffe94a]/50" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1 L13 5 L17 4 L14 7 L17 10 L13 9 L12 13 L11 9 L7 10 L10 7 L7 4 L11 5 Z" /></svg>
      <svg className="absolute -right-1 -top-1 h-5 w-5 text-[#ff4fa3]/50" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4" /></svg>
      <svg className="absolute -left-1 -bottom-1 h-5 w-5 text-[#9d4dff]/50" viewBox="0 0 24 24" fill="none"><path d="M4 12 C 8 4, 16 20, 20 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
      <svg className="absolute -right-1 -bottom-1 h-5 w-5 text-[#39ff14]/50" viewBox="0 0 24 24" fill="none"><path d="M5 12 L9 16 L19 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </div>
  );
}

function ConnectorArrow({ index, leftToRight, animate }) {
  const path = leftToRight ? PATH_LEFT_TO_RIGHT : PATH_RIGHT_TO_LEFT;
  const markerId = `tb-arrow-${index}`;
  return (
    <svg className="pointer-events-none absolute left-0 right-0 top-full h-14 w-full" viewBox="0 0 390 56" fill="none" aria-hidden="true">
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#ff6b7a" fillOpacity="0.75" />
        </marker>
      </defs>
      <path d={path} stroke="#ff6b7a" strokeOpacity={animate ? "0.95" : "0.75"} strokeWidth="2" strokeDasharray="6 6" strokeLinecap="round" fill="none" markerEnd={`url(#${markerId})`} className={animate ? "tb-dash" : ""} />
    </svg>
  );
}

function ProgressRing({ done, total, size = 40 }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? done / total : 0;
  const offset = c * (1 - pct);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#39ff14" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.5s ease" }} />
      </svg>
      <span className="tb-themed-text absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ fontFamily: "var(--font-patrick-hand), cursive" }}>{done}/{total}</span>
    </div>
  );
}

const CONFETTI_PIECES = [
  { c: "#39ff14", x: 12, delay: 0, rot: 20 }, { c: "#ffe94a", x: 26, delay: 0.05, rot: -30 },
  { c: "#ff4fa3", x: 40, delay: 0.1, rot: 45 }, { c: "#9d4dff", x: 54, delay: 0.02, rot: -15 },
  { c: "#ff8a3d", x: 68, delay: 0.12, rot: 60 }, { c: "#3b82f6", x: 82, delay: 0.07, rot: -50 },
  { c: "#39ff14", x: 18, delay: 0.18, rot: 10, shape: "circle" }, { c: "#ffe94a", x: 32, delay: 0.22, rot: 0, shape: "circle" },
  { c: "#ff4fa3", x: 48, delay: 0.16, rot: 0, shape: "circle" }, { c: "#9d4dff", x: 62, delay: 0.26, rot: 0, shape: "circle" },
  { c: "#ff8a3d", x: 76, delay: 0.2, rot: 0, shape: "circle" }, { c: "#3b82f6", x: 90, delay: 0.3, rot: 0, shape: "circle" },
];

function Confetti({ show }) {
  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
      <div className="absolute left-1/2 top-[38%] -translate-x-1/2">
        {CONFETTI_PIECES.map((p, i) => (
          <span key={i} className="tb-confetti" style={{ left: `${p.x}%`, background: p.c, borderRadius: p.shape === "circle" ? "999px" : "2px", animationDelay: `${p.delay}s`, ["--rot"]: `${p.rot}deg` }} />
        ))}
      </div>
      {/* Group celebration image — bounces above the ¡Todo listo! stamp */}
      <div className="tb-char-bounce absolute left-1/2 top-[14%] -translate-x-1/2" style={{ width: "160px", maxWidth: "60vw" }}>
        { }
        <img
          src={GROUP_IMAGE}
          alt="Equipo celebrando"
          className="h-auto w-full"
          style={{ filter: "drop-shadow(0 0 14px rgba(255,233,74,0.55))" }}
          draggable={false}
        />
      </div>
      <div className="tb-pop-stamp absolute left-1/2 top-[44%] -translate-x-1/2 rounded-xl border-4 border-[#ffe94a] px-6 py-3 text-center" style={{ background: "rgba(11,11,12,0.85)" }}>
        <div className="flex items-center gap-2 text-2xl font-bold text-[#ffe94a]" style={{ fontFamily: "var(--font-patrick-hand), cursive" }}>
          <PartyPopper size={22} /> ¡Todo listo!
        </div>
        <div className="mt-0.5 text-[12px] text-white/60" style={{ fontFamily: "var(--font-caveat), cursive", fontSize: "16px" }}>¡limpiaste todo el día! ✨</div>
      </div>
    </div>
  );
}

/* Long-press hook: opens the action menu on touch-hold; suppresses the click that follows.
   Owns the click handler so the suppress flag stays encapsulated (no ref mutation outside). */
function useLongPress(onLongPress, onTap, { delay = 500, moveThreshold = 10 } = {}) {
  const timerRef = useRef(null);
  const startRef = useRef({ x: 0, y: 0 });
  const suppressClickRef = useRef(false);

  const cancel = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const onPointerDown = useCallback((e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    suppressClickRef.current = false;
    startRef.current = { x: e.clientX, y: e.clientY };
    timerRef.current = setTimeout(() => {
      suppressClickRef.current = true;
      onLongPress();
    }, delay);
  }, [delay, onLongPress]);

  const onPointerMove = useCallback((e) => {
    if (!timerRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    if (Math.hypot(dx, dy) > moveThreshold) cancel();
  }, [moveThreshold, cancel]);

  const onPointerUp = useCallback(() => { cancel(); }, [cancel]);
  const onPointerCancel = useCallback(() => { cancel(); }, [cancel]);
  const onContextMenu = useCallback((e) => { e.preventDefault(); onLongPress(); }, [onLongPress]);

  const onClick = useCallback(() => {
    if (suppressClickRef.current) { suppressClickRef.current = false; return; }
    onTap();
  }, [onTap]);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onContextMenu, onClick };
}

/* A horizontal línea temporal del día showing where tasks fall (6am→10pm) with a "now" marker. */
function DayTimeline({ tasks, completedIds, now, onJumpTask }) {
  const START = 6 * 60;  // 6am
  const END = 22 * 60;    // 10pm
  const SPAN = END - START;
  const nowMin = now ? now.getHours() * 60 + now.getMinutes() : null;
  const nowPct = nowMin != null && nowMin >= START && nowMin <= END ? ((nowMin - START) / SPAN) * 100 : null;

  // hour ticks every 2h
  const ticks = [];
  for (let h = 6; h <= 22; h += 2) {
    const pct = ((h * 60 - START) / SPAN) * 100;
    ticks.push({ h, pct });
  }

  // task blocks
  const blocks = tasks
    .map((t) => {
      const s = parseTimeToMinutes(t.startTime);
      const e = parseTimeToMinutes(t.endTime);
      if (s == null || e == null) return null;
      const left = Math.max(0, ((s - START) / SPAN) * 100);
      const right = Math.min(100, ((e - START) / SPAN) * 100);
      return { task: t, left, width: Math.max(3, right - left), done: completedIds.has(t.id) };
    })
    .filter(Boolean);

  return (
    <div className="mb-4 min-w-0 px-4">
      <div className="mb-1 flex min-w-0 items-center justify-between gap-2">
        <span className="inline-flex min-w-0 shrink-0 items-center gap-1 text-[11px] font-semibold tb-themed-muted" style={{ fontFamily: "var(--font-patrick-hand), cursive", fontSize: "14px" }}>
          <Timer size={12} /> línea temporal del día
        </span>
        {nowPct != null && (
          <span className="ml-2 shrink-0 text-[10px] tb-themed-muted">
            ahora {now.getHours()}:{String(now.getMinutes()).padStart(2, "0")}
          </span>
        )}
      </div>
      <div className="relative h-8 rounded-lg border border-white/10 bg-white/[0.03]">
        {/* hour ticks */}
        {ticks.map((tk) => (
          <div key={tk.h} className="absolute top-0 bottom-0 w-px bg-white/8" style={{ left: `${tk.pct}%` }}>
            <span className="absolute -top-0.5 left-1 text-[8px] text-white/25">{tk.h <= 12 ? `${tk.h}a` : `${tk.h - 12}p`}</span>
          </div>
        ))}
        {/* task blocks */}
        {blocks.map((b) => (
          <button
            key={b.task.id}
            type="button"
            onClick={() => onJumpTask(b.task)}
            title={`${b.task.emoji} ${b.task.title} · ${b.task.startTime}`}
            className="absolute top-1.5 bottom-1.5 overflow-hidden rounded-sm transition-opacity hover:opacity-80"
            style={{
              left: `${b.left}%`,
              width: `${b.width}%`,
              background: b.task.color,
              opacity: b.done ? 0.3 : 0.85,
            }}
          >
            <span className="block truncate px-0.5 text-center text-[8px] leading-tight text-[#0b0b0c]" style={{ fontFamily: "var(--font-patrick-hand), cursive" }}>
              {b.task.emoji}
            </span>
          </button>
        ))}
        {/* now marker */}
        {nowPct != null && (
          <div className="pointer-events-none absolute top-0 bottom-0 z-10 w-0.5 bg-[#ffe94a]" style={{ left: `${nowPct}%` }}>
            <CircleDot size={10} className="absolute -top-1 left-1/2 -translate-x-1/2 text-[#ffe94a]" />
          </div>
        )}
      </div>
    </div>
  );
}

/* A single sticky-note card. Extracted so it can own its long-press state. */
function StickyNote({
  task, index, isDone, isNextUp, status, now,
  onToggle, onEdit, onEliminar, onOpenActions, onMoveUp, onMoveDown, canUp, canDown, onToggleSubtask,
}) {
  const openMenu = useCallback(() => onOpenActions(task), [onOpenActions, task]);
  const toggle = useCallback(() => onToggle(task), [onToggle, task]);
  const lp = useLongPress(openMenu, toggle);

  const statusMeta = STATUS_META[status] || STATUS_META.later;
  const ringClass = !isDone && statusMeta.glow ? statusMeta.glow : "";

  return (
    <div className="tb-card-anim group" style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}>
      <button
        type="button"
        onClick={lp.onClick}
        onPointerDown={lp.onPointerDown}
        onPointerMove={lp.onPointerMove}
        onPointerUp={lp.onPointerUp}
        onPointerCancel={lp.onPointerCancel}
        onContextMenu={lp.onContextMenu}
        aria-label={isDone ? `Marcar «${task.title}» como no hecha` : `Marcar «${task.title}» como hecha`}
        className={`tb-note-btn tb-paper relative block w-full rounded-2xl p-[14px] text-left text-[#111] ${ringClass} ${isNextUp ? "tb-nextup" : ""}`}
        style={{
          background: task.color,
          transform: `rotate(${task.rotation}deg)`,
          boxShadow: "4px 5px 0 rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.35)",
          fontFamily: "var(--font-patrick-hand), cursive",
          opacity: isDone ? 0.55 : 1,
          touchAction: "manipulation",
        }}
      >
        {/* crumpled paper texture overlay (subtle bumps + valleys + crease lines) */}
        <span aria-hidden="true" className="tb-paper-texture" />
        {/* status accent strip (top) */}
        {!isDone && (
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] rounded-t-[4px]" style={{ background: statusMeta.color, opacity: status === "later" ? 0.45 : 0.95 }} />
        )}
        {/* washi tape */}
        <span aria-hidden="true" className="pointer-events-none absolute -top-2 left-1/2 h-4 w-16 -translate-x-1/2 rotate-[-4deg] opacity-80" style={{ background: "repeating-linear-gradient(135deg, rgba(255,255,255,0.55) 0 6px, rgba(255,255,255,0.25) 6px 12px)", borderRadius: "2px", boxShadow: "0 1px 2px rgba(0,0,0,0.25)" }} />
        {/* corner fold */}
        <span aria-hidden="true" className="tb-corner-fold" />

        {/* done stamp */}
        {isDone && (
          <span aria-hidden="true" className="tb-stamp pointer-events-none absolute -right-2 top-6 z-[3] select-none" style={{ color: "#0b0b0c", border: "3px double #0b0b0c", borderRadius: "4px", padding: "1px 6px", fontFamily: "var(--font-patrick-hand), cursive", fontWeight: 700, fontSize: "13px", letterSpacing: "1px", transform: "rotate(-8deg)", background: "rgba(255,255,255,0.25)" }}>DONE</span>
        )}

        {/* content wrapper — lifted above the paper texture (z-[2]) */}
        <div className="relative z-[2]">
          {/* emoji + check */}
          <div className="flex items-start justify-between">
            <span className="text-2xl leading-none">{task.emoji}</span>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${isDone ? "border-[#0b0b0c] bg-[#0b0b0c] text-[#39ff14]" : "border-[#0b0b0c]/40 text-transparent"}`}>
              <Check size={12} strokeWidth={3.5} />
            </span>
          </div>

          {/* title */}
          <h3 className="mt-2 line-clamp-2 min-w-0 overflow-hidden text-[16px] font-normal leading-snug" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textDecoration: isDone ? "line-through" : "none", textDecorationThickness: "2px" }}>{task.title}</h3>

          {/* pills: time, duration, status, tag */}
          <div className="mt-3 flex min-w-0 flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium" style={{ background: "rgba(17,17,17,0.85)", color: "#fff" }}>
              <Clock size={11} strokeWidth={2.5} />{task.startTime} - {task.endTime}
            </span>
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium" style={{ background: "rgba(17,17,17,0.85)", color: "#fff" }}>en {task.duration}min</span>
            {!isDone && status !== "later" && (
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: statusMeta.color, color: "#0b0b0c" }}>{statusMeta.label}</span>
            )}
            {task.tag && TAG_MAP[task.tag] && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "rgba(255,255,255,0.9)", color: TAG_MAP[task.tag].color, border: `1px solid ${TAG_MAP[task.tag].color}40` }}>
                <Tag size={9} />{TAG_MAP[task.tag].label}
              </span>
            )}
            {task.priority && PRIORITY_MAP[task.priority] && (
              <span className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold" style={{ background: PRIORITY_MAP[task.priority].color, color: "#0b0b0c" }}>
                {PRIORITY_MAP[task.priority].label}
              </span>
            )}
            {task.recurrence && task.recurrence !== "none" && RECURRENCE_MAP[task.recurrence] && (
              <span className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold" style={{ background: `${RECURRENCE_MAP[task.recurrence].color}25`, color: RECURRENCE_MAP[task.recurrence].color, border: `1px solid ${RECURRENCE_MAP[task.recurrence].color}60` }} title={`Se repite ${RECURRENCE_MAP[task.recurrence].label.toLowerCase()}`}>
                <Repeat size={8} />{RECURRENCE_MAP[task.recurrence].label}
              </span>
            )}
          </div>

          {/* subtask checklist + progress */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="mt-2.5 rounded-md bg-black/15 p-2">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#0b0b0c]/70">
                  <ListChecks size={11} /> checklist
                </span>
                <span className="text-[10px] font-bold text-[#0b0b0c]/60">
                  {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length}
                </span>
              </div>
              {/* mini progress bar */}
              <div className="mb-2 h-1 overflow-hidden rounded-full bg-black/20">
                <div className="h-full rounded-full bg-[#0b0b0c] transition-all" style={{ width: `${(task.subtasks.filter((s) => s.done).length / task.subtasks.length) * 100}%` }} />
              </div>
              <div className="flex flex-col gap-1">
                {task.subtasks.map((s) => (
                  <div
                    key={s.id}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); onToggleSubtask(task.id, s.id); }}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onToggleSubtask(task.id, s.id); } }}
                    className="flex min-w-0 cursor-pointer items-start gap-1.5 text-left text-[12px] leading-tight text-[#0b0b0c]/85 transition-opacity hover:opacity-80"
                    style={{ fontFamily: "var(--font-patrick-hand), cursive", fontSize: "13px" }}
                  >
                    {s.done ? <CheckSquare size={12} className="mt-0.5 shrink-0 text-[#0b0b0c]" /> : <Square size={12} className="mt-0.5 shrink-0 text-[#0b0b0c]/50" />}
                    <span style={{ textDecoration: s.done ? "line-through" : "none", opacity: s.done ? 0.55 : 1 }}>{s.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* "more" affordance — visible on touch too, opens action menu */}
        <span aria-hidden="true" className="pointer-events-none absolute bottom-1.5 right-2 z-[3] flex h-6 w-6 items-center justify-center rounded-full bg-black/20 text-white/70 opacity-70 transition-opacity group-hover:opacity-100">
          <MoreHorizontal size={14} />
        </span>
      </button>

      {/* desktop hover quick actions */}
      <div className="pointer-events-none absolute -top-3 right-2 flex gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
        <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(task); }} aria-label={`Editar «${task.title}»`} className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-neutral-900/90 text-white/80 backdrop-blur transition-colors hover:bg-[#2563eb] hover:text-white"><Pencil size={13} /></button>
        <button type="button" onClick={(e) => { e.stopPropagation(); onEliminar(task); }} aria-label={`Eliminar “${task.title}”`} className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-neutral-900/90 text-white/80 backdrop-blur transition-colors hover:bg-[#ff4fa3] hover:text-white"><Trash2 size={13} /></button>
      </div>
    </div>
  );
}

export default function TaskBoard({ name = "Bea", tasks = MOCK_TASKS }) {
  const { toast } = useToast();

  // hydration via lazy initializers — BUT all localStorage-backed state must start with
  // SSR-safe defaults (null/empty) and hydrate after mount to avoid hydration mismatch.
  // (SSR can't read localStorage; client first render must match SSR.)
  const [taskList, setTaskList] = useState(tasks);
  const [completedIds, setCompletedIds] = useState(() => new Set());
  const [streak, setStreak] = useState(0);
  const [lastClearedDate, setLastClearedDate] = useState(null);

  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [nextUpId, setNextUpId] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [actionTaskId, setActionTaskId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [sortByPriority, setSortByPriority] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [vapidKey, setVapidKey] = useState(null);
  const push = usePushNotifications(vapidKey || undefined);
  // Carga la VAPID public key al montar
  useEffect(() => {
    fetch("/api/push/vapid-key").then((r) => r.json()).then((d) => { if (d.publicKey) setVapidKey(d.publicKey); }).catch(() => {});
  }, []);
  const [tomorrowExpanded, setTomorrowExpanded] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState({ name: name, avatar: "🙂", avatarColor: "#3b82f6" });
  const [draftProfileName, setDraftProfileName] = useState("");
  const [draftProfileAvatar, setDraftProfileAvatar] = useState("🙂");
  const [draftProfileColor, setDraftProfileColor] = useState("#3b82f6");

  // time-dependent state — null on SSR + first client render (avoids hydration mismatch),
  // then set to real values in a mount effect. Derived values use null-safe fallbacks.
  const [now, setNow] = useState(null);
  const greeting = now ? getGreetingParts(now.getHours()) : { word: "Hola", emoji: "☀️" };
  const today = now ? formatDateChip(now) : "";

  // Bleach system state
  const [bleachDialogue, setBleachDialogue] = useState(null);
  const [bleachAchievement, setBleachAchievement] = useState(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);

  function showBleachDialogue(context) {
    setBleachDialogue(pickDialogue(context));
  }

  function unlockAchievement(achId) {
    setUnlockedAchievements((prev) => {
      if (prev.includes(achId)) return prev;
      const ach = ACHIEVEMENTS.find((a) => a.id === achId);
      if (ach) {
        setBleachAchievement(ach);
        if (soundEnabled) { playAchievementSound(ach.tier); playWowSound(); }
        // also show a dialogue
        setTimeout(() => setBleachDialogue(pickDialogue("achievement")), 600);
      }
      return [...prev, achId];
    });
  }

  // form state
  const [draftTitle, setDraftTitle] = useState("");
  const [draftEmoji, setDraftEmoji] = useState(EMOJI_CHOICES[0]);
  const [draftStart, setDraftStart] = useState("9am");
  const [draftEnd, setDraftEnd] = useState("9:30am");
  const [draftDuration, setDraftDuration] = useState(30);
  const [draftTag, setDraftTag] = useState("work");
  const [draftPriority, setDraftPriority] = useState(2);
  const [draftRecurrence, setDraftRecurrence] = useState("none");

  // hydrate flag — evita que el persist effect sobreescriba localStorage antes de hidratar
  const hydratedRef = useRef(false);

  // persist (allowed external-sync effect) — solo después de hidratar
  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ tasks: taskList, completedIds: [...completedIds], streak, lastClearedDate, theme, soundEnabled, profile })
      );
    } catch { /* ignore */ }
  }, [taskList, completedIds, streak, lastClearedDate, theme, soundEnabled, profile]);

  // hydrate client-only state after mount (avoids SSR/CSR hydration mismatch).
  // Reads ALL localStorage-backed state here so the first client render matches SSR.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const s = loadStored();
    if (s) {
      if (Array.isArray(s.tasks)) setTaskList(s.tasks);
      if (Array.isArray(s.completedIds)) setCompletedIds(new Set(s.completedIds));
      if (typeof s.streak === "number") setStreak(s.streak);
      if (s.lastClearedDate) setLastClearedDate(s.lastClearedDate);
      if (s.theme) setTheme(s.theme);
      if (typeof s.soundEnabled === "boolean") setSoundEnabled(s.soundEnabled);
      if (s.profile) setProfile(s.profile);
    }
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 60000);
    hydratedRef.current = true;
    return () => window.clearInterval(id);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // sync theme to <html> so body background can be themed via CSS
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("tb-theme-light", "tb-theme-dark");
    root.classList.add(`tb-theme-${theme}`);
  }, [theme]);

  const total = taskList.length;
  const doneCount = completedIds.size;
  const remaining = total - doneCount;

  // display name: profile name if set, else the prop default
  const displayName = (profile?.name || "").trim() || name;

  // status breakdown for the header summary
  const statusCounts = useMemo(() => {
    const counts = { active: 0, soon: 0, overdue: 0, later: 0 };
    for (const t of taskList) {
      if (completedIds.has(t.id)) continue;
      const s = taskStatus(t, false, now);
      if (counts[s] != null) counts[s] += 1;
    }
    return counts;
  }, [taskList, completedIds, now]);

  // total minutes still en el tablero (non-done tasks)
  const totalDeckMinutes = useMemo(() => {
    return taskList.reduce((sum, t) => (completedIds.has(t.id) ? sum : sum + (t.duration || 0)), 0);
  }, [taskList, completedIds]);

  function formatDuración(mins) {
    if (mins <= 0) return "0m";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }

  // weekly stats: completion rate, total time, tasks by priority, by tag
  const stats = useMemo(() => {
    const total = taskList.length;
    const done = completedIds.size;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
    const totalMinutes = taskList.reduce((s, t) => s + (t.duration || 0), 0);
    const doneMinutes = taskList.reduce((s, t) => (completedIds.has(t.id) ? s + (t.duration || 0) : s), 0);
    const byPriority = PRIORITIES.map((p) => ({
      ...p,
      total: taskList.filter((t) => (t.priority || 3) === p.id).length,
      done: taskList.filter((t) => (t.priority || 3) === p.id && completedIds.has(t.id)).length,
    }));
    const byTag = TAGS.map((t) => ({
      ...t,
      total: taskList.filter((x) => x.tag === t.id).length,
      done: taskList.filter((x) => x.tag === t.id && completedIds.has(x.id)).length,
    })).filter((t) => t.total > 0);
    return { total, done, completionRate, totalMinutes, doneMinutes, byPriority, byTag };
  }, [taskList, completedIds]);

  const visibleTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = taskList.filter((t) => {
      const isDone = completedIds.has(t.id);
      if (filter === "active") return !isDone;
      if (filter === "done") return isDone;
      if (filter === "quick") return t.duration <= 30;
      return true;
    }).filter((t) => activeTag === "all" ? true : t.tag === activeTag)
      .filter((t) => {
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.emoji.includes(q) ||
        t.startTime.toLowerCase().includes(q) ||
        t.endTime.toLowerCase().includes(q)
      );
    });
    if (sortByPriority) {
      return [...filtered].sort((a, b) => (a.priority || 3) - (b.priority || 3));
    }
    return filtered;
  }, [taskList, completedIds, filter, searchQuery, activeTag, sortByPriority]);

  // agenda grouping: Morning / Afternoon / Evening — only when no sort/filter/search active
  const agendaGroups = useMemo(() => {
    if (sortByPriority || filter !== "all" || searchQuery) return null;
    const groups = { morning: [], afternoon: [], evening: [] };
    for (const t of visibleTasks) {
      const start = parseTimeToMinutes(t.startTime);
      if (start == null) { groups.afternoon.push(t); continue; }
      if (start < 12 * 60) groups.morning.push(t);
      else if (start < 17 * 60) groups.afternoon.push(t);
      else groups.evening.push(t);
    }
    const out = [];
    if (groups.morning.length) out.push({ id: "morning", label: "Mañana", icon: Sunrise, color: "#ffe94a", tasks: groups.morning });
    if (groups.afternoon.length) out.push({ id: "afternoon", label: "Tarde", icon: Coffee, color: "#ff8a3d", tasks: groups.afternoon });
    if (groups.evening.length) out.push({ id: "evening", label: "Noche", icon: MoonStar, color: "#9d4dff", tasks: groups.evening });
    return out.length > 0 ? out : null;
  }, [visibleTasks, sortByPriority, filter, searchQuery]);

  const actionTask = useMemo(
    () => taskList.find((t) => t.id === actionTaskId) || null,
    [taskList, actionTaskId]
  );

  // "Tomorrow peek" — the last few tasks of the day that will likely roll into tomorrow,
  // i.e. incomplete tasks scheduled in the evening (after 6pm) or P1 tasks still pending.
  const tomorrowPeek = useMemo(() => {
    return taskList.filter((t) => {
      if (completedIds.has(t.id)) return false;
      const start = parseTimeToMinutes(t.startTime);
      const evening = start != null && start >= 18 * 60; // 6pm+
      const p1 = (t.priority || 3) === 1;
      return evening || p1;
    }).slice(0, 4);
  }, [taskList, completedIds]);

  function fireConfetti() {
    setShowConfetti(true);
    window.setTimeout(() => setShowConfetti(false), 3200);
  }

  // undo: push a snapshot of (taskList, completedIds) before a mutating action
  function pushUndo(label) {
    setUndoStack((prev) => [...prev.slice(-19), {
      tasks: taskList.map((t) => ({ ...t })),
      completedIds: new Set(completedIds),
      label: label || "Acción",
    }]);
  }

  function undo() {
    setUndoStack((prev) => {
      if (prev.length === 0) {
        toast({ title: "Nada que deshacer", description: "Estás al día." });
        return prev;
      }
      const snapshot = prev[prev.length - 1];
      setTaskList(snapshot.tasks);
      setCompletedIds(snapshot.completedIds);
      toast({ title: "Deshecho ↩️", description: snapshot.label });
      return prev.slice(0, -1);
    });
  }

  function toggleComplete(task) {
    const { id, title } = task;
    const isCurrentlyDone = completedIds.has(id);
    pushUndo(isCurrentlyDone ? `Desmarcar «${title}»` : `Completar «${title}»`);
    const next = new Set(completedIds);
    if (isCurrentlyDone) {
      next.delete(id);
      toast({ title: "De vuelta a la lista ✏️", description: title });
      showBleachDialogue("fail");
      if (soundEnabled) playFailSound();
      // Healer achievement (uncomplete = correct)
      unlockAchievement("healer");
    } else {
      next.add(id);
      toast({ title: "¡Bien hecho! 🎉", description: `«${title}» completada.` });
      showBleachDialogue("complete");
      if (soundEnabled) playCompleteSound();
      // first blood achievement
      if (next.size === 1) unlockAchievement("first_blood");
      // shinigami (5 tasks)
      if (next.size === 5) unlockAchievement("shinigami");
    }
    setCompletedIds(next);
    if (nextUpId === id) setNextUpId(null);

    const wasAllDone = completedIds.size === total && total > 0;
    const nowAllDone = next.size === total && total > 0;
    if (!wasAllDone && nowAllDone) {
      fireConfetti();
      if (soundEnabled) playCelebrate();
      showBleachDialogue("all_done");
      unlockAchievement("bankai");
      // streak update
      const today = todayKey();
      if (lastClearedDate !== today) {
        const cont = lastClearedDate && dayDiff(lastClearedDate, today) === 1;
        const newStreak = cont ? streak + 1 : 1;
        setStreak(newStreak);
        setLastClearedDate(today);
        if (newStreak >= 3) { unlockAchievement("streak_3"); showBleachDialogue("streak"); }
        if (newStreak >= 7) unlockAchievement("streak_7");
        window.setTimeout(
          () => toast({ title: `¡Racha de ${newStreak} días! 🔥`, description: "Has vuelto a limpiar el tablero." }),
          900
        );
      }
      window.setTimeout(
        () => toast({ title: "¡Todo listo! 🌟", description: "Has completado el día." }),
        650
      );
    }
  }

  function openAdd() {
    setEditingId(null);
    setDraftTitle(""); setDraftEmoji(EMOJI_CHOICES[0]); setDraftStart("9am"); setDraftEnd("9:30am"); setDraftDuration(30); setDraftTag("work"); setDraftPriority(2); setDraftRecurrence("none");
    setAddOpen(true);
  }

  function openEdit(task) {
    setEditingId(task.id);
    setDraftTitle(task.title); setDraftEmoji(task.emoji); setDraftStart(task.startTime); setDraftEnd(task.endTime); setDraftDuration(task.duration); setDraftTag(task.tag || "work"); setDraftPriority(task.priority || 2); setDraftRecurrence(task.recurrence || "none");
    setAddOpen(true);
  }

  function openActions(task) {
    setActionTaskId(task.id);
  }

  function cloneTask(task) {
    pushUndo(`Duplicar “${task.title}”`);
    const color = NEON_COLORS[taskList.length % NEON_COLORS.length];
    const rotation = Math.round(Math.random() * 6 - 3);
    const clone = {
      ...task,
      id: Date.now(),
      color,
      rotation,
      title: task.title.replace(/\s*\(copy\)\s*$/, "").trim() + " (copia)",
    };
    setTaskList((prev) => {
      const idx = prev.findIndex((t) => t.id === task.id);
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      return next;
    });
    setActionTaskId(null);
    toast({ title: "Duplicado 📋", description: `«${clone.title}» añadido debajo del original.` }); showBleachDialogue("add");
  }

  function buildExportText() {
    const lines = [`📋 Tablero de ${displayName} — ${today}`, ""];
    if (taskList.length === 0) {
      lines.push("(aún no hay tareas)");
      return lines.join("\n");
    }
    taskList.forEach((t, i) => {
      const mark = completedIds.has(t.id) ? "[x]" : "[ ]";
      lines.push(`${mark} ${i + 1}. ${t.emoji} ${t.title}`);
      lines.push(`     ${t.startTime} – ${t.endTime} · ${t.duration}min`);
    });
    lines.push("");
    lines.push(`${doneCount}/${total} hechas · ${remaining} por hacer`);
    return lines.join("\n");
  }

  async function exportTasks() {
    const text = buildExportText();
    try {
      if (navigator.share) {
        await navigator.share({ title: "Mi tablero de tareas", text });
        return;
      }
    } catch {
      /* user cancelled or share failed — fall through to clipboard */
    }
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copiado al portapapeles 📋", description: `${taskList.length} tareas listas para pegar.` });
    } catch {
      // fallback: surface the text in a toast so it's still usable
      toast({ title: "No se pudo copiar", description: "Tu navegador bloqueó el acceso al portapapeles." });
    }
  }

  function openProfile() {
    setDraftProfileName(profile?.name || "");
    setDraftProfileAvatar(profile?.avatar || "🙂");
    setDraftProfileColor(profile?.avatarColor || "#3b82f6");
    setProfileOpen(true);
  }

  function saveProfile() {
    const trimmed = draftProfileName.trim();
    if (!trimmed) {
      toast({ title: "Espera ✋", description: "Tu nombre no puede estar vacío." });
      return;
    }
    setProfile({ name: trimmed, avatar: draftProfileAvatar, avatarColor: draftProfileColor });
    setProfileOpen(false);
    toast({ title: "Perfil guardado ✨", description: `¡Qué guapo, ${trimmed}!` });
  }

  function handleSave() {
    const trimmed = draftTitle.trim();
    if (!trimmed) { toast({ title: "Espera ✋", description: "Dale un título a tu tarea." }); return; }
    if (editingId) {
      pushUndo(`Editar «${trimmed}»`);
      setTaskList((prev) => prev.map((t) => t.id === editingId ? { ...t, title: trimmed, emoji: draftEmoji, startTime: draftStart.trim() || "9am", endTime: draftEnd.trim() || "9:30am", duration: Number(draftDuration) || 30, tag: draftTag, priority: draftPriority, recurrence: draftRecurrence } : t));
      toast({ title: "Guardado ✏️", description: `«${trimmed}» actualizada.` }); showBleachDialogue("save");
    } else {
      pushUndo(`Añadir «${trimmed}»`);
      const color = NEON_COLORS[taskList.length % NEON_COLORS.length];
      const rotation = Math.round(Math.random() * 6 - 3);
      setTaskList((prev) => [...prev, { id: Date.now(), title: trimmed, emoji: draftEmoji, color, startTime: draftStart.trim() || "9am", endTime: draftEnd.trim() || "9:30am", duration: Number(draftDuration) || 30, rotation, tag: draftTag, priority: draftPriority, recurrence: draftRecurrence, subtasks: [] }]);
      toast({ title: "Tarea añadida ✨", description: `«${trimmed}» en el tablero.` }); showBleachDialogue("add"); if (taskList.length + 1 >= 10) unlockAchievement("archer");
    }
    setAddOpen(false); setEditingId(null);
  }

  function handleEliminar(task) {
    const { id, title } = task;
    pushUndo(`Eliminar “${title}”`);
    setTaskList((prev) => prev.filter((t) => t.id !== id));
    setCompletedIds((prev) => { if (!prev.has(id)) return prev; const n = new Set(prev); n.delete(id); return n; });
    if (nextUpId === id) setNextUpId(null);
    if (actionTaskId === id) setActionTaskId(null);
    toast({ title: "Eliminada 🗑️", description: `«${title}» quitada del tablero.`, action: <ToastAction altText="Deshacer" onClick={() => undo()}>Deshacer</ToastAction> });
  }

  function moveTask(task, dir) {
    pushUndo("Reordenar");
    setTaskList((prev) => {
      const idx = prev.findIndex((t) => t.id === task.id);
      if (idx === -1) return prev;
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  function toggleSubtask(taskId, subId) {
    setTaskList((prev) => prev.map((t) => {
      if (t.id !== taskId || !t.subtasks) return t;
      return { ...t, subtasks: t.subtasks.map((s) => s.id === subId ? { ...s, done: !s.done } : s) };
    }));
  }

  function clearDone() {
    const doneArr = taskList.filter((t) => completedIds.has(t.id));
    if (doneArr.length === 0) { toast({ title: "Nada que limpiar 🧘", description: "Aún no hay tareas completadas." }); return; }
    pushUndo(`Limpiar ${doneArr.length} completadas`);
    setTaskList((prev) => prev.filter((t) => !completedIds.has(t.id)));
    setCompletedIds(new Set());
    setFilterOpen(false);
    toast({ title: "Barrido 🧹", description: `Limpiadas ${doneArr.length} tarea${doneArr.length === 1 ? "" : "s"} completada${doneArr.length === 1 ? "" : "s"}.` });
  }

  function resetDemo() {
    setTaskList(MOCK_TASKS.map((t) => ({ ...t })));
    setCompletedIds(new Set());
    setNextUpId(null);
    setFilter("all");
    setSearchQuery("");
    setActiveTag("all");
    setSortByPriority(false);
    setFocusMode(false);
    setFilterOpen(false);
    setResetConfirmOpen(false);
    toast({ title: "Reiniciado ↺", description: "Vuelta al tablero de demostración." });
  }

  function toggleTheme() {
    setTheme((t) => t === "dark" ? "light" : "dark");
  }

  function toggleSound() {
    setSoundEnabled((s) => {
      const next = !s;
      if (next) {
        // resume audio context on user gesture + play a test blip
        const ctx = getAudioCtx();
        if (ctx && ctx.state === "suspended") ctx.resume();
        playTone(880, 0.08, "triangle", 0.06, 0);
      }
      return next;
    });
  }

  function toggleSortByPriority() {
    setSortByPriority((s) => !s);
    toast({ title: sortByPriority ? "Orden original" : "Ordenado por prioridad", description: sortByPriority ? "De vuelta a tu orden personalizado." : "Las tareas P1 suben arriba." });
  }

  function toggleFocusMode() {
    if (focusMode) { setFocusMode(false); return; }
    const next = taskList.find((t) => !completedIds.has(t.id));
    if (!next) { toast({ title: "Bandeja vacía 🧘", description: "Nada en qué enfocarse." }); return; }
    setNextUpId(next.id);
    setFocusMode(true);
    unlockAchievement("focus_master");
  }

  // the task currently in focus (next-up or first incomplete)
  const focusTask = useMemo(() => {
    if (nextUpId) {
      const t = taskList.find((x) => x.id === nextUpId);
      if (t && !completedIds.has(t.id)) return t;
    }
    return taskList.find((t) => !completedIds.has(t.id)) || null;
  }, [taskList, completedIds, nextUpId]);

  function jumpToNextUp() {
    const next = taskList.find((t) => !completedIds.has(t.id));
    if (!next) { toast({ title: "Bandeja vacía 🧘", description: "No queda nada para hoy." }); return; }
    setNextUpId(next.id);
    if (filter !== "all" && filter !== "active") setFilter("all");
    setTimeout(() => { const el = document.getElementById(`task-${next.id}`); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); }, 60);
    toast({ title: "Siguiente ⏰", description: `«${next.title}»` });
  }

  function shuffleRotations() {
    setTaskList((prev) => prev.map((t) => ({ ...t, rotation: Math.round(Math.random() * 6 - 3) })));
    toast({ title: "Mezclado 🎲", description: "Nuevos ángulos para cada nota." });
  }

  function jumpTask(dir) {
    const candidates = taskList.filter((t) => !completedIds.has(t.id));
    if (candidates.length === 0) { toast({ title: "Bandeja vacía 🧘", description: "No queda nada para hoy." }); return; }
    const currentIdx = nextUpId ? candidates.findIndex((t) => t.id === nextUpId) : -1;
    let nextIdx;
    if (currentIdx === -1) nextIdx = dir > 0 ? 0 : candidates.length - 1;
    else nextIdx = (currentIdx + dir + candidates.length) % candidates.length;
    const target = candidates[nextIdx];
    setNextUpId(target.id);
    if (filter !== "all" && filter !== "active") setFilter("all");
    setTimeout(() => { const el = document.getElementById(`task-${target.id}`); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); }, 60);
  }

  // keyboard shortcuts — uses a ref so the listener always calls the latest callbacks
  const shortcutsRef = useRef(null);
  useEffect(() => {
    shortcutsRef.current = { openAdd, shuffleRotations, jumpTask, setFilterOpen, setShortcutsOpen, toggleFocusMode, toggleTheme, undo };
  });
  useEffect(() => {
    function onKey(e) {
      // Ctrl/Cmd+Z = undo (works even in inputs)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        shortcutsRef.current?.undo();
        return;
      }
      const tag = (e.target?.tagName || "").toLowerCase();
      const typing = tag === "input" || tag === "textarea" || e.target?.isContentEditable;
      const anySheet = document.querySelector("[data-slot='sheet-content'], [role='alertdialog']");
      if (typing || anySheet) {
        if (e.key === "Escape") { setShortcutsOpen(false); setFocusMode(false); }
        return;
      }
      const fn = shortcutsRef.current;
      if (!fn) return;
      // when focus mode is active, only F and Esc can exit
      if (focusMode) {
        if (e.key.toLowerCase() === "f" || e.key === "Escape") { e.preventDefault(); setFocusMode(false); }
        return;
      }
      if (e.key === "/") { e.preventDefault(); fn.setFilterOpen(true); }
      else if (e.key.toLowerCase() === "n") { e.preventDefault(); fn.openAdd(); }
      else if (e.key.toLowerCase() === "j") { e.preventDefault(); fn.jumpTask(1); }
      else if (e.key.toLowerCase() === "k") { e.preventDefault(); fn.jumpTask(-1); }
      else if (e.key.toLowerCase() === "s") { e.preventDefault(); fn.shuffleRotations(); }
      else if (e.key.toLowerCase() === "f") { e.preventDefault(); fn.toggleFocusMode(); }
      else if (e.key.toLowerCase() === "t") { e.preventDefault(); fn.toggleTheme(); }
      else if (e.key.toLowerCase() === "z") { e.preventDefault(); fn.undo(); }
      else if (e.key === "?") { e.preventDefault(); fn.setShortcutsOpen(true); }
      else if (e.key === "Escape") { fn.setShortcutsOpen(false); setFocusMode(false); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusMode]);

  const subtitleNode =
    remaining === 0 ? (
      <span style={{ color: "#ffe94a", fontWeight: 700 }}>¡Todo listo! ¡Buen trabajo hoy!</span>
    ) : (
      <>Te quedan <span style={{ color: "#ffe94a", fontWeight: 700 }}>{remaining}</span> tarea{remaining === 1 ? "" : "s"} por completar hoy..</>
    );

  return (
    <div className={`relative min-h-screen w-full justify-center overflow-x-hidden font-sans tb-themed-bg tb-theme-${theme} ${focusMode ? "tb-focus-active" : ""}`}>
      {/* Desktop ambient backdrop: subtle radial gradient + watermark, behind everything */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 hidden lg:block"
        style={{
          background:
            "radial-gradient(circle at 20% 25%, rgba(57,255,20,0.06) 0%, transparent 35%)," +
            "radial-gradient(circle at 80% 30%, rgba(255,79,163,0.06) 0%, transparent 35%)," +
            "radial-gradient(circle at 30% 75%, rgba(157,77,255,0.06) 0%, transparent 40%)," +
            "radial-gradient(circle at 70% 80%, rgba(255,233,74,0.05) 0%, transparent 35%)",
        }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            fontFamily: "var(--font-caveat), cursive",
            fontSize: "160px",
            fontWeight: 700,
            color: "var(--tb-watermark, rgba(255,255,255,0.04))",
            letterSpacing: "2px",
            userSelect: "none",
            transform: "rotate(-6deg)",
            whiteSpace: "nowrap",
          }}
        >
          NotesApp Deivid Uchiha
        </div>
      </div>
      <style>{`
        html, body { background-color: #0b0b0c; }
        html.tb-theme-light, html.tb-theme-light body { background-color: #f5f1e8; }
        html.tb-theme-dark, html.tb-theme-dark body { background-color: #0b0b0c; }

        .tb-theme-light { --tb-bg: #f5f1e8; --tb-text: #1a1a2e; --tb-card-text: #1a1a2e; --tb-muted: rgba(26,26,46,0.55); --tb-border: rgba(26,26,46,0.15); --tb-surface: rgba(255,255,255,0.7); --tb-header-text: #1a1a2e; --tb-watermark: rgba(0,0,0,0.04); }
        .tb-theme-dark  { --tb-bg: #0b0b0c; --tb-text: #fff; --tb-card-text: #111; --tb-muted: rgba(255,255,255,0.55); --tb-border: rgba(255,255,255,0.1); --tb-surface: rgba(23,23,23,0.7); --tb-header-text: #fff; --tb-watermark: rgba(255,255,255,0.04); }

        .tb-themed-bg { background-color: var(--tb-bg); }
        .tb-themed-text { color: var(--tb-text); }
        .tb-themed-muted { color: var(--tb-muted); }
        .tb-themed-surface { background: var(--tb-surface); border-color: var(--tb-border); }

        @keyframes tb-pop { 0% { opacity: 0; transform: translateY(10px) scale(0.96); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .tb-card-anim { animation: tb-pop 0.45s cubic-bezier(0.22,1,0.36,1) both; }

        @keyframes tb-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(255,233,74,0), 4px 5px 0 rgba(0,0,0,0.45); } 50% { box-shadow: 0 0 0 3px rgba(255,233,74,0.55), 4px 5px 0 rgba(0,0,0,0.45); } }
        .tb-nextup { animation: tb-glow 1.6s ease-in-out infinite; }

        .tb-ring-active { box-shadow: 0 0 0 2px #39ff14, 4px 5px 0 rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.35) !important; }
        @keyframes tb-ring-overdue { 0%,100% { box-shadow: 0 0 0 0 rgba(255,79,163,0), 4px 5px 0 rgba(0,0,0,0.45); } 50% { box-shadow: 0 0 0 3px rgba(255,79,163,0.6), 4px 5px 0 rgba(0,0,0,0.45); } }
        .tb-ring-overdue { animation: tb-ring-overdue 1.8s ease-in-out infinite; }

        @keyframes tb-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); } 50% { box-shadow: 0 0 0 6px rgba(255,255,255,0.18); } }
        .tb-plus-pulse { animation: tb-pulse 2.2s ease-in-out infinite; }

        @keyframes tb-stamp { 0% { opacity: 0; transform: rotate(-14deg) scale(0.6); } 60% { opacity: 1; transform: rotate(-8deg) scale(1.08); } 100% { opacity: 1; transform: rotate(-8deg) scale(1); } }
        .tb-stamp { animation: tb-stamp 0.4s ease-out both; }

        @keyframes tb-dash { to { stroke-dashoffset: -24; } }
        .tb-dash { animation: tb-dash 1.2s linear infinite; }

        .tb-paper { background-image: radial-gradient(rgba(0,0,0,0.10) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px); background-size: 7px 7px, 11px 11px; background-position: 0 0, 3px 3px; }

        /* Crumpled paper texture overlay — subtle bumps + valleys + crease lines.
           The wrapper span is intentionally NOT given a z-index so it does not
           create its own stacking context — that way the ::before/::after
           pseudo-elements (which carry mix-blend-mode) blend with the card's
           colored background instead of with an empty backdrop.
           ::before uses multiply (darkens) for the creases/valleys.
           ::after uses screen (lightens) for the bumps/highlights.
           Splitting the blend modes is necessary because the cards use bright
           neon colors where overlay would only show one direction. */
        .tb-paper-texture { position: absolute; inset: 0; border-radius: inherit; pointer-events: none; }
        .tb-paper-texture::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background:
            radial-gradient(circle at 28% 18%, rgba(0,0,0,0.45) 0%, transparent 22%),
            radial-gradient(circle at 72% 78%, rgba(0,0,0,0.40) 0%, transparent 28%),
            radial-gradient(circle at 50% 45%, rgba(0,0,0,0.28) 0%, transparent 35%),
            radial-gradient(circle at 88% 60%, rgba(0,0,0,0.35) 0%, transparent 20%),
            radial-gradient(circle at 60% 25%, rgba(0,0,0,0.25) 0%, transparent 22%),
            radial-gradient(circle at 22% 55%, rgba(0,0,0,0.28) 0%, transparent 20%),
            linear-gradient(115deg, transparent 36%, rgba(0,0,0,0.26) 41%, transparent 46%),
            linear-gradient(118deg, transparent 60%, rgba(0,0,0,0.22) 65%, transparent 70%),
            linear-gradient(75deg, transparent 50%, rgba(0,0,0,0.20) 54%, transparent 58%),
            linear-gradient(135deg, rgba(0,0,0,0.15) 0%, transparent 35%, rgba(0,0,0,0.18) 100%);
          opacity: 1;
          z-index: 0;
        }
        .tb-paper-texture::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background:
            radial-gradient(circle at 82% 32%, rgba(255,255,255,0.50) 0%, transparent 20%),
            radial-gradient(circle at 18% 68%, rgba(255,255,255,0.45) 0%, transparent 24%),
            radial-gradient(circle at 15% 30%, rgba(255,255,255,0.35) 0%, transparent 18%),
            radial-gradient(circle at 40% 80%, rgba(255,255,255,0.32) 0%, transparent 22%),
            radial-gradient(circle at 65% 15%, rgba(255,255,255,0.28) 0%, transparent 18%),
            linear-gradient(95deg, transparent 20%, rgba(255,255,255,0.28) 25%, transparent 30%),
            linear-gradient(155deg, transparent 45%, rgba(255,255,255,0.22) 50%, transparent 55%);
          opacity: 1;
          z-index: 0;
        }

        .tb-note-btn { transition: transform 0.18s ease, opacity 0.25s ease, box-shadow 0.18s ease; }
        .tb-note-btn:hover { transform: rotate(0deg) translateY(-3px) !important; }
        .tb-note-btn:active { transform: rotate(0deg) scale(0.98) !important; }

        .tb-corner-fold { position: absolute; right: 0; bottom: 0; width: 0; height: 0; border-style: solid; border-width: 0 0 16px 16px; border-color: transparent transparent rgba(0,0,0,0.18) rgba(255,255,255,0.25); border-bottom-right-radius: 4px; }

        .tb-scroll::-webkit-scrollbar { width: 6px; }
        .tb-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 999px; }

        @keyframes tb-confetti-fall { 0% { opacity: 0; transform: translate(0,0) rotate(0deg) scale(1); } 10% { opacity: 1; } 100% { opacity: 0; transform: translate(var(--dx,0), 360px) rotate(var(--rot,0deg)) scale(0.6); } }
        .tb-confetti { position: absolute; top: 0; width: 9px; height: 13px; animation: tb-confetti-fall 2.6s cubic-bezier(0.2,0.7,0.3,1) forwards; --dx: 0px; }

        @keyframes tb-pop-stamp { 0% { opacity: 0; transform: translate(-50%, 8px) scale(0.7) rotate(-6deg); } 55% { opacity: 1; transform: translate(-50%, 0) scale(1.08) rotate(-3deg); } 100% { opacity: 1; transform: translate(-50%, 0) scale(1) rotate(-3deg); } }
        .tb-pop-stamp { animation: tb-pop-stamp 0.5s ease-out both; }

        @keyframes tb-flame-flicker { 0%,100% { transform: scale(1) rotate(-2deg); } 50% { transform: scale(1.08) rotate(2deg); } }
        .tb-flame { animation: tb-flame-flicker 1.4s ease-in-out infinite; display: inline-flex; }

        /* Focus mode: dim everything except the focus overlay */
        @keyframes tb-focus-in { 0% { opacity: 0; transform: scale(0.92); } 100% { opacity: 1; transform: scale(1); } }
        .tb-focus-card { animation: tb-focus-in 0.35s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes tb-focus-bg { 0% { opacity: 0; } 100% { opacity: 1; } }
        .tb-focus-bg { animation: tb-focus-bg 0.3s ease-out both; }

        /* Character image animations */
        @keyframes tb-char-pop {
          0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
          60% { transform: scale(1.1) rotate(3deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .tb-char-pop { animation: tb-char-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; }

        @keyframes tb-char-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .tb-char-float { animation: tb-char-float 3s ease-in-out infinite; }

        @keyframes tb-char-bounce {
          0%, 100% { transform: translateX(-50%) translateY(0) scale(1); }
          50% { transform: translateX(-50%) translateY(-12px) scale(1.05); }
        }
        .tb-char-bounce { animation: tb-char-bounce 0.8s ease-in-out infinite; }
      `}</style>

      <div className="relative mx-auto w-full max-w-[390px] px-3 sm:max-w-[420px] lg:max-w-[460px]">
        <DoodleFrame />
        <BgDoodles />

        {/* Header */}
        <header className="relative px-5 pb-4 pt-9">
          <FlowerDoodle className="absolute right-2 top-24 h-20 w-16 sm:h-24 sm:w-20 lg:h-28 lg:w-24 pointer-events-none z-[5]" />

          {/* date + streak row */}
          <div className="mb-2 flex items-center justify-between">
            <span className="tb-themed-surface inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[11px] tb-themed-muted">
              <Calendar size={12} /> {today}
            </span>
            {streak > 0 && (
              <span className="tb-flame inline-flex items-center gap-1 rounded-full border border-[#ff8a3d]/40 bg-[#ff8a3d]/15 px-2.5 py-1 text-[12px] font-bold text-[#ff8a3d]" style={{ fontFamily: "var(--font-patrick-hand), cursive" }}>
                <Flame size={13} /> Racha de {streak} día{streak === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {/* avatar + greeting — avatar is tappable to edit profile */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openProfile}
              aria-label="Editar perfil"
              title="Editar tu perfil"
              className="group relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl transition-transform active:scale-95"
              style={{ background: profile?.avatarColor || "#3b82f6", boxShadow: `0 0 0 2px ${profile?.avatarColor || "#3b82f6"}55, 3px 3px 0 rgba(0,0,0,0.4)` }}
            >
              <span className="leading-none">{profile?.avatar || "🙂"}</span>
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-neutral-900 text-white/70 transition-colors group-hover:bg-[#2563eb] group-hover:text-white">
                <PencilLine size={10} />
              </span>
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold leading-tight tracking-tight tb-themed-text sm:text-3xl lg:text-4xl">
                <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0">
                  <GreetingDoodle emoji={greeting.emoji} className="h-5 w-5 shrink-0 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
                  <span className="whitespace-nowrap">{greeting.word},</span>
                  <span className="whitespace-nowrap">{displayName}</span>
                </span>
              </h1>
            </div>
          </div>
          <svg className="mt-0.5 h-2 w-40 text-[#ffe94a]/70" viewBox="0 0 160 8" fill="none" aria-hidden="true">
            <path d="M2 5 C 30 1, 60 7, 90 4 S 140 2, 158 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <p className="mt-2 flex items-center gap-2 tb-themed-muted" style={{ fontFamily: "var(--font-caveat), cursive", fontSize: "24px", lineHeight: "1.2", fontWeight: 500 }}>
            <span>{subtitleNode}</span>
          </p>

          <div className="mt-3 flex items-center gap-3">
            <ProgressRing done={doneCount} total={total} size={42} />
            <div className="text-[12px] leading-tight tb-themed-muted">
              <div className="tb-themed-text" style={{ fontFamily: "var(--font-patrick-hand), cursive", fontSize: "15px" }}>{doneCount} de {total} hechas</div>
              <div>¡sigue con la racha! ✦</div>
            </div>
          </div>

          {/* status summary chips */}
          {remaining > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {statusCounts.active > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#39ff14]/40 bg-[#39ff14]/10 px-2 py-0.5 text-[11px] font-semibold text-[#39ff14]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#39ff14]" /> {statusCounts.active} ahora
                </span>
              )}
              {statusCounts.soon > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#ffe94a]/40 bg-[#ffe94a]/10 px-2 py-0.5 text-[11px] font-semibold text-[#ffe94a]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ffe94a]" /> {statusCounts.soon} pronto
                </span>
              )}
              {statusCounts.overdue > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#ff4fa3]/40 bg-[#ff4fa3]/10 px-2 py-0.5 text-[11px] font-semibold text-[#ff4fa3]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff4fa3]" /> {statusCounts.overdue} pasada{statusCounts.overdue === 1 ? "" : "s"}
                </span>
              )}
              {statusCounts.later > 0 && (
                <span className="tb-themed-surface inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-[11px] font-medium tb-themed-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-40" /> {statusCounts.later} después
                </span>
              )}
            </div>
          )}

          {/* total deck time + quick actions */}
          <div className="mt-3 flex items-center justify-between gap-2">
            {remaining > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3b82f6]/40 bg-[#3b82f6]/10 px-2.5 py-1 text-[11px] font-semibold text-[#60a5fa]">
                <Hourglass size={12} /> {formatDuración(totalDeckMinutes)} en el tablero
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#39ff14]/40 bg-[#39ff14]/10 px-2.5 py-1 text-[11px] font-semibold text-[#39ff14]">
                <Check size={12} /> tablero completado
              </span>
            )}
            <div className="flex items-center gap-1.5">
              {/* primary always-visible actions */}
              {undoStack.length > 0 && (
                <button type="button" onClick={undo} aria-label="Deshacer última acción" title="Deshacer (Ctrl/Cmd+Z)" className="flex h-7 w-7 items-center justify-center rounded-full border border-[#ffe94a]/40 bg-[#ffe94a]/15 text-[#ffe94a] transition-colors hover:bg-[#ffe94a]/25">
                  <Undo2 size={13} />
                </button>
              )}
              <button type="button" onClick={toggleFocusMode} aria-label="Activar modo enfoque" title="Modo enfoque (F)" className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${focusMode ? "border-[#ffe94a] bg-[#ffe94a]/20 text-[#ffe94a]" : "tb-themed-surface border-white/10 tb-themed-muted hover:bg-white/10"}`}>
                <Focus size={13} />
              </button>
              <button type="button" onClick={toggleTheme} aria-label="Cambiar tema" title="Tema (T)" className="flex h-7 w-7 items-center justify-center rounded-full border tb-themed-surface border-white/10 tb-themed-muted transition-colors hover:bg-white/10">
                {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
              </button>
              {/* overflow "more" menu for secondary actions */}
              <button type="button" onClick={() => setMoreMenuOpen(true)} aria-label="Más acciones" title="Más acciones" className="flex h-7 w-7 items-center justify-center rounded-full border tb-themed-surface border-white/10 tb-themed-muted transition-colors hover:bg-white/10">
                <EllipsisVertical size={13} />
              </button>
            </div>
          </div>
        </header>

        {/* Skewed label */}
        <div className="mb-3 flex justify-center px-5">
          <div className="rounded-md px-4 py-1.5" style={{ background: "#2563eb", transform: "skewX(-12deg)" }}>
            <span className="text-[13px] font-semibold tracking-wide text-white" style={{ display: "inline-block", transform: "skewX(12deg)" }}>¿Qué hay en el tablero hoy</span>
          </div>
        </div>

        {/* Quick critical (P1) filter chip — only when there are P1 tasks and no other filter active */}
        {filter === "all" && !searchQuery && taskList.some((t) => (t.priority || 3) === 1 && !completedIds.has(t.id)) && (
          <div className="mb-3 flex justify-center">
            <button
              type="button"
              onClick={() => { setFilter("active"); setActiveTag("all"); setSearchQuery(""); setSortByPriority(true); }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#ff4fa3]/50 bg-[#ff4fa3]/10 px-3 py-1 text-[12px] font-semibold text-[#ff4fa3] transition-colors hover:bg-[#ff4fa3]/20"
            >
              <CircleAlert size={12} /> {taskList.filter((t) => (t.priority || 3) === 1 && !completedIds.has(t.id)).length} crítica{taskList.filter((t) => (t.priority || 3) === 1 && !completedIds.has(t.id)).length === 1 ? "" : "s"} (P1)
            </button>
          </div>
        )}

        {/* Active filter chip */}
        {filter !== "all" && (
          <div className="mb-3 flex justify-center">
            <button type="button" onClick={() => setFilter("all")} className="tb-themed-surface inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-[12px] tb-themed-muted">
              <Filter size={12} />{FILTERS.find((f) => f.id === filter)?.label}<span className="opacity-50">✕</span>
            </button>
          </div>
        )}

        {/* showing caption */}
        {(filter !== "all" || searchQuery) && (
          <p className="mb-2 text-center text-[13px] tb-themed-muted" style={{ fontFamily: "var(--font-caveat), cursive", fontSize: "16px" }}>
            {searchQuery ? `${visibleTasks.length} resultados para «${searchQuery}»` : `mostrando ${visibleTasks.length} de ${total}`}
          </p>
        )}

        {/* Day timeline — only on the default view */}
        {filter === "all" && !searchQuery && taskList.length > 0 && (
          <DayTimeline tasks={taskList} completedIds={completedIds} now={now} onJumpTask={(t) => { setNextUpId(t.id); setTimeout(() => { const el = document.getElementById(`task-${t.id}`); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); }, 60); toast({ title: "Saltando a", description: `«${t.title}»` }); }} />
        )}

        {/* Task list */}
        <div className="px-4 pb-36">
          {visibleTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              {!searchQuery && (
                <div className="tb-char-float mb-3 flex items-center justify-center" style={{ width: "180px", maxWidth: "65vw", height: "180px", maxHeight: "50vh" }}>
                  <img
                    src={GROUP_EMPTY_IMAGE}
                    alt="Equipo descansando"
                    className="h-auto max-h-full w-auto max-w-full"
                    style={{ filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.35))", objectFit: "contain" }}
                    draggable={false}
                  />
                </div>
              )}
              <div className="text-5xl">{searchQuery ? "🔍" : "🪴"}</div>
              <p className="mt-3 tb-themed-muted" style={{ fontFamily: "var(--font-caveat), cursive", fontSize: "22px" }}>
                {searchQuery ? `lo sentimos, no hay coincidencias para “${searchQuery}”…` : "nada por aquí.."}
              </p>
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="tb-themed-surface mt-2 rounded-full border border-white/15 px-3 py-1 text-[12px] tb-themed-muted hover:bg-white/10">limpiar búsqueda</button>
              )}
            </div>
          )}

          {visibleTasks.map((task, i) => {
            const isLeft = i % 2 === 0;
            const showArrow = i < visibleTasks.length - 1;
            const isDone = completedIds.has(task.id);
            const isNextUp = nextUpId === task.id;
            const status = taskStatus(task, isDone, now);
            const realIdx = taskList.findIndex((t) => t.id === task.id);
            // agenda group header: show before the first task of each group
            const group = agendaGroups ? agendaGroups.find((g) => g.tasks.some((t) => t.id === task.id)) : null;
            const showGroupHeader = group && group.tasks[0].id === task.id;
            const GroupIcon = group?.icon;
            return (
              <div key={task.id}>
                {showGroupHeader && (
                  <div className="mb-4 mt-2 flex items-center gap-2 first:mt-0">
                    <GroupIcon size={16} style={{ color: group.color }} />
                    <span className="text-[13px] font-bold tracking-wide tb-themed-muted" style={{ fontFamily: "var(--font-patrick-hand), cursive", fontSize: "17px" }}>{group.label}</span>
                    <span className="h-px flex-1 bg-white/10" />
                    <span className="text-[11px] tb-themed-muted">{group.tasks.length}</span>
                  </div>
                )}
              <div id={`task-${task.id}`} className="relative mb-16 last:mb-0">
                <div className={`flex ${isLeft ? "justify-start" : "justify-end"}`}>
                  <div className="w-[62%]">
                    <StickyNote
                      task={task}
                      index={i}
                      isDone={isDone}
                      isNextUp={isNextUp}
                      status={status}
                      now={now}
                      onToggle={toggleComplete}
                      onEdit={openEdit}
                      onEliminar={handleEliminar}
                      onOpenActions={openActions}
                      onMoveUp={(t) => moveTask(t, -1)}
                      onMoveDown={(t) => moveTask(t, 1)}
                      canUp={realIdx > 0}
                      canDown={realIdx < taskList.length - 1}
                      onToggleSubtask={toggleSubtask}
                    />
                  </div>
                </div>
                {showArrow && <ConnectorArrow index={i} leftToRight={isLeft} animate={isNextUp} />}
              </div>
              </div>
            );
          })}
        </div>

        {/* Tomorrow peek — a collapsible preview of tasks that may roll into tomorrow */}
        {tomorrowPeek.length > 0 && filter === "all" && !searchQuery && (
          <div className="px-4 pb-32">
            <button
              type="button"
              onClick={() => setTomorrowExpanded((v) => !v)}
              className="tb-themed-surface flex w-full items-center justify-between rounded-xl border border-white/10 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
            >
              <span className="inline-flex items-center gap-2 text-[13px] font-semibold tb-themed-text" style={{ fontFamily: "var(--font-patrick-hand), cursive", fontSize: "16px" }}>
                <CalendarDays size={15} className="text-[#9d4dff]" /> Vistazo a mañana
                <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[11px] tb-themed-muted">{tomorrowPeek.length}</span>
              </span>
              {tomorrowExpanded ? <ChevronUp size={16} className="tb-themed-muted" /> : <ChevronDown size={16} className="tb-themed-muted" />}
            </button>
            {tomorrowExpanded && (
              <div className="tb-themed-surface mt-2 flex flex-col gap-1.5 rounded-xl border border-white/10 p-3">
                {tomorrowPeek.map((t) => (
                  <div key={t.id} className="flex min-w-0 items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-white/5">
                    <span className="text-lg">{t.emoji}</span>
                    <span className="flex-1 truncate text-[13px] tb-themed-text" style={{ fontFamily: "var(--font-patrick-hand), cursive", fontSize: "15px" }}>{t.title}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] tb-themed-muted">
                      <Clock size={10} /> {t.startTime}
                    </span>
                    {t.priority === 1 && (
                      <span className="rounded-full bg-[#ff4fa3] px-1.5 py-0.5 text-[9px] font-bold text-[#0b0b0c]">P1</span>
                    )}
                  </div>
                ))}
                <p className="mt-1 px-2 text-[12px] tb-themed-muted" style={{ fontFamily: "'Caveat', cursive", fontSize: "14px" }}>tareas vespertinas + urgentes que pueden pasar a mañana..</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom floating bar — botones SEPARADOS (no en cápsula) */}
      <div className="fixed bottom-6 left-1/2 z-40 flex w-[358px] -translate-x-1/2 items-center justify-between px-1 sm:w-[400px] lg:w-[440px]" style={{ maxWidth: "calc(100% - 32px)" }}>
        {/* Izquierda: filtro + reloj como botones individuales flotantes */}
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setFilterOpen(true)} aria-label="Filtrar tareas" className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition-colors ${filter !== "all" || searchQuery ? "bg-[#2563eb] text-white" : "bg-neutral-900/70 text-white/80 hover:bg-white/10"}`} style={{ border: "1px solid rgba(255,255,255,0.1)" }}><Filter size={18} /></button>
          <button type="button" onClick={jumpToNextUp} aria-label="Saltar a la siguiente tarea" className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-900/70 text-white/80 backdrop-blur-md transition-colors hover:bg-white/10" style={{ border: "1px solid rgba(255,255,255,0.1)" }}><Clock size={18} /></button>
        </div>
        {/* Derecha: botón "+" individual flotante */}
        <button type="button" onClick={openAdd} aria-label="Añadir tarea" className="tb-plus-pulse flex h-12 w-12 items-center justify-center rounded-full bg-white text-black transition-transform active:scale-95" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}><Plus size={24} strokeWidth={2.5} /></button>
      </div>

      {/* Add / Edit sheet */}
      <Sheet open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setEditingId(null); }}>
        <SheetContent side="bottom" className="mx-auto max-w-[390px] rounded-t-2xl border-white/10 bg-neutral-900 p-0 text-white sm:max-w-[440px] lg:max-w-[480px]">
          <SheetHeader className="px-5 pt-6">
            <SheetTitle style={{ fontFamily: "var(--font-patrick-hand), cursive", fontSize: "22px" }} className="flex items-center gap-2 text-white"><Sparkles size={18} className="text-[#ffe94a]" />{editingId ? "Editar nota adhesiva" : "Nueva nota adhesiva"}</SheetTitle>
            <SheetDescription className="text-white/50">{editingId ? "Ajústala — color y ángulo se mantienen." : "Añade algo al tablero de hoy."}</SheetDescription>
          </SheetHeader>
          <div className="tb-scroll flex max-h-[70vh] flex-col gap-4 overflow-y-auto px-5 pb-28 pt-2">
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-white/60">Título</span>
              <Input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} placeholder="p. ej. Redactar la introducción del boletín" className="border-white/15 bg-white/5 text-white placeholder:text-white/30" />
            </label>
            <div>
              <span className="mb-1 block text-[12px] font-medium text-white/60">Elige un dibujo</span>
              <div className="grid grid-cols-8 gap-1.5">
                {EMOJI_CHOICES.map((em) => (
                  <button key={em} type="button" onClick={() => setDraftEmoji(em)} className={`flex h-9 items-center justify-center rounded-md text-xl transition-colors ${draftEmoji === em ? "bg-[#2563eb]" : "bg-white/5 hover:bg-white/10"}`}>{em}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-[12px] font-medium text-white/60">Inicio</span>
                <Input value={draftStart} onChange={(e) => setDraftStart(e.target.value)} placeholder="9am" className="border-white/15 bg-white/5 text-white placeholder:text-white/30" />
              </label>
              <label className="block">
                <span className="mb-1 block text-[12px] font-medium text-white/60">Fin</span>
                <Input value={draftEnd} onChange={(e) => setDraftEnd(e.target.value)} placeholder="9:30am" className="border-white/15 bg-white/5 text-white placeholder:text-white/30" />
              </label>
            </div>
            <div>
              <span className="mb-1 block text-[12px] font-medium text-white/60">Duración</span>
              <div className="flex flex-wrap gap-1.5">
                {DURATION_CHOICES.map((d) => (
                  <button key={d} type="button" onClick={() => setDraftDuration(d)} className={`rounded-full px-3 py-1 text-[13px] transition-colors ${Number(draftDuration) === d ? "bg-[#2563eb] text-white" : "bg-white/5 text-white/70 hover:bg-white/10"}`}>{d}m</button>
                ))}
              </div>
            </div>
            <div>
              <span className="mb-1 block text-[12px] font-medium text-white/60">Etiqueta</span>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.map((t) => {
                  const Icon = t.icon;
                  const sel = draftTag === t.id;
                  return (
                    <button key={t.id} type="button" onClick={() => setDraftTag(t.id)} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[13px] transition-colors ${sel ? "text-white" : "text-white/70 hover:bg-white/10"}`} style={sel ? { background: t.color } : { background: "rgba(255,255,255,0.05)" }}>
                      <Icon size={12} /> {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <span className="mb-1 block text-[12px] font-medium text-white/60">Prioridad</span>
              <div className="flex flex-wrap gap-1.5">
                {PRIORITIES.map((p) => {
                  const sel = draftPriority === p.id;
                  return (
                    <button key={p.id} type="button" onClick={() => setDraftPriority(p.id)} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[13px] font-bold transition-colors ${sel ? "text-[#0b0b0c]" : "text-white/70 hover:bg-white/10"}`} style={sel ? { background: p.color } : { background: "rgba(255,255,255,0.05)" }}>
                      {p.label} · {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <span className="mb-1 block text-[12px] font-medium text-white/60">Repetir</span>
              <div className="flex flex-wrap gap-1.5">
                {RECURRENCE.map((r) => {
                  const sel = draftRecurrence === r.id;
                  return (
                    <button key={r.id} type="button" onClick={() => setDraftRecurrence(r.id)} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[13px] font-bold transition-colors ${sel ? "text-[#0b0b0c]" : "text-white/70 hover:bg-white/10"}`} style={sel ? { background: r.color } : { background: "rgba(255,255,255,0.05)" }}>
                      <Repeat size={11} /> {r.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex gap-2 border-t border-white/10 bg-neutral-900/95 p-4 backdrop-blur">
            {editingId && (
              <button type="button" onClick={() => { const t = taskList.find((x) => x.id === editingId); if (t) handleEliminar(t); setAddOpen(false); setEditingId(null); }} aria-label="Eliminar esta tarea" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#ff4fa3]/40 bg-[#ff4fa3]/15 text-[#ff4fa3] transition-colors hover:bg-[#ff4fa3]/30"><Trash2 size={18} /></button>
            )}
            <button type="button" onClick={handleSave} className="flex-1 rounded-full bg-[#ffe94a] py-3 text-center text-[15px] font-bold text-[#0b0b0c] transition-transform active:scale-[0.98]">{editingId ? "Guardar cambios" : "Añadir al tablero de hoy"}</button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Filter sheet */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-[390px] rounded-t-2xl border-white/10 bg-neutral-900 p-0 text-white sm:max-w-[440px] lg:max-w-[480px]">
          <SheetHeader className="px-5 pt-6">
            <SheetTitle style={{ fontFamily: "var(--font-patrick-hand), cursive", fontSize: "22px" }} className="flex items-center gap-2 text-white"><Filter size={18} className="text-[#2563eb]" /> Filtrar el tablero</SheetTitle>
            <SheetDescription className="text-white/50">Muestra solo las notas que quieras ver.</SheetDescription>
          </SheetHeader>
          <div className="tb-scroll flex max-h-[80vh] flex-col gap-3 overflow-y-auto px-5 pb-6 pt-2">
            {/* search */}
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar tareas…"
                className="border-white/15 bg-white/5 pl-9 pr-9 text-white placeholder:text-white/30"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} aria-label="Limpiar búsqueda" className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>

            {FILTERS.map((f) => {
              const count = taskList.filter((t) => { const d = completedIds.has(t.id); if (f.id === "active") return !d; if (f.id === "done") return d; if (f.id === "quick") return t.duration <= 30; return true; }).length;
              const active = filter === f.id;
              return (
                <button key={f.id} type="button" onClick={() => { setFilter(f.id); setFilterOpen(false); }} className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${active ? "border-[#2563eb] bg-[#2563eb]/20" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
                  <span className="text-[15px] font-medium">{f.label}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[12px] text-white/60">{count}</span>
                </button>
              );
            })}

            {/* tag filter */}
            <div className="mt-1">
              <span className="mb-1.5 block text-[12px] font-medium text-white/60">Filtrar por etiqueta</span>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" onClick={() => setActiveTag("all")} className={`rounded-full px-3 py-1 text-[13px] transition-colors ${activeTag === "all" ? "bg-white text-[#0b0b0c]" : "bg-white/5 text-white/70 hover:bg-white/10"}`}>Todas las etiquetas</button>
                {TAGS.map((t) => {
                  const Icon = t.icon;
                  const sel = activeTag === t.id;
                  const cnt = taskList.filter((x) => x.tag === t.id).length;
                  return (
                    <button key={t.id} type="button" onClick={() => setActiveTag(t.id)} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[13px] transition-colors ${sel ? "text-white" : "text-white/70 hover:bg-white/10"}`} style={sel ? { background: t.color } : { background: "rgba(255,255,255,0.05)" }}>
                      <Icon size={12} /> {t.label} <span className="opacity-70">{cnt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-2 flex gap-2">
              <button type="button" onClick={exportTasks} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-[14px] font-semibold text-white/70 transition-colors hover:bg-white/10"><Share2 size={16} /> Exportar</button>
              <button type="button" onClick={() => { setFilterOpen(false); window.setTimeout(() => setResetConfirmOpen(true), 250); }} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-[14px] font-semibold text-white/70 transition-colors hover:bg-white/10"><RotateCcw size={16} /> Reiniciar</button>
            </div>
            {doneCount > 0 && (
              <button type="button" onClick={clearDone} className="flex items-center justify-center gap-2 rounded-xl border border-[#ff4fa3]/40 bg-[#ff4fa3]/10 px-4 py-3 text-[14px] font-semibold text-[#ff4fa3] transition-colors hover:bg-[#ff4fa3]/20"><Brush size={16} /> Limpiar {doneCount} tarea{doneCount === 1 ? "" : "s"} completada{doneCount === 1 ? "" : "s"}</button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Reset confirmation */}
      <AlertDialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <AlertDialogContent className="max-w-[350px] border-white/10 bg-neutral-900 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle style={{ fontFamily: "var(--font-patrick-hand), cursive", fontSize: "20px" }}>¿Reiniciar al tablero de demostración?</AlertDialogTitle>
          <AlertDialogDescription className="text-white/60">
            Esto borra tus tareas y estado de completado actuales, y restaura las 6 notas de demostración. No se puede deshacer.
          </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/15 bg-transparent text-white/70 hover:bg-white/10 hover:text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={resetDemo} className="bg-[#ffe94a] text-[#0b0b0c] hover:bg-[#ffe94a]/90">Reiniciar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Long-press action sheet */}
      <Sheet open={!!actionTask} onOpenChange={(o) => { if (!o) setActionTaskId(null); }}>
        <SheetContent side="bottom" className="mx-auto max-w-[390px] rounded-t-2xl border-white/10 bg-neutral-900 p-0 text-white sm:max-w-[440px] lg:max-w-[480px]">
          <SheetHeader className="px-5 pt-6">
            <SheetTitle style={{ fontFamily: "var(--font-patrick-hand), cursive", fontSize: "20px" }} className="flex items-center gap-2 text-white">
              <span className="text-xl">{actionTask?.emoji}</span> {actionTask?.title}
            </SheetTitle>
            <SheetDescription className="text-white/50">menú de pulsación larga</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-2 px-5 pb-8 pt-2">
            <button type="button" onClick={() => { if (actionTask) toggleComplete(actionTask); setActionTaskId(null); }} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-[15px] transition-colors hover:bg-white/10">
              <Check size={18} className="text-[#39ff14]" /> {completedIds.has(actionTask?.id) ? "Marcar como no hecha" : "Marcar como hecha"}
            </button>
            <button type="button" onClick={() => { if (actionTask) openEdit(actionTask); setActionTaskId(null); }} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-[15px] transition-colors hover:bg-white/10">
              <Pencil size={18} className="text-[#2563eb]" /> Editar
            </button>
            <button type="button" onClick={() => { if (actionTask) cloneTask(actionTask); }} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-[15px] transition-colors hover:bg-white/10">
              <CopyPlus size={18} className="text-[#9d4dff]" /> Duplicar
            </button>
            <div className="flex gap-2">
              <button type="button" disabled={!canMoveUp(actionTask, taskList)} onClick={() => { if (actionTask) moveTask(actionTask, -1); setActionTaskId(null); }} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[14px] transition-colors hover:bg-white/10 disabled:opacity-40"><ArrowUp size={16} /> Subir</button>
              <button type="button" disabled={!canMoveDown(actionTask, taskList)} onClick={() => { if (actionTask) moveTask(actionTask, 1); setActionTaskId(null); }} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[14px] transition-colors hover:bg-white/10 disabled:opacity-40"><ArrowDown size={16} /> Bajar</button>
            </div>
            <button type="button" onClick={() => { if (actionTask) handleEliminar(actionTask); }} className="mt-1 flex items-center gap-3 rounded-xl border border-[#ff4fa3]/40 bg-[#ff4fa3]/10 px-4 py-3 text-left text-[15px] font-semibold text-[#ff4fa3] transition-colors hover:bg-[#ff4fa3]/20"><Trash2 size={18} /> Eliminar</button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Atajos de teclado overlay */}
      <AlertDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <AlertDialogContent className="max-w-[350px] border-white/10 bg-neutral-900 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle style={{ fontFamily: "var(--font-patrick-hand), cursive", fontSize: "20px" }} className="flex items-center gap-2">
              <Keyboard size={18} className="text-[#ffe94a]" /> Atajos de teclado
            </AlertDialogTitle>
            <AlertDialogDescription className="sr-only">Lista de atajos de teclado</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2 px-1 py-2">
            {[
              { key: "/", desc: "Abrir búsqueda y filtro" },
              { key: "N", desc: "Nueva nota adhesiva" },
              { key: "J", desc: "Saltar a la siguiente tarea" },
              { key: "K", desc: "Saltar a la tarea anterior" },
              { key: "F", desc: "Activar modo enfoque" },
              { key: "S", desc: "Mezclar ángulos de notas" },
              { key: "T", desc: "Cambiar tema oscuro / claro" },
              { key: "Z", desc: "Deshacer última acción" },
              { key: "⌘Z", desc: "Deshacer (funciona en campos)" },
              { key: "?", desc: "Mostrar esta ayuda" },
              { key: "Esc", desc: "Cerrar diálogos / salir del enfoque" },
            ].map((s) => (
              <div key={s.key} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                <span className="text-[14px] text-white/70">{s.desc}</span>
                <kbd className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-white/20 bg-white/10 px-2 text-[12px] font-bold text-white" style={{ fontFamily: "var(--font-patrick-hand), cursive" }}>{s.key}</kbd>
              </div>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-[#ffe94a] text-[#0b0b0c] hover:bg-[#ffe94a]/90" onClick={() => setShortcutsOpen(false)}>Entendido</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Weekly stats sheet */}
      <Sheet open={statsOpen} onOpenChange={setStatsOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-[390px] rounded-t-2xl border-white/10 bg-neutral-900 p-0 text-white sm:max-w-[440px] lg:max-w-[480px]">
          <SheetHeader className="px-5 pt-6">
            <SheetTitle style={{ fontFamily: "var(--font-patrick-hand), cursive", fontSize: "22px" }} className="flex items-center gap-2 text-white"><BarChart3 size={18} className="text-[#39ff14]" /> Estadísticas de hoy</SheetTitle>
            <SheetDescription className="text-white/50">Un vistazo rápido a tu tablero.</SheetDescription>
          </SheetHeader>
          <div className="tb-scroll flex max-h-[80vh] flex-col gap-4 overflow-y-auto px-5 pb-8 pt-2">
            {/* completion ring + headline */}
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <ProgressRing done={stats.done} total={stats.total} size={56} />
              <div>
                <div className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-patrick-hand), cursive" }}>{stats.completionRate}%</div>
                <div className="text-[12px] text-white/55">{stats.done} de {stats.total} tareas completadas</div>
              </div>
            </div>

            {/* time stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                <div className="text-[11px] uppercase tracking-wide text-white/40">Tiempo hecho</div>
                <div className="mt-1 text-xl font-bold text-[#39ff14]" style={{ fontFamily: "var(--font-patrick-hand), cursive" }}>{formatDuración(stats.doneMinutes)}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                <div className="text-[11px] uppercase tracking-wide text-white/40">Tiempo restante</div>
                <div className="mt-1 text-xl font-bold text-[#60a5fa]" style={{ fontFamily: "var(--font-patrick-hand), cursive" }}>{formatDuración(stats.totalMinutes - stats.doneMinutes)}</div>
              </div>
            </div>

            {/* streak */}
            {streak > 0 && (
              <div className="flex items-center justify-between rounded-2xl border border-[#ff8a3d]/40 bg-[#ff8a3d]/10 p-3">
                <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#ff8a3d]"><Flame size={16} /> Racha actual</span>
                <span className="text-xl font-bold text-[#ff8a3d]" style={{ fontFamily: "var(--font-patrick-hand), cursive" }}>{streak} día{streak === 1 ? "" : "s"}</span>
              </div>
            )}

            {/* by priority */}
            <div>
              <div className="mb-2 text-[12px] font-medium text-white/60">Por prioridad</div>
              <div className="flex flex-col gap-2">
                {stats.byPriority.map((p) => {
                  const pct = p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
                  return (
                    <div key={p.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="inline-flex items-center gap-1.5 font-bold" style={{ color: p.color }}>{p.label} · {p.name}</span>
                        <span className="text-white/50">{p.done}/{p.total}</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: p.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* by tag */}
            {stats.byTag.length > 0 && (
              <div>
                <div className="mb-2 text-[12px] font-medium text-white/60">Por etiqueta</div>
                <div className="flex flex-wrap gap-2">
                  {stats.byTag.map((t) => {
                    const Icon = t.icon;
                    return (
                      <div key={t.id} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px]" style={{ borderColor: `${t.color}40`, background: `${t.color}10`, color: t.color }}>
                        <Icon size={12} /> {t.label} <span className="opacity-70">{t.done}/{t.total}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* achievements gallery */}
            <div>
              <div className="mb-2 text-[12px] font-medium text-white/60">Logros ({unlockedAchievements.length}/{ACHIEVEMENTS.length})</div>
              <AchievementGallery unlockedIds={unlockedAchievements} />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Más acciones overflow sheet */}
      <Sheet open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-[390px] rounded-t-2xl border-white/10 bg-neutral-900 p-0 text-white sm:max-w-[440px] lg:max-w-[480px]">
          <SheetHeader className="px-5 pt-6">
            <SheetTitle style={{ fontFamily: "var(--font-patrick-hand), cursive", fontSize: "22px" }} className="flex items-center gap-2 text-white"><EllipsisVertical size={18} className="text-[#ffe94a]" /> Más acciones</SheetTitle>
            <SheetDescription className="text-white/50">Toggles rápidos y vistas.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-2 px-5 pb-8 pt-2">
            {/* profile card preview at the top */}
            <button type="button" onClick={() => { openProfile(); setMoreMenuOpen(false); }} className="flex items-center gap-3 rounded-xl border border-[#ffe94a]/40 bg-[#ffe94a]/10 px-4 py-3 text-left transition-colors hover:bg-[#ffe94a]/20">
              <span className="flex h-9 w-9 items-center justify-center rounded-full text-xl" style={{ background: profile?.avatarColor || "#3b82f6" }}>{profile?.avatar || "🙂"}</span>
              <span className="flex-1">
                <span className="block text-[15px] font-bold text-white" style={{ fontFamily: "var(--font-patrick-hand), cursive" }}>{displayName}</span>
                <span className="block text-[11px] text-white/50">Editar perfil y avatar</span>
              </span>
              <PencilLine size={16} className="text-[#ffe94a]" />
            </button>
            <button type="button" onClick={() => { setStatsOpen(true); setMoreMenuOpen(false); }} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-[15px] transition-colors hover:bg-white/10">
              <BarChart3 size={18} className="text-[#39ff14]" /> Ver estadísticas de hoy
            </button>
            {/* Notificaciones push */}
            {push.supported && (
              <button type="button" onClick={async () => {
                if (push.subscribed) {
                  toast({ title: "Notificaciones activas 🔔", description: "Ya recibirás recordatorios." });
                } else {
                  await push.subscribe();
                  if (push.subscribed) toast({ title: "¡Notificaciones activadas! 🔔", description: "Recibirás recordatorios de tareas." });
                  else if (push.error) toast({ title: "No se pudo activar", description: push.error });
                }
              }} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-[15px] transition-colors ${push.subscribed ? "border-[#39ff14]/50 bg-[#39ff14]/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
                <Bell size={18} className={push.subscribed ? "text-[#39ff14]" : "text-white/60"} />
                {push.subscribed ? "Notificaciones activadas" : push.loading ? "Activando..." : "Activar notificaciones push"}
              </button>
            )}
            <button type="button" onClick={() => { toggleSortByPriority(); setMoreMenuOpen(false); }} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-[15px] transition-colors ${sortByPriority ? "border-[#ff4fa3]/50 bg-[#ff4fa3]/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
              <Flag size={18} className={sortByPriority ? "text-[#ff4fa3]" : "text-white/60"} /> {sortByPriority ? "Ordenando por prioridad (activado)" : "Ordenar por prioridad"}
            </button>
            <button type="button" onClick={() => { shuffleRotations(); setMoreMenuOpen(false); }} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-[15px] transition-colors hover:bg-white/10">
              <Shuffle size={18} className="text-white/60" /> Mezclar ángulos de notas
            </button>
            <button type="button" onClick={() => { toggleSound(); }} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-[15px] transition-colors ${soundEnabled ? "border-[#39ff14]/50 bg-[#39ff14]/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
              {soundEnabled ? <Volume2 size={18} className="text-[#39ff14]" /> : <VolumeX size={18} className="text-white/60" />} {soundEnabled ? "Sonido activado" : "Sonido desactivado"}
            </button>
            <button type="button" onClick={() => { setShortcutsOpen(true); setMoreMenuOpen(false); }} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-[15px] transition-colors hover:bg-white/10">
              <Keyboard size={18} className="text-white/60" /> Atajos de teclado
            </button>
            <button type="button" onClick={() => { setFilterOpen(true); setMoreMenuOpen(false); }} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-[15px] transition-colors hover:bg-white/10">
              <Filter size={18} className="text-[#2563eb]" /> Filtrar y buscar
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Profile editor sheet */}
      <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-[390px] rounded-t-2xl border-white/10 bg-neutral-900 p-0 text-white sm:max-w-[440px] lg:max-w-[480px]">
          <SheetHeader className="px-5 pt-6">
            <SheetTitle style={{ fontFamily: "var(--font-patrick-hand), cursive", fontSize: "22px" }} className="flex items-center gap-2 text-white"><User size={18} className="text-[#ffe94a]" /> Tu perfil</SheetTitle>
            <SheetDescription className="text-white/50">Pon tu nombre y elige un avatar.</SheetDescription>
          </SheetHeader>
          <div className="tb-scroll flex max-h-[80vh] flex-col gap-5 overflow-y-auto px-5 pb-28 pt-2">
            {/* live avatar preview */}
            <div className="flex flex-col items-center gap-2 py-2">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full text-5xl transition-colors"
                style={{ background: draftProfileColor, boxShadow: `0 0 0 3px ${draftProfileColor}55, 4px 5px 0 rgba(0,0,0,0.45)` }}
              >
                <span className="leading-none">{draftProfileAvatar}</span>
              </div>
              <span className="text-[15px] font-bold text-white/80" style={{ fontFamily: "var(--font-patrick-hand), cursive" }}>
                {draftProfileName.trim() || "tu nombre"}
              </span>
            </div>

            {/* name input */}
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-white/60">Tu nombre</span>
              <Input
                value={draftProfileName}
                onChange={(e) => setDraftProfileName(e.target.value)}
                placeholder="p. ej. Bea"
                maxLength={24}
                className="border-white/15 bg-white/5 text-white placeholder:text-white/30"
              />
            </label>

            {/* avatar picker */}
            <div>
              <span className="mb-1.5 block text-[12px] font-medium text-white/60">Elige un avatar <Smile size={12} className="inline" /></span>
              <div className="grid grid-cols-6 gap-1.5">
                {AVATAR_CHOICES.map((a) => {
                  const sel = draftProfileAvatar === a.emoji;
                  return (
                    <button
                      key={a.emoji}
                      type="button"
                      onClick={() => { setDraftProfileAvatar(a.emoji); setDraftProfileColor(a.color); }}
                      className={`flex h-11 items-center justify-center rounded-full text-2xl transition-all ${sel ? "scale-110 ring-2 ring-white" : "opacity-60 hover:opacity-100"}`}
                      style={{ background: a.color }}
                      aria-label={`Avatar ${a.emoji}`}
                    >
                      {a.emoji}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* accent color picker — quick palette */}
            <div>
              <span className="mb-1.5 block text-[12px] font-medium text-white/60">Color de acento</span>
              <div className="flex flex-wrap gap-1.5">
                {["#3b82f6", "#ffe94a", "#39ff14", "#ff4fa3", "#9d4dff", "#ff8a3d"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setDraftProfileColor(c)}
                    aria-label={`Acento ${c}`}
                    className={`h-7 w-7 rounded-full transition-all ${draftProfileColor === c ? "scale-110 ring-2 ring-white" : "opacity-70 hover:opacity-100"}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-neutral-900/95 p-4 backdrop-blur">
            <button
              type="button"
              onClick={saveProfile}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ffe94a] py-3 text-center text-[15px] font-bold text-[#0b0b0c] transition-transform active:scale-[0.98]"
            >
              <Save size={16} /> Guardar perfil
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Focus mode overlay */}
      {focusMode && focusTask && (
        <div className="tb-focus-bg fixed inset-0 z-[55] flex flex-col items-center justify-center px-6" style={{ background: "rgba(11,11,12,0.88)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }} onClick={() => setFocusMode(false)}>
          <div className="tb-focus-card w-full max-w-[340px] rounded-2xl p-6 text-[#111] relative" style={{ background: focusTask.color, boxShadow: "6px 8px 0 rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4)", fontFamily: "var(--font-patrick-hand), cursive", transform: "rotate(-1deg)" }} onClick={(e) => e.stopPropagation()}>
            {/* tag + close */}
            <div className="flex items-start justify-between">
              <span className="text-4xl">{focusTask.emoji}</span>
              <button type="button" onClick={() => setFocusMode(false)} aria-label="Salir del modo enfoque" className="flex h-7 w-7 items-center justify-center rounded-full bg-black/20 text-white/80 hover:bg-black/40">
                <X size={14} />
              </button>
            </div>
            <h2 className="mt-3 text-[22px] leading-tight font-bold">{focusTask.title}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/80 px-3 py-1 text-[13px] font-medium text-white"><Clock size={12} /> {focusTask.startTime} - {focusTask.endTime}</span>
              <span className="inline-flex items-center rounded-full bg-black/80 px-3 py-1 text-[13px] font-medium text-white">en {focusTask.duration}min</span>
              {focusTask.tag && TAG_MAP[focusTask.tag] && (
                <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-bold" style={{ background: "rgba(255,255,255,0.9)", color: TAG_MAP[focusTask.tag].color }}>
                  <Tag size={10} />{TAG_MAP[focusTask.tag].label}
                </span>
              )}
            </div>
            <button type="button" onClick={() => { toggleComplete(focusTask); setFocusMode(false); }} className="mt-4 w-full rounded-full bg-black/85 py-3 text-center text-[15px] font-bold text-white transition-transform active:scale-95">
              <span className="inline-flex items-center gap-2"><Check size={16} /> Marcar como hecha</span>
            </button>
          </div>
          <p className="mt-4 text-[14px] text-white/50" style={{ fontFamily: "var(--font-caveat), cursive", fontSize: "18px" }}>toca cualquier sitio o pulsa Esc para salir del enfoque</p>
        </div>
      )}

      <Confetti show={showConfetti} />

      {/* Bleach dialogue toast + achievement overlay */}
      <BleachDialogue dialogue={bleachDialogue} onDismiss={() => setBleachDialogue(null)} />
      <BleachAchievement achievement={bleachAchievement} onDismiss={() => setBleachAchievement(null)} />
    </div>
  );
}

/* helpers for the action-sheet move buttons */
function canMoveUp(task, list) {
  if (!task) return false;
  const idx = list.findIndex((t) => t.id === task.id);
  return idx > 0;
}
function canMoveDown(task, list) {
  if (!task) return false;
  const idx = list.findIndex((t) => t.id === task.id);
  return idx >= 0 && idx < list.length - 1;
}
