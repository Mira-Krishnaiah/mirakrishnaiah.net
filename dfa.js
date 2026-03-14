/* ═══════════════════════════════════════════════════════════
   dfa.js — DFA visualization: "MIRA" acceptor with gear states
   Extracted from mira-landing.html mockup
   ═══════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────
   CSS VARIABLE HELPER
───────────────────────────────────────────── */
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/* ─────────────────────────────────────────────
   DFA DEFINITION
   Accepts exactly "MIRA" (case-insensitive)
───────────────────────────────────────────── */
const STATES = [
  { id: 0, label: 'q₀', x: 0,   y: 0,   start: true,  accept: false },
  { id: 1, label: 'q₁', x: 1,   y: 0,   start: false, accept: false },
  { id: 2, label: 'q₂', x: 2,   y: 0,   start: false, accept: false },
  { id: 3, label: 'q₃', x: 3,   y: 0,   start: false, accept: false },
  { id: 4, label: 'q₄', x: 4,   y: 0,   start: false, accept: true  },
  { id: 5, label: 'qₓ', x: 2,   y: 1.6, start: false, accept: false }, // dead state
];

// delta: [fromState, char] → toState
const DELTA = {
  '0,M': 1, '0,*': 5,
  '1,I': 2, '1,*': 5,
  '2,R': 3, '2,*': 5,
  '3,A': 4, '3,*': 5,
  '4,*': 5,
  '5,*': 5,
};

function transition(state, char) {
  const c   = char.toUpperCase();
  const key = state + ',' + c;
  return DELTA[key] !== undefined ? DELTA[key] : DELTA[state + ',*'];
}

/* ─────────────────────────────────────────────
   CANVAS SETUP
───────────────────────────────────────────── */
const canvas = document.getElementById('dfa-canvas');
const ctx    = canvas.getContext('2d');
const CW     = 700;
const CH     = 420;
canvas.width  = CW;
canvas.height = CH;

// Map logical grid positions to canvas coords
const PAD  = 80;
const COLS = 5;
const ROWS = 2;
const colW = (CW - PAD * 2) / (COLS - 1);
const rowH = (CH - PAD * 2) / ROWS;

function statePos(s) {
  return {
    x: PAD + s.x * colW,
    y: PAD + s.y * rowH,
  };
}

// Gear geometry per state
const GEAR_R     = [34, 30, 36, 30, 38, 26]; // outer radius per state
const GEAR_TEETH = [12, 11, 13, 11, 14, 9];
const GEAR_DIRS  = [1, -1, 1, -1, 1, 1];     // rotation direction

let gearAngles  = [0, 0, 0, 0, 0, 0];
let gearSpeeds  = [0, 0, 0, 0, 0, 0];
let activeState = 0;
let runTrail    = []; // sequence of states visited

/* ─────────────────────────────────────────────
   DRAW HELPERS
───────────────────────────────────────────── */
function drawGear(cx, cy, outerR, innerR, teeth, angle, color, strokeColor, alpha) {
  if (alpha === undefined) alpha = 1;
  const toothDepth = outerR - innerR;
  const angleStep  = (Math.PI * 2) / teeth;
  const toothW     = angleStep * 0.38;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const a0 = i * angleStep - toothW / 2;
    const a1 = i * angleStep + toothW / 2;
    const a2 = a1 + angleStep * 0.08;
    const a3 = (i + 1) * angleStep - toothW / 2 - angleStep * 0.08;

    if (i === 0) {
      ctx.moveTo(Math.cos(a0) * innerR, Math.sin(a0) * innerR);
    } else {
      ctx.lineTo(Math.cos(a0) * innerR, Math.sin(a0) * innerR);
    }
    ctx.lineTo(Math.cos(a0) * outerR, Math.sin(a0) * outerR);
    ctx.lineTo(Math.cos(a1) * outerR, Math.sin(a1) * outerR);
    ctx.lineTo(Math.cos(a1) * innerR, Math.sin(a1) * innerR);
    ctx.lineTo(Math.cos(a2) * innerR, Math.sin(a2) * innerR);
    ctx.lineTo(Math.cos(a3) * innerR, Math.sin(a3) * innerR);
  }
  ctx.closePath();
  ctx.fillStyle   = color;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth   = 1;
  ctx.stroke();

  // Inner hub
  ctx.beginPath();
  ctx.arc(0, 0, innerR * 0.55, 0, Math.PI * 2);
  ctx.fillStyle   = color;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth   = 1;
  ctx.stroke();

  // Center dot
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fillStyle = strokeColor;
  ctx.fill();

  // Spoke lines
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 5, Math.sin(a) * 5);
    ctx.lineTo(Math.cos(a) * innerR * 0.52, Math.sin(a) * innerR * 0.52);
    ctx.strokeStyle  = strokeColor;
    ctx.lineWidth    = 0.8;
    ctx.globalAlpha  = alpha * 0.4;
    ctx.stroke();
    ctx.globalAlpha  = alpha;
  }

  ctx.restore();
}

function drawTransitionArrow(fromS, toS, label, active, color) {
  const f = statePos(fromS);
  const t = statePos(toS);

  const dx   = t.x - f.x;
  const dy   = t.y - f.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ux   = dx / dist;
  const uy   = dy / dist;

  const sx = f.x + ux * (GEAR_R[fromS.id] + 4);
  const sy = f.y + uy * (GEAR_R[fromS.id] + 4);
  const ex = t.x - ux * (GEAR_R[toS.id] + 4);
  const ey = t.y - uy * (GEAR_R[toS.id] + 4);

  ctx.save();
  ctx.strokeStyle = active ? color : cssVar('--rule');
  ctx.lineWidth   = active ? 1.5 : 0.8;
  ctx.globalAlpha = active ? 1 : 0.6;
  ctx.setLineDash(active ? [] : [3, 4]);

  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  // Arrowhead
  const hLen = 8, hWid = 4;
  const ax   = ex - ux * hLen;
  const ay   = ey - uy * hLen;
  const px   = -uy;
  const py   = ux;
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ax + px * hWid, ay + py * hWid);
  ctx.lineTo(ax - px * hWid, ay - py * hWid);
  ctx.closePath();
  ctx.fillStyle = active ? color : cssVar('--rule');
  ctx.fill();

  // Label
  const lx = (sx + ex) / 2 - uy * 14;
  const ly = (sy + ey) / 2 + ux * 14;
  ctx.globalAlpha  = 1;
  ctx.fillStyle    = active ? color : cssVar('--ink4');
  ctx.font         = (active ? 500 : 300) + ' 10px ' + cssVar('--font-mono').split(',')[0];
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, lx, ly);

  ctx.restore();
}

function drawDeadArrow(fromS, toDeadS, active) {
  const f     = statePos(fromS);
  const t     = statePos(toDeadS);
  const color = cssVar('--ruby');

  // Curved arc downward
  const cpx = (f.x + t.x) / 2;
  const cpy = (f.y + t.y) / 2 + 40;

  ctx.save();
  ctx.strokeStyle = active ? color : cssVar('--rule');
  ctx.lineWidth   = active ? 1.2 : 0.6;
  ctx.globalAlpha = active ? 0.8 : 0.3;
  ctx.setLineDash([3, 4]);

  ctx.beginPath();
  ctx.moveTo(f.x, f.y + GEAR_R[fromS.id]);
  ctx.quadraticCurveTo(cpx, cpy, t.x, t.y - GEAR_R[toDeadS.id]);
  ctx.stroke();
  ctx.restore();
}

function drawStateLabel(s, isActive, isAccept) {
  const p     = statePos(s);
  const color = isAccept
    ? cssVar('--emerald')
    : isActive
      ? cssVar('--sapphire')
      : cssVar('--ink3');

  ctx.save();
  ctx.fillStyle    = color;
  ctx.font         = '300 9px ' + cssVar('--font-mono').split(',')[0];
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'top';
  ctx.globalAlpha  = 0.9;
  ctx.fillText(s.label, p.x, p.y + GEAR_R[s.id] + 6);
  ctx.restore();
}

function drawStartArrow(s) {
  const p = statePos(s);
  const x = p.x - GEAR_R[s.id] - 4;

  ctx.save();
  ctx.strokeStyle = cssVar('--ink4');
  ctx.lineWidth   = 0.8;
  ctx.globalAlpha = 0.5;
  ctx.setLineDash([2, 3]);
  ctx.beginPath();
  ctx.moveTo(x - 22, p.y);
  ctx.lineTo(x, p.y);
  ctx.stroke();

  // Tiny arrowhead
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(x, p.y);
  ctx.lineTo(x - 7, p.y - 4);
  ctx.lineTo(x - 7, p.y + 4);
  ctx.closePath();
  ctx.fillStyle = cssVar('--ink4');
  ctx.fill();
  ctx.restore();
}

function drawAcceptDouble(s) {
  const p = statePos(s);
  ctx.save();
  ctx.beginPath();
  ctx.arc(p.x, p.y, GEAR_R[s.id] + 7, 0, Math.PI * 2);
  ctx.strokeStyle = cssVar('--emerald');
  ctx.lineWidth   = 1;
  ctx.globalAlpha = 0.5;
  ctx.setLineDash([2, 3]);
  ctx.stroke();
  ctx.restore();
}

/* ─────────────────────────────────────────────
   NEURAL NET OVERLAY — on active transition
───────────────────────────────────────────── */
function drawNeuralTransition(from, to) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2 - 30;

  const nodes = [
    { x: midX - 22, y: midY - 10 },
    { x: midX - 22, y: midY + 10 },
    { x: midX,      y: midY - 14 },
    { x: midX,      y: midY      },
    { x: midX,      y: midY + 14 },
    { x: midX + 22, y: midY      },
  ];
  const edges = [
    [0,2],[0,3],[0,4],[1,2],[1,3],[1,4],[2,5],[3,5],[4,5]
  ];

  ctx.save();
  ctx.globalAlpha = 0.25;

  edges.forEach(function (e) {
    ctx.beginPath();
    ctx.moveTo(nodes[e[0]].x, nodes[e[0]].y);
    ctx.lineTo(nodes[e[1]].x, nodes[e[1]].y);
    ctx.strokeStyle = cssVar('--sapphire');
    ctx.lineWidth   = 0.6;
    ctx.stroke();
  });

  nodes.forEach(function (n, i) {
    ctx.beginPath();
    ctx.arc(n.x, n.y, (i === 0 || i === 1 || i === 5) ? 4 : 3, 0, Math.PI * 2);
    ctx.fillStyle = cssVar('--sapphire');
    ctx.fill();
  });

  ctx.restore();
}

/* ─────────────────────────────────────────────
   DIMENSION LINES
───────────────────────────────────────────── */
function drawDimLines() {
  const p0 = statePos(STATES[0]);
  const p4 = statePos(STATES[4]);
  const y  = CH - 28;

  ctx.save();
  ctx.strokeStyle  = cssVar('--ink4');
  ctx.fillStyle    = cssVar('--ink4');
  ctx.lineWidth    = 0.6;
  ctx.globalAlpha  = 0.4;
  ctx.font         = '300 8px ' + cssVar('--font-mono').split(',')[0];
  ctx.textAlign    = 'center';
  ctx.setLineDash([2, 3]);

  // Horizontal extent line
  ctx.beginPath();
  ctx.moveTo(p0.x, y);
  ctx.lineTo(p4.x, y);
  ctx.stroke();

  // Tick marks
  [p0.x, p4.x].forEach(function (x) {
    ctx.beginPath();
    ctx.moveTo(x, y - 4);
    ctx.lineTo(x, y + 4);
    ctx.stroke();
  });

  ctx.setLineDash([]);
  ctx.fillText('4 STATE TRANSITIONS · Σ = {M,I,R,A,…}', (p0.x + p4.x) / 2, y + 8);
  ctx.restore();
}

/* ─────────────────────────────────────────────
   MAIN DRAW FUNCTION (globally available)
───────────────────────────────────────────── */
function drawDFA() {
  ctx.clearRect(0, 0, CW, CH);

  const sapphire = cssVar('--sapphire');
  const emerald  = cssVar('--emerald');
  const metal    = cssVar('--metal');
  const rule     = cssVar('--rule');

  // Draw transitions
  var transitions = [
    { from: 0, to: 1, label: 'M' },
    { from: 1, to: 2, label: 'I' },
    { from: 2, to: 3, label: 'R' },
    { from: 3, to: 4, label: 'A' },
  ];
  transitions.forEach(function (t) {
    var isActive = runTrail.includes(t.from) && runTrail.includes(t.to);
    drawTransitionArrow(STATES[t.from], STATES[t.to], t.label, isActive, sapphire);
  });

  // Dead state arcs (subtle)
  [0, 1, 2, 3, 4].forEach(function (i) {
    var inTrailAt = runTrail.indexOf(5);
    var active    = inTrailAt > 0 && runTrail[inTrailAt - 1] === i;
    drawDeadArrow(STATES[i], STATES[5], active);
  });

  // Start arrow
  drawStartArrow(STATES[0]);

  // Accept double ring
  drawAcceptDouble(STATES[4]);

  // Draw gears
  STATES.forEach(function (s, i) {
    var p         = statePos(s);
    var outerR    = GEAR_R[i];
    var innerR    = outerR * 0.62;
    var isActive  = activeState === i;
    var isAccept  = s.accept;
    var inTrail   = runTrail.includes(i);

    var gearColor, strokeColor, alpha;

    if (isAccept && inTrail) {
      gearColor   = 'rgba(26,122,74,0.12)';
      strokeColor = emerald;
      alpha       = 1;
    } else if (i === 5 && runTrail.includes(5)) {
      gearColor   = 'rgba(164,36,36,0.1)';
      strokeColor = cssVar('--ruby');
      alpha       = 1;
    } else if (isActive) {
      gearColor   = 'rgba(36,85,164,0.1)';
      strokeColor = sapphire;
      alpha       = 1;
    } else if (inTrail) {
      gearColor   = 'rgba(36,85,164,0.06)';
      strokeColor = metal;
      alpha       = 1;
    } else {
      gearColor   = 'transparent';
      strokeColor = rule;
      alpha       = 0.7;
    }

    drawGear(p.x, p.y, outerR, innerR, GEAR_TEETH[i], gearAngles[i], gearColor, strokeColor, alpha);
    drawStateLabel(s, isActive, isAccept);
  });

  // Neural net overlay on active transition
  if (runTrail.length >= 2) {
    var last = runTrail[runTrail.length - 1];
    var prev = runTrail[runTrail.length - 2];
    if (last !== 5 && prev !== 5) {
      drawNeuralTransition(statePos(STATES[prev]), statePos(STATES[last]));
    }
  }

  // Dimension annotation lines
  drawDimLines();
}

/* ─────────────────────────────────────────────
   GEAR ANIMATION LOOP
───────────────────────────────────────────── */
var lastTime = 0;

function tick(ts) {
  var dt = Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;

  STATES.forEach(function (_, i) {
    if (gearSpeeds[i] !== 0) {
      gearAngles[i] += gearSpeeds[i] * GEAR_DIRS[i] * dt;
      gearSpeeds[i] *= 0.94; // friction
      if (Math.abs(gearSpeeds[i]) < 0.01) gearSpeeds[i] = 0;
    }
  });

  // Ambient idle tick — q0 always ticks very slowly
  gearAngles[0] += 0.004 * dt * 60;

  drawDFA();
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

/* ─────────────────────────────────────────────
   RUN DFA
───────────────────────────────────────────── */
var inputEl  = document.getElementById('dfa-input');
var runBtn   = document.getElementById('dfa-run');
var statusEl = document.getElementById('dfa-status');

function runDFA(str) {
  if (!str.trim()) return;
  var chars = str.toUpperCase().split('');
  var state = 0;
  var trail = [0];
  chars.forEach(function (c) {
    state = transition(state, c);
    trail.push(state);
  });

  // Animate step by step
  runTrail    = [];
  activeState = 0;
  statusEl.className   = 'status-idle';
  statusEl.textContent = '— running —';

  var step = 0;
  function nextStep() {
    if (step >= trail.length) {
      var accepted = STATES[state].accept;
      statusEl.textContent = accepted
        ? '✓ ACCEPTED  —  "' + str.toUpperCase() + '" is in L(M)'
        : '✗ REJECTED  —  "' + str.toUpperCase() + '" ∉ L(M)';
      statusEl.className = accepted ? 'status-accept' : 'status-reject';
      activeState = -1;
      return;
    }

    activeState = trail[step];
    runTrail    = trail.slice(0, step + 1);

    // Spin gears along the trail
    gearSpeeds[trail[step]] = 3.5 + Math.random() * 1.5;
    if (step > 0) gearSpeeds[trail[step - 1]] = 1.5;

    step++;
    setTimeout(nextStep, 480);
  }
  nextStep();
}

if (runBtn) {
  runBtn.addEventListener('click', function () { runDFA(inputEl.value); });
}
if (inputEl) {
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') runDFA(inputEl.value);
  });
}
