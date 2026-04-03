import React, { useEffect, useMemo, useRef, useState } from "react";

const LANES = 5;
const START_LIVES = 3;
const MAX_LIVES = 5;
const BOSS_HITS = 5;
const SHIP_LEFT = [10, 28, 46, 64, 82];
const LANE_LEFT = [2, 20, 38, 56, 74];

const LEVELS = [
  { key: "easy", label: "Level 1", speed: 0.42, spawnEvery: 3400, target: 8, maxInvaders: 1 },
  { key: "medium", label: "Level 2", speed: 0.56, spawnEvery: 3000, target: 10, maxInvaders: 1 },
  { key: "hard", label: "Level 3", speed: 0.72, spawnEvery: 2600, target: 12, maxInvaders: 2 },
  { key: "expert", label: "Level 4", speed: 0.42, spawnEvery: 3000, target: 14, maxInvaders: 2 },
  { key: "ledger1", label: "Level 5", speed: 0.42, spawnEvery: 2800, target: 16, maxInvaders: 2 },
  { key: "ledger2", label: "Level 6", speed: 0.42, spawnEvery: 2600, target: 18, maxInvaders: 2 },
  { key: "boss", label: "Boss", speed: 0.32, spawnEvery: 999999, target: 1, maxInvaders: 1 },
  { key: "endless", label: "Endless", speed: 0.55, spawnEvery: 2600, target: 999999, maxInvaders: 2 },
];

const NOTE_COLORS = { C: "#ef4444", D: "#f97316", E: "#fde047", F: "#22c55e", G: "#38bdf8", A: "#3b82f6", B: "#a855f7" };
const BASIC = ["A", "B", "C", "D", "E", "F", "G"];
const ADVANCED = ["A", "B", "C", "D", "E", "F", "G", "A#", "C#", "D#", "F#", "G#", "Bb", "Eb", "Ab"];

const NOTES = {
  treble: [
    { label: "C", line: 9 }, { label: "D", line: 8.5 }, { label: "E", line: 8 }, { label: "F", line: 7.5 },
    { label: "G", line: 7 }, { label: "A", line: 6.5 }, { label: "B", line: 6 }, { label: "C", line: 5.5 },
    { label: "D", line: 5 }, { label: "E", line: 4.5 }, { label: "F", line: 4 }, { label: "G", line: 3.5 }, { label: "A", line: 3 },
  ],
  bass: [
    { label: "E", line: 9 }, { label: "F", line: 8.5 }, { label: "G", line: 8 }, { label: "A", line: 7.5 },
    { label: "B", line: 7 }, { label: "C", line: 6.5 }, { label: "D", line: 6 }, { label: "E", line: 5.5 },
    { label: "F", line: 5 }, { label: "G", line: 4.5 }, { label: "A", line: 4 }, { label: "B", line: 3.5 }, { label: "C", line: 3 },
  ],
};

const styles = {
  page: {
    minHeight: "100vh",
    color: "white",
    background:
      "radial-gradient(circle at 20% 30%, rgba(56,189,248,0.16), transparent 35%), radial-gradient(circle at 80% 20%, rgba(168,85,247,0.2), transparent 35%), radial-gradient(ellipse at bottom, #162138 0%, #020617 72%)",
    fontFamily: "Inter, Arial, sans-serif",
  },
  shell: { maxWidth: 1280, margin: "0 auto", padding: 24 },
  grid: { display: "grid", gridTemplateColumns: "1.4fr 0.8fr", gap: 24, alignItems: "start" },
  card: {
    background: "rgba(15,23,42,0.78)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 28,
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
  },
  subCard: {
    background: "rgba(15,23,42,0.88)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 22,
  },
  button: {
    background: "white",
    color: "#0f172a",
    border: "none",
    borderRadius: 16,
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  ghostButton: {
    background: "transparent",
    color: "white",
    border: "1px solid rgba(255,255,255,0.20)",
    borderRadius: 16,
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  input: {
    width: "100%",
    background: "#020617",
    color: "white",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: "10px 12px",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    background: "#0f172a",
    color: "white",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: "10px 12px",
    boxSizing: "border-box",
  },
};

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function nextLevel(key) {
  const idx = LEVELS.findIndex((x) => x.key === key);
  if (idx < 0 || idx >= LEVELS.length - 2) return "boss";
  return LEVELS[idx + 1].key;
}

function stars(count, min, max) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: min + Math.random() * (max - min),
    opacity: 0.25 + Math.random() * 0.75,
  }));
}

function getQuestions(levelKey, clefMode) {
  const clefs = clefMode === "both" ? ["treble", "bass"] : [clefMode];
  const out = [];
  clefs.forEach((clef) => {
    let notes = NOTES[clef];
    if (["easy", "medium"].includes(levelKey)) notes = notes.filter((n) => n.line >= 4 && n.line <= 8);
    if (levelKey === "ledger1") notes = notes.filter((n) => n.line >= 3.5 && n.line <= 8.5);
    notes.forEach((note) => {
      out.push({ clef, answer: note.label, display: note });
      if (["expert", "ledger1", "ledger2", "boss", "endless"].includes(levelKey)) {
        const sharp = `${note.label}#`;
        const flat = `${note.label}b`;
        if (ADVANCED.includes(sharp)) out.push({ clef, answer: sharp, display: { ...note, accidental: "#" } });
        if (ADVANCED.includes(flat)) out.push({ clef, answer: flat, display: { ...note, accidental: "b" } });
      }
    });
  });
  return out;
}

let audioCtx = null;
function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  return audioCtx;
}

function tone(type, freq, duration, volume) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function beep(kind, scale = 1) {
  const map = {
    fire: ["square", 700, 0.05, 0.05],
    hit: ["square", 900, 0.08, 0.06],
    miss: ["sawtooth", 180, 0.12, 0.06],
    level: ["square", 500, 0.16, 0.06],
    boss: ["sawtooth", 110, 0.2, 0.07],
    thruster: ["sawtooth", 150, 0.07, 0.03],
  };
  const cfg = map[kind];
  if (!cfg) return;
  tone(cfg[0], cfg[1], cfg[2], cfg[3] * scale);
}

function Bar({ value }) {
  return <div style={{ height: 12, borderRadius: 999, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}><div style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: "100%", background: "linear-gradient(90deg, #22c55e, #38bdf8)" }} /></div>;
}

function Staff({ note, clef, boss = false }) {
  const y = 22 + (note.line - 4) * 20;
  const color = NOTE_COLORS[note.label?.[0]] || "white";
  const stemUp = note.line >= 6;
  const topLedgerLines = [];
  for (let l = 8; l <= Math.floor(note.line); l += 1) {
    topLedgerLines.push(102 + (l - 8) * 20);
  }
  const bottomLedgerLines = [];
  for (let l = 4; l >= Math.ceil(note.line); l -= 1) {
    bottomLedgerLines.push(22 - (4 - l) * 20);
  }
  return (
    <div style={{ position: "relative", borderRadius: 18, background: "rgba(2,6,23,0.82)", padding: 12, height: boss ? 156 : 144 }}>
      <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: boss ? 46 : 44 }}>{clef === "treble" ? "𝄞" : "𝄢"}</div>
      <svg viewBox="0 0 300 124" style={{ width: "100%", height: "100%" }}>
        {[22, 42, 62, 82, 102].map((line) => <line key={line} x1="58" x2="286" y1={line} y2={line} stroke="rgba(255,255,255,0.92)" strokeWidth="2.6" />)}
        {topLedgerLines.map((ledgerY, i) => <line key={`top-${i}`} x1="185" x2="225" y1={ledgerY} y2={ledgerY} stroke="white" strokeWidth="2" />)}
        {bottomLedgerLines.map((ledgerY, i) => <line key={`bottom-${i}`} x1="185" x2="225" y1={ledgerY} y2={ledgerY} stroke="white" strokeWidth="2" />)}
        {note.accidental === "#" && <g transform={`translate(149 ${y - 18})`}><line x1="8" y1="0" x2="8" y2="36" stroke="#22c55e" strokeWidth="3.4" /><line x1="20" y1="0" x2="20" y2="36" stroke="#22c55e" strokeWidth="3.4" /><line x1="2" y1="12" x2="26" y2="8" stroke="#22c55e" strokeWidth="3.4" /><line x1="2" y1="26" x2="26" y2="22" stroke="#22c55e" strokeWidth="3.4" /></g>}
        {note.accidental === "b" && <g transform={`translate(152 ${y - 18})`}><line x1="8" y1="0" x2="8" y2="35" stroke="#f87171" strokeWidth="3.4" /><path d="M8 14 C18 8, 20 18, 8 21" fill="none" stroke="#f87171" strokeWidth="3.4" /><path d="M8 22 C18 16, 20 26, 8 29" fill="none" stroke="#f87171" strokeWidth="3.4" /></g>}
        <ellipse cx="205" cy={y} rx={boss ? 20 : 20} ry={boss ? 13 : 13} fill={color} stroke="white" strokeWidth="2.2" transform={`rotate(-18 205 ${y})`} />
        {stemUp ? <line x1="223" x2="223" y1={y} y2={Math.max(10, y - 42)} stroke={color} strokeWidth="3.4" /> : <line x1="187" x2="187" y1={y} y2={Math.min(114, y + 42)} stroke={color} strokeWidth="3.4" />}
      </svg>
    </div>
  );
}

function SchoolPanel({ accuracy, speedFactor, level, soundOnDefault, setSoundOnDefault, showPrivacy, setShowPrivacy, onApplyDefaults }) {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section style={{ ...styles.card, padding: 24 }}>
        <h2 style={{ margin: 0, fontSize: 30 }}>Teacher dashboard</h2>
        <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
          <div style={{ ...styles.subCard, padding: 16, color: "white" }}>I am learning to identify notes on the stave, recognise treble and bass clef positions, and respond confidently to note names with instant audio feedback.</div>
          <div style={{ ...styles.subCard, padding: 16, color: "white" }}>
            <div>• Name notes on the staff accurately.</div>
            <div>• Read notes in treble and bass clef.</div>
            <div>• Focus on pitch recognition, clefs, and accidentals.</div>
            <div>• Recognise sharps and flats at a higher level.</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ ...styles.subCard, padding: 16 }}><div style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}>Accuracy</div><div style={{ fontSize: 34, fontWeight: 800 }}>{accuracy}%</div><div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>Adaptive speed: {speedFactor < 1 ? "slower support" : speedFactor > 1 ? "extra challenge" : "steady"}</div></div>
            <div style={{ ...styles.subCard, padding: 16 }}><div style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}>Current level</div><div style={{ fontSize: 24, fontWeight: 700 }}>{level.label}</div></div>
          </div>
          <div style={{ ...styles.subCard, padding: 16, display: "grid", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div><div style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}>Mute by default</div><div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>Safer for classroom launch</div></div>
              <button style={styles.button} onClick={() => setSoundOnDefault((v) => !v)}>{soundOnDefault ? "Muted on launch" : "Sound on launch"}</button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div><div style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}>Show privacy note</div><div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>Reassures pupils and parents</div></div>
              <button style={styles.button} onClick={() => setShowPrivacy((v) => !v)}>{showPrivacy ? "Privacy note on" : "Privacy note off"}</button>
            </div>
            <button style={{ ...styles.button, width: "100%", background: "#67e8f9" }} onClick={onApplyDefaults}>Apply teacher defaults</button>
          </div>
        </div>
      </section>
      <section style={{ ...styles.card, padding: 24 }}>
        <h3 style={{ marginTop: 0 }}>How to play</h3>
        <div style={{ color: "white", lineHeight: 1.7, fontSize: 14 }}>
          <div>Move the rocket left and right to line up with the falling target.</div>
          <div>You start with 3 lives. If a note reaches the bottom, you lose a life.</div>
          <div>Clear a level to gain one bonus life.</div>
          <div>After sharps and flats, face a boss note that needs five correct hits.</div>
          <div>Endless mode runs until you run out of lives.</div>
        </div>
      </section>
    </div>
  );
}

export default function MusicInvadersApp() {
  const [levelKey, setLevelKey] = useState("easy");
  const [clefMode, setClefMode] = useState("treble");
  const [gameState, setGameState] = useState("ready");
  const [shipLane, setShipLane] = useState(2);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [lives, setLives] = useState(START_LIVES);
  const [streak, setStreak] = useState(0);
  const [shots, setShots] = useState([]);
  const [invaders, setInvaders] = useState([]);
  const [explosions, setExplosions] = useState([]);
  const [bossHitsLeft, setBossHitsLeft] = useState(BOSS_HITS);
  const [soundOn, setSoundOn] = useState(true);
  const [soundOnDefault, setSoundOnDefault] = useState(true);
  const [playerName, setPlayerName] = useState("Player 1");
  const [classMode, setClassMode] = useState(true);
  const [message, setMessage] = useState("Match the note before it lands.");
  const [showTitleScreen, setShowTitleScreen] = useState(true);
  const [showPrivacy, setShowPrivacy] = useState(true);
  const [stats, setStats] = useState({ shotsFired: 0, correctHits: 0 });
  const [starsBg] = useState({ far: stars(18, 0.6, 1.5), mid: stars(24, 0.8, 2), near: stars(30, 1, 2.4) });
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  const [shootingStars, setShootingStars] = useState([]);
  const [shake, setShake] = useState(false);
  const [trail, setTrail] = useState([]);
  const [preserveLivesOnStart, setPreserveLivesOnStart] = useState(false);
  const [endlessTime, setEndlessTime] = useState(0);

  const loopRef = useRef(null);
  const spawnRef = useRef(null);
  const advanceRef = useRef(null);
  const idRef = useRef(1);
  const shotsRef = useRef([]);
  const scoreRef = useRef(0);
  const bagRef = useRef([]);
  const musicRef = useRef(null);
  const shootingRef = useRef(null);
  const cameraRef = useRef(null);

  const level = useMemo(() => LEVELS.find((item) => item.key === levelKey) || LEVELS[0], [levelKey]);
  const questions = useMemo(() => getQuestions(levelKey, clefMode), [levelKey, clefMode]);
  const progress = levelKey === "boss" ? ((BOSS_HITS - bossHitsLeft) / BOSS_HITS) * 100 : levelKey === "endless" ? 0 : (score / level.target) * 100;
  const accuracy = stats.shotsFired ? Math.round((stats.correctHits / stats.shotsFired) * 100) : 100;
  const speedFactor = accuracy >= 90 ? 1.08 : accuracy < 65 ? 0.88 : 1;
  const endlessRamp = levelKey === "endless" ? Math.min(2.2, 1 + endlessTime * 0.005) : 1;
  const effectiveSpeed = level.speed * speedFactor * endlessRamp;
  const answers = levelKey === "easy" || levelKey === "medium" ? BASIC : ADVANCED;
  const leaderboard = [{ name: "Skye", score: 12 }, { name: "Arran", score: 10 }, { name: "Lewis", score: 8 }, { name: playerName || "Player", score }].sort((a, b) => b.score - a.score).slice(0, 5);

  const nextQuestion = () => {
    if (bagRef.current.length === 0) bagRef.current = [...questions].sort(() => Math.random() - 0.5);
    return bagRef.current.shift() || null;
  };

  const clearTimers = () => {
    if (loopRef.current) clearInterval(loopRef.current);
    if (spawnRef.current) clearInterval(spawnRef.current);
    if (advanceRef.current) clearTimeout(advanceRef.current);
  };

  const stopAmbient = () => {
    if (shootingRef.current) clearInterval(shootingRef.current);
    if (cameraRef.current) clearInterval(cameraRef.current);
  };

  const stopMusic = () => {
    if (musicRef.current) clearInterval(musicRef.current);
    musicRef.current = null;
  };

  const startMusic = () => {
    if (!soundOn || musicRef.current) return;
    let step = 0;
    const playStep = () => {
      const bass = [130.81, 146.83, 164.81, 196.0, 174.61, 164.81, 146.83, 130.81][step % 8];
      tone("triangle", bass, 0.28, 0.025);
      tone("square", bass * 2, 0.12, 0.012);
      step += 1;
    };
    playStep();
    musicRef.current = setInterval(playStep, 320);
  };

  const applyTeacherDefaults = () => {
    setSoundOn(soundOnDefault);
    setMessage("Teacher defaults applied.");
  };

  const openFullscreen = async () => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
        return;
      }
      if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
        return;
      }
      setMessage("Fullscreen is limited on iPad Safari. Add to Home Screen for the best full-screen experience.");
    } catch {
      setMessage("Fullscreen is limited on iPad Safari. Add to Home Screen for the best full-screen experience.");
    }
  };

  const pulseShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 120);
  };

  const addTrail = (lane) => {
    const id = `${Date.now()}-${Math.random()}`;
    setTrail((prev) => [...prev.slice(-5), { id, lane }]);
    setTimeout(() => setTrail((prev) => prev.filter((x) => x.id !== id)), 220);
  };

  const speak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const speakNoteName = (text) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text.replace("#", " sharp").replace("b", " flat"));
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const resetBoard = (resetLives = true) => {
    setEndlessTime(0);
    bagRef.current = [];
    scoreRef.current = 0;
    setScore(0);
    if (resetLives) setLives(START_LIVES);
    setStreak(0);
    setShots([]);
    shotsRef.current = [];
    setInvaders([]);
    setExplosions([]);
    setBossHitsLeft(BOSS_HITS);
    setStats({ shotsFired: 0, correctHits: 0 });
    setShipLane(2);
    setMessage("Match the note before it lands.");
  };

  const resetGame = () => {
    clearTimers();
    stopMusic();
    setPreserveLivesOnStart(false);
    resetBoard(true);
    setGameState("ready");
    setShowTitleScreen(true);
    setSoundOn(soundOnDefault);
  };

  const startGame = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    clearTimers();
    resetBoard(!preserveLivesOnStart);
    setPreserveLivesOnStart(false);
    setGameState("playing");
    setShowTitleScreen(false);
    setMessage(levelKey === "boss" ? "Boss battle. Hit the mega note five times." : "Game on. Read carefully and fire the correct answer.");
    startMusic();
    beep("fire", 0.4);
  };

  const addExplosion = (lane, y, label, success) => {
    const id = `${Date.now()}-${Math.random()}`;
    setExplosions((prev) => [...prev, { id, lane, y, label, success }]);
    setTimeout(() => setExplosions((prev) => prev.filter((x) => x.id !== id)), 350);
  };

  const fireAnswer = (answer) => {
    if (gameState !== "playing") return;
    if (soundOn) beep("fire");
    setStats((prev) => ({ ...prev, shotsFired: prev.shotsFired + 1 }));
    setShots((prev) => {
      const next = [...prev, { id: Date.now() + Math.random(), lane: shipLane, y: 82, answer }];
      shotsRef.current = next;
      return next;
    });
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (soundOn) beep("thruster");
        setShipLane((lane) => {
          const next = clamp(lane - 1, 0, LANES - 1);
          addTrail(next);
          return next;
        });
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        if (soundOn) beep("thruster");
        setShipLane((lane) => {
          const next = clamp(lane + 1, 0, LANES - 1);
          addTrail(next);
          return next;
        });
        return;
      }
      if (gameState !== "playing") return;
      const lower = event.key.toLowerCase();
      if (BASIC.map((x) => x.toLowerCase()).includes(lower)) fireAnswer(lower.toUpperCase());
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gameState, shipLane, soundOn]);

  useEffect(() => {
    resetGame();
  }, [clefMode]);

  useEffect(() => {
    if (gameState !== "playing" || levelKey !== "endless") return;
    const timer = setInterval(() => setEndlessTime((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, levelKey]);

  useEffect(() => {
    shootingRef.current = setInterval(() => {
      if (Math.random() > 0.55) {
        const id = `${Date.now()}-${Math.random()}`;
        const star = { id, left: 10 + Math.random() * 75, top: 5 + Math.random() * 35, length: 80 + Math.random() * 80, angle: 18 + Math.random() * 20 };
        setShootingStars((prev) => [...prev, star]);
        setTimeout(() => setShootingStars((prev) => prev.filter((s) => s.id !== id)), 1200);
      }
    }, 5000);
    cameraRef.current = setInterval(() => setCameraOffset({ x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 4 }), 2200);
    return () => stopAmbient();
  }, []);

  useEffect(() => {
    if (gameState !== "playing") return;
    const spawn = () => {
      setInvaders((prev) => {
        if (prev.length >= level.maxInvaders) return prev;
        if (levelKey === "boss") {
          if (prev.length) return prev;
          const pool = questions;
          if (!pool.length) return prev;
          return [{ id: idRef.current++, lane: 2, y: 10, hp: bossHitsLeft, isBoss: true, question: nextQuestion() || pick(pool) }];
        }
        const occupied = new Set(prev.filter((x) => x.y < 36).map((x) => x.lane));
        const free = Array.from({ length: LANES }, (_, i) => i).filter((lane) => !occupied.has(lane));
        const q = nextQuestion();
        if (!free.length || !q) return prev;
        return [...prev, { id: idRef.current++, lane: pick(free), y: 0, question: q }];
      });
    };

    spawn();
    if (levelKey !== "boss") spawnRef.current = setInterval(spawn, level.spawnEvery);

    loopRef.current = setInterval(() => {
      setShots((prev) => {
        const next = prev.map((shot) => ({ ...shot, y: shot.y - 4.2 })).filter((shot) => shot.y > -5);
        shotsRef.current = next;
        return next;
      });

      setInvaders((current) => {
        const moved = current.map((inv) => ({ ...inv, y: inv.y + (inv.isBoss ? level.speed : effectiveSpeed) }));
        const used = new Set();
        const remainingInvaders = [];
        const remainingShots = [];
        let cleared = false;

        moved.forEach((inv) => {
          let hitShot = null;
          for (const shot of shotsRef.current) {
            if (!used.has(shot.id) && shot.lane === inv.lane && Math.abs(shot.y - inv.y) < 8) {
              hitShot = shot;
              used.add(shot.id);
              break;
            }
          }

          if (hitShot) {
            if (hitShot.answer === inv.question.answer) {
              addExplosion(inv.lane, inv.y, "✓", true);
              pulseShake();
              setStats((p) => ({ ...p, correctHits: p.correctHits + 1 }));
              if (soundOn) beep(inv.isBoss ? "boss" : "hit");

              if (inv.isBoss) {
                const nextHits = Math.max(0, bossHitsLeft - 1);
                setBossHitsLeft(nextHits);
                setMessage(`Boss hit. ${nextHits} hits left.`);
                if (nextHits > 0) remainingInvaders.push({ ...inv, hp: nextHits });
                else cleared = true;
              } else {
                const next = scoreRef.current + 1;
                scoreRef.current = next;
                setScore(next);
                setBestScore((best) => Math.max(best, next));
                if (levelKey !== "endless" && next >= level.target) cleared = true;
                setStreak((s) => s + 1);
                setMessage(`Correct. ${inv.question.answer}`);
                if (soundOn) speakNoteName(inv.question.answer);
              }
            } else {
              addExplosion(inv.lane, inv.y, "✕", false);
              pulseShake();
              if (soundOn) beep("miss");
              setLives((x) => Math.max(0, x - 1));
              setStreak(0);
              setMessage("Wrong answer. Try again.");
              remainingInvaders.push(inv);
            }
          } else if (inv.y >= 82) {
            setLives((x) => Math.max(0, x - 1));
            setStreak(0);
            if (soundOn) beep("miss");
            setMessage("Missed note. You lost a life.");
            pulseShake();
          } else {
            remainingInvaders.push(inv);
          }
        });

        shotsRef.current.forEach((shot) => {
          if (!used.has(shot.id) && shot.y > -5) remainingShots.push(shot);
        });
        shotsRef.current = remainingShots;
        setShots(remainingShots);

        if (cleared) {
          if (levelKey === "endless") return remainingInvaders;
          if (levelKey !== "boss") {
            setLives((x) => Math.min(MAX_LIVES, x + 1));
            setPreserveLivesOnStart(true);
          }
          if (soundOn) beep("level");
          advanceRef.current = setTimeout(() => {
            if (levelKey === "boss") {
              setGameState("won");
              setMessage("Boss defeated. Outstanding work!");
            } else {
              const next = nextLevel(levelKey);
              setLevelKey(next);
              setScore(0);
              scoreRef.current = 0;
              setShots([]);
              shotsRef.current = [];
              setInvaders([]);
              setExplosions([]);
              setStreak(0);
              setBossHitsLeft(BOSS_HITS);
              bagRef.current = [];
              setGameState("ready");
              setMessage(next === "boss" ? "Boss level unlocked. +1 life awarded. Start when ready." : "Level complete! +1 life awarded. Start next level when ready.");
            }
          }, 700);
        }

        return remainingInvaders;
      });
    }, 50);

    return () => clearTimers();
  }, [gameState, levelKey, effectiveSpeed, level.spawnEvery, level.maxInvaders, level.target, questions, bossHitsLeft, soundOn]);

  useEffect(() => {
    if (lives <= 0 && gameState === "playing") {
      clearTimers();
      stopMusic();
      setGameState("lost");
      setMessage("Mission failed. Reset and try another round.");
    }
  }, [lives, gameState]);

  useEffect(() => {
    if (gameState === "playing" && soundOn) startMusic();
    if (!soundOn) stopMusic();
    return () => {
      if (gameState !== "playing") stopMusic();
    };
  }, [soundOn, gameState]);

  return (
    <div style={styles.page}>
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", transform: `translate(${cameraOffset.x}px, ${cameraOffset.y}px)`, transition: "transform 2.1s ease-in-out" }}>
        {starsBg.far.map((s) => <div key={`f-${s.id}`} style={{ position: "absolute", left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, borderRadius: 999, background: "#bae6fd", opacity: s.opacity * 0.55 }} />)}
        {starsBg.mid.map((s) => <div key={`m-${s.id}`} style={{ position: "absolute", left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, borderRadius: 999, background: "#ddd6fe", opacity: s.opacity * 0.7 }} />)}
        {starsBg.near.map((s) => <div key={`n-${s.id}`} style={{ position: "absolute", left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, borderRadius: 999, background: "white", opacity: s.opacity }} />)}
        {shootingStars.map((s) => <div key={s.id} style={{ position: "absolute", left: `${s.left}%`, top: `${s.top}%`, transform: `rotate(${s.angle}deg)` }}><div style={{ width: s.length, height: 2, borderRadius: 999, background: "linear-gradient(90deg, white, #7dd3fc, transparent)", boxShadow: "0 0 12px rgba(255,255,255,0.8)" }} /></div>)}
      </div>

      {showTitleScreen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(2,6,23,0.8)" }}>
          <div style={{ width: "100%", maxWidth: 800, padding: 32, textAlign: "center", ...styles.card, background: "rgba(2,6,23,0.95)" }}>
            <div style={{ margin: "0 auto 16px", width: 64, height: 64, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "#34d399", color: "#0f172a", fontSize: 32 }}>🚀</div>
            <h1 style={{ fontSize: 44, margin: 0 }}>Music Invaders</h1>
            <p style={{ color: "rgba(255,255,255,0.9)", marginTop: 12 }}>A note-reading space game for ages 10–14, designed for school use.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 24 }}>
              <button style={styles.button} onClick={startGame}>▶ Start game</button>
              <button style={styles.ghostButton} onClick={openFullscreen}>⛶ Open fullscreen</button>
            </div>
            {showPrivacy && <div style={{ marginTop: 24, padding: 16, textAlign: "left", ...styles.subCard, background: "rgba(15,23,42,0.92)", color: "rgba(255,255,255,0.9)" }}><div style={{ marginBottom: 8, color: "white", fontWeight: 700 }}>🛡 Privacy note</div><div>This game does not collect personal data. Scores stay on this device unless a teacher chooses to record them separately.</div></div>}
          </div>
        </div>
      )}

      <div style={styles.shell}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <span style={{ padding: "6px 12px", borderRadius: 999, background: "rgba(34,197,94,0.9)", color: "white", fontSize: 13, fontWeight: 700 }}>Curriculum for Excellence aligned</span>
          <span style={{ padding: "6px 12px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.20)", color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 700 }}>Ages 10–14</span>
        </div>

        <div style={styles.grid}>
          <div style={{ display: "grid", gap: 24 }}>
            <section style={{ ...styles.card, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "end" }}>
                <div>
                  <h1 style={{ fontSize: 52, margin: 0 }}>Music Invaders</h1>
                  <p style={{ color: "rgba(255,255,255,0.9)", marginTop: 8 }}>Space-invaders style music reading practice.</p>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button style={styles.ghostButton} onClick={() => {
                    const ctx = getAudioContext();
                    if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
                    setSoundOn((v) => !v);
                    beep("fire", 0.25);
                  }}>{soundOn ? "🔊 Sound on" : "🔈 Sound off"}</button>
                  <button style={styles.ghostButton} onClick={openFullscreen}>⛶ Fullscreen</button>
                  <button style={styles.button} onClick={startGame}>🚀 {gameState === "playing" ? "Restart game" : "Start mission"}</button>
                  <button style={styles.ghostButton} onClick={resetGame}>↺ Reset</button>
                </div>
              </div>

              <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
                <div style={{ ...styles.subCard, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, color: "rgba(255,255,255,0.9)", fontSize: 14, marginBottom: 12 }}>
                    <div>{levelKey === "boss" ? `Boss health: ${bossHitsLeft}/${BOSS_HITS}` : levelKey === "endless" ? `Endless mode · ${endlessTime}s · speed x${endlessRamp.toFixed(2)}` : `Target score: ${level.target}`}</div>
                    <div>{level.maxInvaders === 1 ? "One note at a time" : "Maximum two notes at a time"}</div>
                  </div>
                  <div style={{ position: "relative", height: 560, overflow: "hidden", borderRadius: 24, border: "1px solid rgba(255,255,255,0.12)", background: "radial-gradient(circle at 50% 20%, rgba(56,189,248,0.25), transparent 30%), radial-gradient(circle at 80% 0%, rgba(168,85,247,0.25), transparent 30%), linear-gradient(180deg, rgba(15,23,42,1), rgba(2,6,23,1))", transform: shake ? "translateX(4px)" : "translateX(0)", transition: "transform 0.08s ease" }}>
                    {Array.from({ length: LANES }).map((_, i) => <div key={i} style={{ position: "absolute", top: 0, height: "100%", left: `${10 + i * 18}%`, width: "18%", borderLeft: "1px dashed rgba(255,255,255,0.12)" }} />)}
                    {invaders.map((inv) => <div key={inv.id} style={{ position: "absolute", top: `${inv.y}%`, left: `${inv.isBoss ? 31 : LANE_LEFT[inv.lane]}%`, width: inv.isBoss ? "28%" : "18%" }}><div style={{ borderRadius: 24, border: inv.isBoss ? "1px solid rgba(252,211,77,0.55)" : "1px solid rgba(232,121,249,0.4)", padding: 12, background: inv.isBoss ? "rgba(245,158,11,0.10)" : "rgba(217,70,239,0.10)", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}><Staff note={inv.question.display} clef={inv.question.clef} boss={Boolean(inv.isBoss)} /><div style={{ marginTop: 10, textAlign: "center", textTransform: "uppercase", letterSpacing: 3, color: inv.isBoss ? "#fde68a" : "#f0abfc", fontSize: inv.isBoss ? 14 : 12 }}>{inv.isBoss ? `${inv.question.clef} clef · ${inv.hp} hits left` : `${inv.question.clef} clef`}</div></div></div>)}
                    {shots.map((shot) => <div key={shot.id} style={{ position: "absolute", top: `${shot.y}%`, left: `${SHIP_LEFT[shot.lane]}%`, width: 40, height: 48, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 999, background: "#34d399", color: "#0f172a", fontWeight: 900, boxShadow: "0 10px 20px rgba(0,0,0,0.25)" }}>{shot.answer}</div>)}
                    {explosions.map((b) => <div key={b.id} style={{ position: "absolute", left: `${SHIP_LEFT[b.lane] + 1}%`, top: `${b.y}%`, width: 64, height: 64, transform: "translate(-50%,-50%)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 999, border: b.success ? "1px solid rgba(134,239,172,0.7)" : "1px solid rgba(253,164,175,0.7)", background: b.success ? "rgba(74,222,128,0.25)" : "rgba(251,113,133,0.25)", color: b.success ? "#dcfce7" : "#ffe4e6", fontSize: 26, fontWeight: 900 }}>{b.label}</div>)}
                    <div style={{ position: "absolute", bottom: 8, left: `${50 + (shipLane - 2) * 18}%`, transform: "translateX(-50%)" }}>
                      {trail.map((t) => <div key={t.id} style={{ position: "absolute", top: 40, left: `${(t.lane - shipLane) * 28}px`, transform: "translateX(-50%)", opacity: 0.7 }}>✨</div>)}
                      <div style={{ transform: `rotate(${(shipLane - 2) * 8}deg)`, transition: "transform 0.15s ease", fontSize: 58, filter: "drop-shadow(0 0 12px rgba(56,189,248,0.9))" }}>🚀</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                  {answers.map((a) => <button key={a} style={styles.button} onClick={() => fireAnswer(a)}>{a}</button>)}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "0.34fr 0.66fr", gap: 16 }}>
                  <section style={{ ...styles.card, padding: 20 }}>
                    <h3 style={{ marginTop: 0 }}>Mission control</h3>
                    <div style={{ display: "grid", gap: 16 }}>
                      <div>
                        <div style={{ marginBottom: 8, color: "rgba(255,255,255,0.9)", fontSize: 14 }}>Difficulty</div>
                        <select style={styles.select} value={levelKey} onChange={(e) => { setLevelKey(e.target.value); resetGame(); }}>
                          {LEVELS.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={{ marginBottom: 8, color: "rgba(255,255,255,0.9)", fontSize: 14 }}>Clef focus</div>
                        <select style={styles.select} value={clefMode} onChange={(e) => setClefMode(e.target.value)}>
                          <option value="treble">Treble clef</option>
                          <option value="bass">Bass clef</option>
                          <option value="both">Both clefs</option>
                        </select>
                      </div>
                      <div style={{ ...styles.subCard, padding: 10, display: "flex", gap: 8, alignItems: "center" }}>
                        <button style={styles.button} onClick={() => setClassMode((v) => !v)}>{classMode ? "Leaderboard on" : "Leaderboard off"}</button>
                        <input style={styles.input} value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Player name" />
                      </div>
                      <div style={{ ...styles.subCard, padding: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.9)", fontSize: 14, marginBottom: 8 }}>
                          <span>Progress</span>
                          <span>{levelKey === "boss" ? `${BOSS_HITS - bossHitsLeft}/${BOSS_HITS}` : levelKey === "endless" ? `${score}` : `${score}/${level.target}`}</span>
                        </div>
                        <Bar value={levelKey === "endless" ? 0 : progress} />
                      </div>
                    </div>
                  </section>

                  <div style={{ display: "grid", gap: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={{ ...styles.subCard, padding: 16 }}><div style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}>Score</div><div style={{ marginTop: 4, fontSize: 36, fontWeight: 800, color: "#fde047", textShadow: "0 0 10px rgba(253,224,71,0.75)" }}>{score}</div></div>
                      <div style={{ ...styles.subCard, padding: 16 }}><div style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}>Best</div><div style={{ marginTop: 4, fontSize: 36, fontWeight: 800, color: "#fde047", textShadow: "0 0 10px rgba(253,224,71,0.75)" }}>{bestScore}</div></div>
                      <div style={{ ...styles.subCard, padding: 16 }}><div style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}>Lives</div><div style={{ marginTop: 4, color: "rgba(255,255,255,0.8)", fontSize: 12 }}>Start with 3 · Max 5</div><div style={{ display: "flex", gap: 8, marginTop: 10 }}>{Array.from({ length: MAX_LIVES }).map((_, i) => <span key={i} style={{ fontSize: 24, opacity: i < lives ? 1 : 0.2 }}>❤️</span>)}</div></div>
                      <div style={{ ...styles.subCard, padding: 16 }}><div style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}>Streak</div><div style={{ marginTop: 4, fontSize: 36, fontWeight: 800, color: "#fde047", textShadow: "0 0 10px rgba(253,224,71,0.75)" }}>{streak}</div></div>
                      {classMode && <div style={{ ...styles.subCard, padding: 16, gridColumn: "span 2" }}><div style={{ fontWeight: 700, marginBottom: 10 }}>Class leaderboard</div>{leaderboard.map((entry, i) => <div key={`${entry.name}-${i}`} style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", borderRadius: 16, background: "rgba(15,23,42,0.7)", marginTop: 8, fontSize: 14 }}><span>{i + 1}. {entry.name}</span><span style={{ color: "#7dd3fc", fontWeight: 700 }}>{entry.score}</span></div>)}</div>}
                    </div>
                  </div>
                </div>

                <div style={{ ...styles.subCard, padding: 16, display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" }}>
                  <div>
                    <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 3, color: "#67e8f9" }}>Feedback</div>
                    <div style={{ marginTop: 8, color: "#fff" }}>{message}</div>
                  </div>
                  <button style={styles.ghostButton} onClick={speak}>🔊 Read aloud</button>
                </div>
              </div>
            </section>
          </div>

          <SchoolPanel accuracy={accuracy} speedFactor={speedFactor} level={level} soundOnDefault={soundOnDefault} setSoundOnDefault={setSoundOnDefault} showPrivacy={showPrivacy} setShowPrivacy={setShowPrivacy} onApplyDefaults={applyTeacherDefaults} />
        </div>
      </div>
    </div>
  );
}
