"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
const NEON_COLORS = ["#6BE05A", "#FAFF6B", "#FF0A8C", "#9333FF", "#FFA8E6", "#FF8A3D"];

/* Polígonos clip-path por índice (% 6) — formas orgánicas recortadas a mano */
const PAPER_SHAPES = [
  "polygon(1% 4%,20% 1%,48% 3%,78% 0%,99% 3%,97% 30%,99% 62%,96% 96%,70% 99%,38% 96%,10% 100%,3% 70%,0% 36%)",
  "polygon(0% 2%,30% 4%,62% 0%,100% 5%,98% 40%,100% 74%,95% 100%,62% 97%,30% 100%,4% 96%,2% 60%,0% 30%)",
  "polygon(3% 0%,36% 3%,70% 1%,99% 4%,100% 36%,96% 66%,99% 98%,64% 100%,32% 97%,1% 99%,4% 62%,1% 28%)",
  "polygon(1% 5%,28% 0%,58% 4%,98% 1%,96% 34%,100% 68%,97% 97%,66% 100%,34% 96%,0% 98%,3% 64%,0% 32%)",
  "polygon(0% 0%,34% 4%,66% 1%,100% 6%,97% 38%,99% 70%,94% 99%,60% 96%,28% 100%,3% 97%,1% 62%,3% 30%)",
  "polygon(2% 3%,32% 0%,64% 5%,99% 2%,99% 34%,96% 68%,100% 100%,66% 96%,34% 99%,0% 95%,3% 60%,0% 28%)",
];

/* Rotación por índice en grados */
const CARD_ROTATIONS = [-1.2, 1, -0.8, 1.4, -1.5, 0.9];

/* Colores de card oscuros (texto blanco) vs claros (texto negro) */
const DARK_CARDS = new Set(["#FF0A8C", "#9333FF"]);

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
  { id: 6, title: "Paseo nocturno + podcast junto al río", emoji: "🎧", color: NEON_COLORS[5], startTime: "6pm", endTime: "6:30pm", duration: 30, rotation: 1, tag: "health", priority: 2, recurrence: "daily", subtasks: [] },
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

/* ArrowLayer — un único SVG con un solo <path> que dibuja todas las flechas.
   Mide las posiciones reales de las .card con getBoundingClientRect. */
function ArrowLayer({ containerRef, deps = [] }) {
  const svgRef = useRef(null);
  const pathRef = useRef(null);

  const draw = useCallback(() => {
    const list = containerRef.current;
    const svg = svgRef.current;
    const path = pathRef.current;
    if (!list || !svg || !path) return;
    const cards = list.querySelectorAll(".card");
    if (cards.length < 2) { path.setAttribute("d", ""); return; }

    var L = list.getBoundingClientRect(), d = "";
    function R(el) {
      var r = el.getBoundingClientRect();
      return {
        l: r.left - L.left, r: r.right - L.left,
        t: r.top - L.top, b: r.bottom - L.top,
        c: (r.left + r.right) / 2 - L.left,
      };
    }
    for (var i = 0; i < cards.length - 1; i++) {
      var A = R(cards[i]), B = R(cards[i + 1]), dir = B.c > A.c ? 1 : -1;
      var Ey = B.t - 22, Sy = Math.max(Ey - 34, A.t + 0.2 * (A.b - A.t));
      var Sx = dir > 0 ? A.r + 14 : A.l - 14, Ex = Sx + dir * 52;
      d += "M" + Sx + " " + Sy + " C" + (Sx + dir * 30) + " " + Sy + " " +
        Ex + " " + (Ey - 28) + " " + Ex + " " + Ey +
        " M" + (Ex - 9) + " " + (Ey - 13) + " L" + Ex + " " + Ey +
        " L" + (Ex + 9) + " " + (Ey - 13);
    }
    svg.setAttribute("viewBox", "0 0 " + L.width + " " + L.height);
    path.setAttribute("d", d);
  }, [containerRef]);

  useLayoutEffect(() => {
    draw();
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => draw());
    const ro = new ResizeObserver(() => draw());
    if (containerRef.current) ro.observe(containerRef.current);
    // Forzar redraw después de que todo se asiente (imágenes, fuentes, layout)
    const t1 = setTimeout(() => draw(), 300);
    const t2 = setTimeout(() => draw(), 1000);
    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [draw, containerRef, deps]);

  return (
    <svg
      ref={svgRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none", overflow: "visible" }}
      fill="none"
      aria-hidden="true"
    >
      <path
        ref={pathRef}
        d=""
        fill="none"
        stroke="#e2607c"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  );
}

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

function FlowerDoodle({ className = "", style }) {
  return (
    <svg viewBox="0 0 120 200" className={className} style={style} fill="none" aria-hidden="true">
      <g fill="none" stroke="#1E6BFF" strokeWidth="3">
        <circle cx="60" cy="26" r="16" /><circle cx="81.9" cy="33.9" r="16" />
        <circle cx="93.5" cy="54.1" r="16" /><circle cx="89.4" cy="77" r="16" />
        <circle cx="71.6" cy="91.9" r="16" /><circle cx="48.4" cy="91.9" r="16" />
        <circle cx="30.6" cy="77" r="16" /><circle cx="26.5" cy="54.1" r="16" />
        <circle cx="38.1" cy="33.9" r="16" />
      </g>
      <circle cx="60" cy="60" r="28" fill="#F5E94A" />
      <path d="M43 56q6-8 12 0M65 56q6-8 12 0M50 68q10 10 20 0" fill="none" stroke="#111" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="42" cy="67" r="4" fill="#FF9AC8" />
      <circle cx="78" cy="67" r="4" fill="#FF9AC8" />
      <g fill="none" stroke="#4ADE50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M60 90C56 120 66 150 60 190M60 190l-9-16M60 190l9-16" />
        <path d="M62 128C82 128 96 118 100 104M100 104l-7 3M100 104l2 8" />
        <path d="M59 152C44 152 34 146 28 134M28 134l8 1M28 134l1 8" />
      </g>
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

/* DoodleFrame y BgDoodles eliminados — sin restos decorativos sueltos */
function DoodleFrame() { return null; }
function BgDoodles() { return null; }

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
            <span className="block truncate px-0.5 text-center text-[8px] leading-tight text-[#000000]" style={{ fontFamily: "var(--font-patrick-hand), cursive" }}>
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
  const editTask = useCallback(() => onEdit(task), [onEdit, task]);
  // Toque corto = abrir editor. Long-press = abrir menú de acciones.
  const lp = useLongPress(openMenu, editTask);

  const isDark = DARK_CARDS.has(task.color);
  const textColor = isDark ? "#fff" : "#111";
  const pillBg = task.color === "#FAFF6B" ? "#E6C200" : "rgba(255,255,255,0.28)";
  const dotBg = task.color === "#FAFF6B" ? "#E6C200" : "rgba(255,255,255,0.4)";
  // cards 2,4,6 (índices 1,3,5) van a la derecha
  const isRight = index % 2 === 1;

  return (
    <div
      className="tb-card-anim group card"
      data-card-index={index}
      style={{
        position: "relative",
        zIndex: 1,
        width: "48%",
        marginTop: index === 0 ? 0 : "34px",
        marginLeft: isRight ? "auto" : 0,
        transform: `rotate(${CARD_ROTATIONS[index % 6]}deg)`,
      }}
    >
      <div
        className="paper"
        style={{
          padding: "16px 20px",
          minHeight: "84px",
          background: task.color,
          clipPath: PAPER_SHAPES[index % 6],
          color: textColor,
          fontFamily: "var(--font-patrick-hand), cursive",
          display: "block",
          width: "100%",
          textAlign: "left",
          border: "none",
          borderRadius: 0,
          boxShadow: "none",
          filter: "none",
          opacity: 1,
        }}
      >
        {/* Cuerpo interactivo: emoji, título, pills — abre editor al click, menú al long-press */}
        <button
          type="button"
          onClick={lp.onClick}
          onPointerDown={lp.onPointerDown}
          onPointerMove={lp.onPointerMove}
          onPointerUp={lp.onPointerUp}
          onPointerCancel={lp.onPointerCancel}
          onContextMenu={lp.onContextMenu}
          aria-label={isDone ? `Marcar «${task.title}» como no hecha` : `Marcar «${task.title}» como hecha`}
          className="tb-body"
          style={{ width: "100%", background: "none", border: "0", padding: "0", margin: "0", textAlign: "left", color: "inherit", font: "inherit", cursor: "pointer", display: "block" }}
        >
          {/* emoji float:left */}
          <span style={{ float: "left", fontSize: "30px", lineHeight: "1", margin: "0 8px 2px 0" }}>{task.emoji}</span>
          {/* título: margin 0 0 10px, font-weight 400, Patrick Hand 15px, line-height 1.3 */}
          <h3 style={{ margin: "0 0 10px", fontWeight: 400, fontSize: "15px", lineHeight: "1.3", wordBreak: "break-word", textDecoration: isDone ? "line-through" : "none" }}>{task.title}</h3>
          {/* fila de pills: clear both, flex nowrap */}
          <div style={{ clear: "both", display: "flex", alignItems: "center", gap: "4px", flexWrap: "nowrap", whiteSpace: "nowrap" }}>
            <span className="pill" style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "99px", background: pillBg, fontSize: "10.5px" }}>
              <Clock size={10} strokeWidth={2.5} />{task.startTime} - {task.endTime}
            </span>
            {/* punto 4x4 entre pills */}
            <span style={{ display: "inline-block", width: "4px", height: "4px", borderRadius: "50%", background: dotBg, flexShrink: 0 }} />
            <span className="pill" style={{ display: "inline-flex", alignItems: "center", padding: "3px 8px", borderRadius: "99px", background: pillBg, fontSize: "10.5px" }}>en {task.duration}min</span>
          </div>
        </button>

        {/* Checklist — hermano de .tb-body, no adentro */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div style={{ marginTop: "8px", padding: "8px 10px", borderRadius: "10px", background: "rgba(0,0,0,0.16)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "9px", letterSpacing: "0.08em", opacity: 0.7, textTransform: "uppercase", color: textColor }}>Checklist</span>
              <span style={{ fontSize: "9px", opacity: 0.7, color: textColor }}>{task.subtasks.filter(s => s.done).length}/{task.subtasks.length}</span>
            </div>
            {/* barra de progreso */}
            <div style={{ height: "3px", borderRadius: "999px", background: "rgba(0,0,0,0.18)", marginBottom: "6px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(task.subtasks.filter(s => s.done).length / task.subtasks.length) * 100}%`, background: textColor, borderRadius: "999px", transition: "width 0.3s ease" }} />
            </div>
            {/* items (hasta 5) */}
            {task.subtasks.slice(0, 5).map((s) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={s.done}
                  onClick={(e) => { e.stopPropagation(); onToggleSubtask(task.id, s.id); }}
                  style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer", padding: "0", flexShrink: 0 }}
                >
                  <span style={{ width: "14px", height: "14px", borderRadius: "3px", border: `1.5px solid ${textColor}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {s.done && <Check size={10} strokeWidth={3} style={{ color: textColor }} />}
                  </span>
                </button>
                <span style={{ fontSize: "12px", color: textColor, textDecoration: s.done ? "line-through" : "none", opacity: s.done ? 0.55 : 1, wordBreak: "break-word", lineHeight: "1.3" }}>{s.text}</span>
              </div>
            ))}
            {/* +N más */}
            {task.subtasks.length > 5 && (
              <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(task); }} style={{ fontSize: "11px", color: textColor, opacity: 0.6, background: "none", border: "none", cursor: "pointer", padding: "2px 0" }}>
                +{task.subtasks.length - 5} más
              </button>
            )}
          </div>
        )}
      </div>
      {/* Doodles — hijos del wrapper .card, hermanos de .paper (NUNCA dentro del clip-path) */}
      {index === 1 && (
        <svg className="doodle butterfly" viewBox="0 0 100 100" fill="none" style={{ position: "absolute", pointerEvents: "none", zIndex: 4, opacity: 1, width: "66px", bottom: "calc(100% - 6px)", right: "20%" }} aria-hidden="true">
          <g stroke="#4ADE50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M48 52C30 20 4 22 8 44C10 58 34 62 48 52Z" />
            <path d="M48 56C34 66 18 80 28 88C38 94 46 76 48 62" />
            <path d="M52 52C70 20 96 22 92 44C90 58 66 62 52 52Z" />
            <path d="M52 56C66 66 82 80 72 88C62 94 54 76 52 62" />
          </g>
          <path d="M45 40L50 16L55 40Z" fill="#FF9AC8" stroke="#111" strokeWidth="1.5" strokeLinejoin="round" />
          <rect x="45" y="40" width="10" height="42" rx="3" fill="#F5E94A" stroke="#111" strokeWidth="1.5" />
          <path d="M45 82L50 95L55 82Z" fill="#E6C200" stroke="#111" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="48" cy="52" r="1.3" fill="#111" />
          <circle cx="52" cy="52" r="1.3" fill="#111" />
          <path d="M48.5 58q1.5 2 3 0" stroke="#111" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )}
      {index === 3 && (
        <svg className="doodle fish" viewBox="0 0 120 100" fill="none" stroke="#F5C518" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", pointerEvents: "none", zIndex: 4, opacity: 1, width: "56px", right: "calc(100% + 14px)", top: "18%" }} aria-hidden="true">
          <path d="M20 52C26 28 62 18 84 34C94 42 96 56 84 68C62 84 28 78 20 52Z" />
          <path d="M92 44L114 28C112 40 112 60 114 72L92 58" />
          <path d="M44 24L50 8L58 22L66 6L72 24" />
          <path d="M48 74L44 90L60 78" />
          <path d="M52 38C58 46 58 58 52 66M62 46q4 4 0 8M72 48q4 4 0 8" />
          <circle cx="34" cy="46" r="3" />
        </svg>
      )}
      {/* Botón redondo de opciones — hermano de .paper, NUNCA dentro del clip-path */}
      <button
        type="button"
        aria-label="Opciones de la tarea"
        aria-haspopup="menu"
        onClick={(e) => { e.stopPropagation(); openMenu(); }}
        style={{
          position: "absolute",
          top: "-8px",
          right: "-8px",
          zIndex: 5,
          width: "40px",
          height: "40px",
          padding: "0",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "--i": index,
        }}
        className="tb-options-btn"
      >
        <span style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "rgba(17,17,17,0.92)",
          border: "1px solid rgba(255,255,255,0.28)",
        }}>
          <MoreHorizontal size={16} strokeWidth={2} className="text-white" />
        </span>
      </button>
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
  const taskListRef = useRef(null);
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
  const [draftSubtasks, setDraftSubtasks] = useState([]);
  const [draftSubtaskText, setDraftSubtaskText] = useState("");

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
  const firstName = displayName.split(" ")[0];

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
    setDraftSubtasks([]); setDraftSubtaskText("");
    setAddOpen(true);
  }

  function openEdit(task) {
    setEditingId(task.id);
    setDraftTitle(task.title); setDraftEmoji(task.emoji); setDraftStart(task.startTime); setDraftEnd(task.endTime); setDraftDuration(task.duration); setDraftTag(task.tag || "work"); setDraftPriority(task.priority || 2); setDraftRecurrence(task.recurrence || "none");
    setDraftSubtasks(task.subtasks ? task.subtasks.map(s => ({ ...s })) : []); setDraftSubtaskText("");
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
      setTaskList((prev) => prev.map((t) => t.id === editingId ? { ...t, title: trimmed, emoji: draftEmoji, startTime: draftStart.trim() || "9am", endTime: draftEnd.trim() || "9:30am", duration: Number(draftDuration) || 30, tag: draftTag, priority: draftPriority, recurrence: draftRecurrence, subtasks: draftSubtasks } : t));
      toast({ title: "Guardado ✏️", description: `«${trimmed}» actualizada.` }); showBleachDialogue("save");
    } else {
      pushUndo(`Añadir «${trimmed}»`);
      const color = NEON_COLORS[taskList.length % NEON_COLORS.length];
      const rotation = Math.round(Math.random() * 6 - 3);
      setTaskList((prev) => [...prev, { id: Date.now(), title: trimmed, emoji: draftEmoji, color, startTime: draftStart.trim() || "9am", endTime: draftEnd.trim() || "9:30am", duration: Number(draftDuration) || 30, rotation, tag: draftTag, priority: draftPriority, recurrence: draftRecurrence, subtasks: draftSubtasks }]);
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
        html, body { background-color: #000000; }
        html.tb-theme-light, html.tb-theme-light body { background-color: #f5f1e8; }
        html.tb-theme-dark, html.tb-theme-dark body { background-color: #000000; }

        .tb-theme-light { --tb-bg: #f5f1e8; --tb-text: #1a1a2e; --tb-card-text: #1a1a2e; --tb-muted: rgba(26,26,46,0.55); --tb-border: rgba(26,26,46,0.15); --tb-surface: rgba(255,255,255,0.7); --tb-header-text: #1a1a2e; --tb-watermark: rgba(0,0,0,0.04); }
        .tb-theme-dark  { --tb-bg: #000000; --tb-text: #fff; --tb-card-text: #111; --tb-muted: rgba(255,255,255,0.55); --tb-border: rgba(255,255,255,0.1); --tb-surface: rgba(23,23,23,0.7); --tb-header-text: #fff; --tb-watermark: rgba(255,255,255,0.04); }

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

        /* focus-visible en el botón .tb-body para accesibilidad */
        .tb-body:focus-visible { outline: 2px solid #fff !important; outline-offset: 2px; }

        /* Botón redondo de opciones — animación pop + hover/active + focus-visible */
        @keyframes tb-pop { 0% { transform: scale(0.4); opacity: 0; } 70% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); } }
        .tb-options-btn { animation: tb-pop 260ms cubic-bezier(0.2, 1.4, 0.4, 1) both; animation-delay: calc(var(--i, 0) * 60ms); transition: transform 120ms; }
        .tb-options-btn:hover { transform: scale(1.08); }
        .tb-options-btn:active { transform: scale(0.9); }
        .tb-options-btn:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          .tb-options-btn { animation: none !important; transition: none !important; }
        }

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

        {/* Header — minimalista como la referencia "Hello Bea" */}
        <header className="relative px-6 pb-3 pt-10">
          {/* Flor — esquina superior derecha, grande, con cara sonriente, z-index por debajo del texto */}
          <FlowerDoodle className="pointer-events-none" style={{ position: "absolute", top: "42px", right: "28px", width: "92px", height: "143px", zIndex: 0 }} />

          {/* Saludo: Inter 700, 44px, line-height 1, letter-spacing -0.03em, #fff */}
          <h1 className="relative z-[2] text-white" style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "44px", fontWeight: 700, lineHeight: "1", letterSpacing: "-0.03em", maxWidth: "60%" }}>
            Hola {firstName}
          </h1>

          {/* Subtítulo: Gochi Hand, 28px, line-height 1.25, #8c8c8c, "X tareas" en #fff */}
          <p className="relative z-[2] mt-2" style={{ fontFamily: "var(--font-gochi-hand), cursive", fontSize: "28px", lineHeight: "1.25", color: "#8c8c8c", maxWidth: "70%" }}>
            {remaining === 0 ? (
              <span style={{ color: "#fff" }}>¡Todo listo hoy!</span>
            ) : (
              <>
                Te quedan <span style={{ color: "#fff" }}>{remaining} tareas</span><br />
                por completar hoy..
              </>
            )}
          </p>

          {/* Botón azul: Gochi Hand 20px */}
          <div className="mt-8 mb-[26px] flex justify-center">
            <div className="px-5 py-1.5" style={{ background: "#0EA5E9", transform: "skewX(-12deg)" }}>
              <span className="text-white" style={{ fontFamily: "var(--font-gochi-hand), cursive", fontSize: "20px", display: "inline-block", transform: "skewX(12deg)" }}>What's on deck today</span>
            </div>
          </div>

          {/* undo button (solo si hay acciones) */}
          {undoStack.length > 0 && (
            <button type="button" onClick={undo} aria-label="Deshacer" title="Deshacer (Ctrl/Cmd+Z)" className="absolute bottom-2 left-2 z-[3] flex h-8 w-8 items-center justify-center rounded-full border border-[#ffe94a]/40 bg-[#ffe94a]/15 text-[#ffe94a]">
              <Undo2 size={14} />
            </button>
          )}

          {/* botones flotantes: editar nombre + compartir WhatsApp */}
          <div className="absolute bottom-2 right-2 z-[3] flex items-center gap-2">
            <button type="button" onClick={openProfile} aria-label="Editar nombre" title="Editar tu nombre" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/70 transition-colors hover:bg-white/20">
              <PencilLine size={14} />
            </button>
            <button type="button" onClick={() => {
              const text = `🗒️ *NotesApp Deivid Uchiha*\n\n¡Hola! Soy ${firstName} y uso esta app de tareas con notas adhesivas, logros de Bleach y checklist.\n\nPruébala: https://github.com/deivid2025/NotesApp-NicolGaray\n\nHecha con 💛`;
              const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
              window.open(url, "_blank");
            }} aria-label="Compartir en WhatsApp" title="Compartir en WhatsApp" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#25D366]/40 bg-[#25D366]/15 text-[#25D366] transition-transform hover:scale-110 active:scale-95">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.149-.197.297-.767.967-.94 1.165-.173.199-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </button>
          </div>
        </header>

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

        {/* Task list — contenedor relative con ArrowLayer */}
        <div className="px-4 relative" style={{ paddingBottom: "170px" }} ref={taskListRef}>
          <ArrowLayer containerRef={taskListRef} deps={[visibleTasks.length, completedIds.size]} />
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
            const isDone = completedIds.has(task.id);
            const isNextUp = nextUpId === task.id;
            const status = taskStatus(task, isDone, now);
            return (
              <StickyNote
                key={task.id}
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
                onToggleSubtask={toggleSubtask}
              />
            );
          })}
        </div>

        {/* Tomorrow peek — oculto por defecto (se muestra cuando el panel está abierto) */}
        {tomorrowPeek.length > 0 && filter === "all" && !searchQuery && (
          <div className="px-4 pb-32" style={{ display: "none" }}>
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
                      <span className="rounded-full bg-[#ff4fa3] px-1.5 py-0.5 text-[9px] font-bold text-[#000000]">P1</span>
                    )}
                  </div>
                ))}
                <p className="mt-1 px-2 text-[12px] tb-themed-muted" style={{ fontFamily: "'Caveat', cursive", fontSize: "14px" }}>tareas vespertinas + urgentes que pueden pasar a mañana..</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fade inferior */}
      <div className="fade" style={{ position: "fixed", left: 0, right: 0, bottom: 0, height: "110px", background: "linear-gradient(transparent, #000 85%)", pointerEvents: "none", zIndex: 5 }} aria-hidden="true" />

      {/* Barra inferior — una cápsula .glass con filtro+reloj, una cápsula .glass.plus con "+" */}
      <div className="bar" style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", width: "min(440px, 100%)", bottom: "calc(16px + env(safe-area-inset-bottom, 0px))", display: "flex", justifyContent: "space-between", padding: "0 16px", zIndex: 6, pointerEvents: "none" }}>
        <div className="glass pair" style={{ pointerEvents: "auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "18px", height: "44px", borderRadius: "22px", background: "rgba(30,30,30,0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.14)", padding: "0 20px" }}>
          <button type="button" onClick={() => setFilterOpen(true)} aria-label="Filtrar tareas" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}><Filter size={18} strokeWidth={1.5} className="text-white" /></button>
          <button type="button" onClick={jumpToNextUp} aria-label="Saltar a la siguiente tarea" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}><Clock size={18} strokeWidth={1.5} className="text-white" /></button>
        </div>
        <button type="button" onClick={openAdd} aria-label="Añadir tarea" className="glass plus" style={{ pointerEvents: "auto", display: "flex", alignItems: "center", justifyContent: "center", height: "44px", width: "64px", borderRadius: "22px", background: "rgba(30,30,30,0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.14)", cursor: "pointer", padding: "0", gap: "0" }}><Plus size={18} strokeWidth={1.5} className="text-white" /></button>
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
            {/* Checklist */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="block text-[12px] font-medium text-white/60">Checklist</span>
                <span className="text-[11px] text-white/40">{draftSubtasks.filter(s => s.done).length}/{draftSubtasks.length}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {draftSubtasks.map((s, si) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <button type="button" onClick={() => setDraftSubtasks(prev => prev.map((x, xi) => xi === si ? { ...x, done: !x.done } : x))} className="flex h-6 w-6 shrink-0 items-center justify-center rounded border" style={{ borderColor: s.done ? "#39ff14" : "rgba(255,255,255,0.25)", background: s.done ? "rgba(57,255,20,0.15)" : "transparent" }}>
                      {s.done && <Check size={12} className="text-[#39ff14]" />}
                    </button>
                    <input value={s.text} onChange={(e) => setDraftSubtasks(prev => prev.map((x, xi) => xi === si ? { ...x, text: e.target.value } : x))} className="flex-1 rounded border border-white/10 bg-white/5 px-2 py-1 text-[13px] text-white" />
                    <button type="button" onClick={() => setDraftSubtasks(prev => prev.filter((_, xi) => xi !== si))} className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-white/40 hover:text-[#ff4fa3]"><X size={14} /></button>
                  </div>
                ))}
                {draftSubtasks.length < 20 && (
                  <div className="flex items-center gap-2">
                    <input value={draftSubtaskText} onChange={(e) => setDraftSubtaskText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const t = draftSubtaskText.trim(); if (t) { setDraftSubtasks(prev => [...prev, { id: `s${Date.now()}`, text: t, done: false }]); setDraftSubtaskText(""); } } }} placeholder="Agregar un paso…" className="flex-1 rounded border border-white/10 bg-white/5 px-2 py-1 text-[13px] text-white placeholder:text-white/30" />
                    <button type="button" onClick={() => { const t = draftSubtaskText.trim(); if (t) { setDraftSubtasks(prev => [...prev, { id: `s${Date.now()}`, text: t, done: false }]); setDraftSubtaskText(""); } }} className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white/10 text-white hover:bg-white/20"><Plus size={14} /></button>
                  </div>
                )}
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
                    <button key={p.id} type="button" onClick={() => setDraftPriority(p.id)} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[13px] font-bold transition-colors ${sel ? "text-[#000000]" : "text-white/70 hover:bg-white/10"}`} style={sel ? { background: p.color } : { background: "rgba(255,255,255,0.05)" }}>
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
                    <button key={r.id} type="button" onClick={() => setDraftRecurrence(r.id)} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[13px] font-bold transition-colors ${sel ? "text-[#000000]" : "text-white/70 hover:bg-white/10"}`} style={sel ? { background: r.color } : { background: "rgba(255,255,255,0.05)" }}>
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
            <button type="button" onClick={handleSave} className="flex-1 rounded-full bg-[#ffe94a] py-3 text-center text-[15px] font-bold text-[#000000] transition-transform active:scale-[0.98]">{editingId ? "Guardar cambios" : "Añadir al tablero de hoy"}</button>
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
                <button type="button" onClick={() => setActiveTag("all")} className={`rounded-full px-3 py-1 text-[13px] transition-colors ${activeTag === "all" ? "bg-white text-[#000000]" : "bg-white/5 text-white/70 hover:bg-white/10"}`}>Todas las etiquetas</button>
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
            <AlertDialogAction onClick={resetDemo} className="bg-[#ffe94a] text-[#000000] hover:bg-[#ffe94a]/90">Reiniciar</AlertDialogAction>
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
            <AlertDialogAction className="bg-[#ffe94a] text-[#000000] hover:bg-[#ffe94a]/90" onClick={() => setShortcutsOpen(false)}>Entendido</AlertDialogAction>
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
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ffe94a] py-3 text-center text-[15px] font-bold text-[#000000] transition-transform active:scale-[0.98]"
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
