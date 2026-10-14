/**
 * Bleach-themed content: Spanish dialogues + achievement definitions + sound effects.
 * Characters: Ichigo Kurosaki, Rukia Kuchiki, Orihime Inoue, Uryū Ishida.
 *
 * NOTE ON LICENSING: Bleach and its characters are © Tite Kubo / Shueisha / Pierrot.
 * This module uses ONLY text-based references (character names + original dialogue
 * lines written in the spirit of the characters). No copyrighted images, sprites,
 * audio, or artwork are included. For commercial publication, replace character
 * names/likenesses with original characters, or obtain proper licensing.
 */

/* ── Characters ────────────────────────────────────────────────────────── */

export const CHARACTERS = {
  ichigo:   { name: "Ichigo",  color: "#ff8a3d", emoji: "⚔️", image: "/characters/ichigo-celebrando.png", imageAlt: "/characters/ichigo-epico.png", imageAngry: "/characters/ichigo-enojado.png" },
  rukia:    { name: "Rukia",   color: "#3b82f6", emoji: "❄️", image: "/characters/rukia-calmada.png", imageTeach: "/characters/rukia-ensenando.png" },
  orihime:  { name: "Orihime", color: "#ff4fa3", emoji: "🌸", image: "/characters/orihime-alegre.png", imageHeal: "/characters/orihime-curando.png" },
  ishida:   { name: "Uryū",    color: "#9d4dff", emoji: "🏹", image: "/characters/uryu-enfocado.png" },
};

/* Group images: team celebrating / team resting. Used in empty-state and all-done. */
export const GROUP_IMAGE = "/characters/equipo-celebracion.png";
export const GROUP_EMPTY_IMAGE = "/characters/equipo-vacio.png";

/* ── Contextual dialogues (Spanish) ────────────────────────────────────── */
/* Each context has multiple variants; pick one at random to avoid repetition. */

export const DIALOGUES = {
  // Tarea completada
  complete: [
    { who: "rukia",   line: "Vaya, no esperaba que lo consiguieras tan rápido." },
    { who: "ichigo",  line: "¡Ja! ¡Sabía que podías hacerlo! ¡Vamos por el siguiente!" },
    { who: "orihime", line: "¡Lo lograste! ¡Eso merece un bollo de masa dulce!" },
    { who: "ishida",  line: "Impresionante precisión. No esperaba menos." },
  ],
  // Error / tarea fallida
  fail: [
    { who: "ichigo",  line: "¡¿Qué has hecho, zopenco?! ¡¿Cómo has conseguido fallar eso?!" },
    { who: "rukia",   line: "Ichigo, deja de gritar y explícale qué tiene que corregir." },
    { who: "ichigo",  line: "¡Está bien! Vamos otra vez. ¡Esta vez no puedes fallar!" },
    { who: "ishida",  line: "Un descuido inaceptable. Ajusta tu puntería y reinténtalo." },
    { who: "orihime", line: "¡No te rindas! ¡Yo creo en ti, aunque Ichigo grite!" },
  ],
  // Racha de progreso (streak)
  streak: [
    { who: "ichigo",  line: "¡Una racha! ¡Esto es mejor que un Bankai!" },
    { who: "rukia",   line: "Mantén el ritmo. Un Shinigami nunca baja la guardia." },
    { who: "ishida",  line: "Racha impresionante. ¿Acaso estás compitiendo conmigo?" },
  ],
  // Tarea añadida
  add: [
    { who: "rukia",   line: "Nueva misión registrada. No la dejes para después." },
    { who: "ichigo",  line: "¡Otra más! ¡Vamos a por todas!" },
    { who: "orihime", line: "¡Un nuevo objetivo! ¡Tú puedes con eso!" },
  ],
  // Todo completado (all done)
  all_done: [
    { who: "ichigo",  line: "¡Lo lograste! ¡Eso fue digno de un Getsuga Tenshō!" },
    { who: "rukia",   line: "Misión cumplida. Has protegido tu día como un verdadero Shinigami." },
    { who: "orihime", line: "¡Increíble! ¡Voy a curar tu cansancio con Sōten Kisshun!" },
    { who: "ishida",  line: "Impecable. Cada tarea, completada con precisión." },
  ],
  // Nada pendiente / inbox zero
  empty: [
    { who: "rukia",   line: "No hay misiones pendientes. Aprovecha para descansar." },
    { who: "ichigo",  line: "¿¿No hay nada?? ¡Pues a entrenar, no te quedes parado!" },
    { who: "orihime", line: "Un día tranquilo... ¡perfecto para un picnic!" },
  ],
  // Regreso después de tiempo
  return_back: [
    { who: "rukia",   line: "Has vuelto. El Mundo Humano te necesitaba." },
    { who: "ichigo",  line: "¡Por fin apareces! ¡Ya era hora de que regresaras!" },
    { who: "orihime", line: "¡Qué alegría verte de nuevo! Te extrañábamos." },
  ],
  // Logro desbloqueado
  achievement: [
    { who: "ichigo",  line: "¡Eso es! ¡Has desbloqueado algo grande!" },
    { who: "rukia",   line: "Un logro digno de un Teniente. Sigue así." },
    { who: "ishida",  line: "Logro desbloqueado. Tu destreza es notable." },
    { who: "orihime", line: "¡Felicidades! ¡Eso hay que celebrarlo!" },
  ],
  // Editar / guardar
  save: [
    { who: "rukia",   line: "Cambios guardados. No hay marcha atrás ahora." },
    { who: "ichigo",  line: "¡Listo! ¡A por la siguiente misión!" },
  ],
};

/* ── Achievement definitions ───────────────────────────────────────────── */
/* Tiers: "common" (small spark), "special" (energy burst), "extraordinary" (full Bankai). */

export const ACHIEVEMENTS = [
  { id: "first_blood",   title: "Primer Corte",       desc: "Completa tu primera tarea.",        tier: "common",        icon: "⚔️", image: "/characters/ichigo-celebrando.png" },
  { id: "shinigami",     title: "Shinigami Sustituto", desc: "Completa 5 tareas.",               tier: "common",        icon: "💀", image: "/characters/ichigo-celebrando.png" },
  { id: "bankai",        title: "¡BANKAI!",            desc: "Completa todas las tareas del día.", tier: "extraordinary", icon: "🔥", image: "/characters/ichigo-epico.png" },
  { id: "streak_3",      title: "Racha de 3",          desc: "Limpia el tablero 3 días seguidos.", tier: "special",       icon: "⚡", image: "/characters/ichigo-epico.png" },
  { id: "streak_7",      title: "Séptima División",    desc: "Limpia el tablero 7 días seguidos.", tier: "extraordinary", icon: "🌀", image: "/characters/ichigo-epico.png" },
  { id: "archer",        title: "Puntería de Uryū",    desc: "Crea 10 tareas.",                    tier: "special",       icon: "🏹", image: "/characters/uryu-enfocado.png" },
  { id: "healer",        title: "Manos de Orihime",    desc: "Desmarca una tarea completada (corrige).", tier: "common",  icon: "🌸", image: "/characters/orihime-curando.png" },
  { id: "focus_master",  title: "Modo Enfoque",        desc: "Usa el modo enfoque por primera vez.", tier: "common",      icon: "🎯", image: "/characters/uryu-enfocado.png" },
  { id: "night_owl",     title: "Patrulla Nocturna",   desc: "Usa la app de noche (21h-5h).",     tier: "special",       icon: "🌙", image: "/characters/rukia-calmada.png" },
  { id: "early_bird",    title: "Alma Madrugadora",    desc: "Usa la app al amanecer (5h-8h).",   tier: "special",       icon: "🌅", image: "/characters/orihime-alegre.png" },
];

export const TIER_META = {
  common:        { label: "Común",          color: "#39ff14", effect: "spark" },
  special:       { label: "Especial",       color: "#ffe94a", effect: "burst" },
  extraordinary: { label: "Extraordinario", color: "#ff4fa3", effect: "bankai" },
};

/* ── Sound effects (Web Audio) ─────────────────────────────────────────── */
/* Short, original tones inspired by anime energy sounds (no copyrighted audio).
   Upgraded with ADSR envelopes, lowpass filters for warmth, optional detuned
   second oscillator, and richer tier-scaled achievements. */

let __audioCtx = null;
function getAudioCtx() {
  if (typeof window === "undefined") return null;
  if (!__audioCtx) {
    try { __audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch { __audioCtx = null; }
  }
  return __audioCtx;
}

/**
 * Play a single warm tone with an ADSR-style envelope.
 * @param {number}  freq      - target frequency (Hz)
 * @param {number}  duration  - decay length in seconds (default 0.18)
 * @param {string}  type      - oscillator type (default "sine")
 * @param {number}  volume    - peak gain (default 0.06)
 * @param {number}  when      - delay from now in seconds (default 0)
 * @param {object}  opts      - { filterFreq, detune, attack, decay, release, sustainLevel, echo }
 */
function playTone(freq, duration = 0.18, type = "sine", volume = 0.06, when = 0, opts = {}) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const t0 = ctx.currentTime + when;
    const attack = opts.attack ?? 0.012;
    const sustainLevel = opts.sustainLevel ?? 0.55;
    const decay = opts.decay ?? Math.max(0.04, duration * 0.35);
    const release = opts.release ?? 0.06;

    // master gain (ADSR)
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(volume, t0 + attack);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * sustainLevel), t0 + attack + decay);
    gain.gain.setValueAtTime(Math.max(0.0001, volume * sustainLevel), t0 + duration);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration + release);

    // warm lowpass filter (default ~4kHz)
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(opts.filterFreq ?? 4000, t0);
    filter.Q.setValueAtTime(0.8, t0);

    // primary oscillator
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + release + 0.02);

    // optional second detuned oscillator for warmth
    if (opts.detune) {
      const osc2 = ctx.createOscillator();
      osc2.type = type;
      osc2.frequency.setValueAtTime(freq, t0);
      osc2.detune.setValueAtTime(opts.detune, t0);
      osc2.connect(filter);
      osc2.start(t0);
      osc2.stop(t0 + duration + release + 0.02);
    }

    // optional quiet echo (reverb feel)
    if (opts.echo) {
      const eg = ctx.createGain();
      eg.gain.setValueAtTime(0, t0 + opts.echo.delay);
      eg.gain.linearRampToValueAtTime(volume * opts.echo.gain, t0 + opts.echo.delay + attack);
      eg.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.echo.delay + opts.echo.duration);
      const ef = ctx.createBiquadFilter();
      ef.type = "lowpass";
      ef.frequency.setValueAtTime(opts.echo.filterFreq ?? 2200, t0 + opts.echo.delay);
      const eo = ctx.createOscillator();
      eo.type = type;
      eo.frequency.setValueAtTime(opts.echo.freq ?? freq, t0 + opts.echo.delay);
      eo.connect(ef);
      ef.connect(eg);
      eg.connect(ctx.destination);
      eo.start(t0 + opts.echo.delay);
      eo.stop(t0 + opts.echo.delay + opts.echo.duration + 0.05);
    }
  } catch { /* ignore */ }
}

export function playAchievementSound(tier) {
  if (tier === "extraordinary") {
    // BANKAI: dramatic build — low rumble + rising 5-note arpeggio + bright chord sustain
    // low rumble with lowpass sweep
    playTone(80, 0.9, "sawtooth", 0.07, 0, {
      filterFreq: 600, attack: 0.05, decay: 0.4, sustainLevel: 0.6, release: 0.2,
    });
    playTone(95, 0.9, "sawtooth", 0.05, 0.02, {
      filterFreq: 700, detune: 8, attack: 0.05, decay: 0.4, sustainLevel: 0.6, release: 0.2,
    });
    // rising 5-note arpeggio (A2 → E3 → A3 → C#4 → E4 feel, mapped to high octave)
    [523, 659, 784, 988, 1175].forEach((f, i) => {
      playTone(f, 0.16, "triangle", 0.06, 0.12 + i * 0.09, {
        filterFreq: 5000, attack: 0.008, decay: 0.05, sustainLevel: 0.5,
      });
    });
    // final bright chord sustain (C-E-G major)
    [523, 659, 784].forEach((f) => {
      playTone(f, 0.55, "triangle", 0.05, 0.62, {
        filterFreq: 5500, attack: 0.04, decay: 0.2, sustainLevel: 0.7, release: 0.25,
        echo: { delay: 0.18, gain: 0.025, duration: 0.4, freq: f * 2, filterFreq: 3000 },
      });
    });
    // high shimmer
    playTone(2093, 0.5, "sine", 0.025, 0.7, {
      filterFreq: 8000, attack: 0.06, decay: 0.2, sustainLevel: 0.6, release: 0.2,
    });
    return;
  }
  if (tier === "special") {
    // Energy burst: 4-note major chord arpeggio (C-E-G-C) with shimmer + soft bass
    playTone(131, 0.45, "sine", 0.05, 0, {
      filterFreq: 800, attack: 0.02, decay: 0.2, sustainLevel: 0.6, release: 0.15,
    });
    [523, 659, 784, 1047].forEach((f, i) => {
      playTone(f, 0.18, "triangle", 0.06, i * 0.07, {
        filterFreq: 5500, attack: 0.008, decay: 0.05, sustainLevel: 0.5,
        echo: { delay: 0.1, gain: 0.018, duration: 0.25, freq: f * 2, filterFreq: 3500 },
      });
    });
    // shimmer high harmonic
    playTone(1568, 0.35, "sine", 0.025, 0.18, {
      filterFreq: 7000, attack: 0.04, decay: 0.15, sustainLevel: 0.5, release: 0.18,
    });
    return;
  }
  // Common: bright quick 3-note ascending arpeggio blip + sparkle
  [659, 784, 988].forEach((f, i) => {
    playTone(f, 0.07, "triangle", 0.05, i * 0.03, {
      filterFreq: 5000, attack: 0.005, decay: 0.02, sustainLevel: 0.4,
    });
  });
  playTone(1568, 0.08, "sine", 0.02, 0.08, {
    filterFreq: 7000, attack: 0.005, decay: 0.02, sustainLevel: 0.4,
  });
}

export function playCompleteSound() {
  // Pleasant two-note rising chime (E5 → A5) with soft echo + tiny sparkle high harmonic
  playTone(659, 0.18, "triangle", 0.06, 0, {
    filterFreq: 4500, attack: 0.008, decay: 0.06, sustainLevel: 0.55, release: 0.08,
    echo: { delay: 0.14, gain: 0.022, duration: 0.28, filterFreq: 2500 },
  });
  playTone(880, 0.24, "triangle", 0.06, 0.09, {
    filterFreq: 5000, attack: 0.008, decay: 0.07, sustainLevel: 0.55, release: 0.1,
    echo: { delay: 0.14, gain: 0.022, duration: 0.32, filterFreq: 2700 },
  });
  // tiny sparkle high harmonic
  playTone(1760, 0.16, "sine", 0.018, 0.1, {
    filterFreq: 7000, attack: 0.01, decay: 0.05, sustainLevel: 0.4, release: 0.08,
  });
}

export function playFailSound() {
  // Gentle "aww" descending two-note (soft sawtooth with lowpass) — not harsh
  playTone(330, 0.22, "sawtooth", 0.05, 0, {
    filterFreq: 900, attack: 0.02, decay: 0.08, sustainLevel: 0.6, release: 0.1,
  });
  playTone(247, 0.3, "sawtooth", 0.05, 0.13, {
    filterFreq: 700, attack: 0.02, decay: 0.1, sustainLevel: 0.55, release: 0.14,
    detune: -4,
  });
  // soft low undertone
  playTone(165, 0.32, "sine", 0.025, 0.13, {
    filterFreq: 600, attack: 0.03, decay: 0.12, sustainLevel: 0.5, release: 0.15,
  });
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

/**
 * Returns the best character/group image for a given dialogue context.
 * @param {string} context - one of: complete, fail, streak, add, all_done, empty, return_back, achievement, save
 * @param {string} who     - character key (ichigo | rukia | orihime | ishida)
 */
export function getDialogueImage(context, who) {
  const map = {
    complete: who === "ichigo" ? CHARACTERS.ichigo.image : who === "orihime" ? CHARACTERS.orihime.image : who === "ishida" ? CHARACTERS.ishida.image : CHARACTERS.rukia.image,
    fail: who === "ichigo" ? CHARACTERS.ichigo.imageAngry : who === "rukia" ? CHARACTERS.rukia.imageTeach : CHARACTERS.ichigo.imageAngry,
    streak: CHARACTERS.ichigo.imageAlt,
    add: CHARACTERS.rukia.image,
    all_done: GROUP_IMAGE,
    empty: GROUP_EMPTY_IMAGE,
    return_back: GROUP_IMAGE,
    achievement: CHARACTERS[who]?.image || CHARACTERS.ichigo.image,
    save: CHARACTERS.rukia.imageTeach,
  };
  return map[context] || CHARACTERS[who]?.image || CHARACTERS.ichigo.image;
}

export function pickDialogue(context) {
  const pool = DIALOGUES[context] || DIALOGUES.complete;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  // include context so overlays can resolve the best character/group image
  return { ...picked, context };
}
