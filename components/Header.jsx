// components/Header.jsx
import { useEffect, useRef } from 'react';

export default function Header({ dark, onToggleTheme }) {
  const canvasRef = useRef(null);

  // ── Animated Canvas Background ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, dpr;
    let particles, orbs, gridLines, shooters = [];
    let frame = 0;
    let mouse = { x: -9999, y: -9999 };
    let animId;

    function randRange(a, b) { return a + Math.random() * (b - a); }

    function makeOrbs() {
      return Array.from({ length: 5 }, (_, i) => ({
        x: randRange(0.1, 0.9) * W,
        y: randRange(0.1, 0.9) * H,
        r: randRange(180, 380),
        vx: randRange(-0.08, 0.08),
        vy: randRange(-0.06, 0.06),
        hue:   [38,  45,  220, 200, 30][i],
        sat:   [60,  50,  40,  35,  55][i],
        light: [55,  48,  45,  42,  50][i],
        alpha: randRange(0.03, 0.07),
        phase: randRange(0, Math.PI * 2),
        speed: randRange(0.003, 0.007),
      }));
    }

    function makeParticles() {
      return Array.from({ length: 90 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: randRange(0.4, 1.6),
        alpha: randRange(0.1, 0.55),
        vx: randRange(-0.06, 0.06),
        vy: randRange(-0.04, -0.12),
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: randRange(0.01, 0.04),
      }));
    }

    function makeGrid() {
      const lines = [];
      for (let c = 0; c <= 14; c++) lines.push({ type: 'v', pos: c / 14 });
      for (let r = 0; r <= 10; r++) lines.push({ type: 'h', pos: r / 10 });
      return lines;
    }

    function spawnShooter() {
      shooters.push({
        x: randRange(W * 0.1, W * 0.9),
        y: randRange(0, H * 0.4),
        len: randRange(60, 160),
        angle: randRange(Math.PI * 0.05, Math.PI * 0.25),
        speed: randRange(6, 14),
        life: 1,
      });
    }

    function init() {
      orbs = makeOrbs();
      particles = makeParticles();
      gridLines = makeGrid();
      shooters = [];
    }

    function resize() {
      dpr = window.devicePixelRatio || 1;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      init();
    }

    function getColors() {
      const isLight = document.documentElement.classList.contains('light');
      return {
        isLight,
        bg: isLight ? '#f5f0e8' : '#0d0f14',
        gridAlpha: isLight ? 0.04 : 0.025,
        orbAlphaMul: isLight ? 0.5 : 1,
        particleAlphaMul: isLight ? 0.3 : 1,
        particleColor: isLight ? '180,160,120' : '201,169,110',
      };
    }

    function draw() {
      frame++;
      const { isLight, bg, gridAlpha, orbAlphaMul, particleAlphaMul, particleColor } = getColors();
      const w = W, h = H;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Grid
      gridLines.forEach(line => {
        ctx.beginPath();
        ctx.strokeStyle = isLight
          ? `rgba(160,140,100,${gridAlpha})`
          : `rgba(201,169,110,${gridAlpha})`;
        ctx.lineWidth = 0.5;
        if (line.type === 'v') { ctx.moveTo(line.pos * w, 0); ctx.lineTo(line.pos * w, h); }
        else                   { ctx.moveTo(0, line.pos * h); ctx.lineTo(w, line.pos * h); }
        ctx.stroke();
      });

      // Orbs
      orbs.forEach(orb => {
        orb.x += orb.vx; orb.y += orb.vy;
        if (orb.x < -orb.r) orb.x = w + orb.r;
        if (orb.x > w + orb.r) orb.x = -orb.r;
        if (orb.y < -orb.r) orb.y = h + orb.r;
        if (orb.y > h + orb.r) orb.y = -orb.r;
        const pulse = 1 + 0.06 * Math.sin(frame * orb.speed + orb.phase);
        const r = orb.r * pulse;
        const a = orb.alpha * orbAlphaMul;
        const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r);
        g.addColorStop(0,   `hsla(${orb.hue},${orb.sat}%,${orb.light}%,${a})`);
        g.addColorStop(0.5, `hsla(${orb.hue},${orb.sat}%,${orb.light}%,${a * 0.4})`);
        g.addColorStop(1,   `hsla(${orb.hue},${orb.sat}%,${orb.light}%,0)`);
        ctx.beginPath(); ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      });

      // Mouse glow
      if (mouse.x > 0) {
        const mg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 140);
        const ma = isLight ? 0.06 : 0.09;
        mg.addColorStop(0, `rgba(201,169,110,${ma})`);
        mg.addColorStop(1, 'rgba(201,169,110,0)');
        ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 140, 0, Math.PI * 2);
        ctx.fillStyle = mg; ctx.fill();
      }

      // Particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.twinklePhase += p.twinkleSpeed;
        if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; }
        if (p.x < -4) p.x = w + 4;
        if (p.x > w + 4) p.x = -4;
        const tw = 0.5 + 0.5 * Math.sin(p.twinklePhase);
        const alpha = p.alpha * tw * particleAlphaMul;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor},${alpha})`; ctx.fill();
      });

      // Shooting stars
      if (frame % 220 === 0 && !isLight) spawnShooter();
      shooters = shooters.filter(s => s.life > 0);
      shooters.forEach(s => {
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.life -= 0.022;
        const ex = s.x - Math.cos(s.angle) * s.len;
        const ey = s.y - Math.sin(s.angle) * s.len;
        const sg = ctx.createLinearGradient(ex, ey, s.x, s.y);
        sg.addColorStop(0,   `rgba(232,201,122,0)`);
        sg.addColorStop(0.7, `rgba(232,201,122,${s.life * 0.4})`);
        sg.addColorStop(1,   `rgba(255,240,200,${s.life})`);
        ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = sg; ctx.lineWidth = 1.5; ctx.stroke();
        const tg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 6);
        tg.addColorStop(0, `rgba(255,240,200,${s.life * 0.8})`);
        tg.addColorStop(1, 'rgba(255,240,200,0)');
        ctx.beginPath(); ctx.arc(s.x, s.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = tg; ctx.fill();
      });

      // Vignette
      const vig = ctx.createRadialGradient(w/2, h/2, h*0.3, w/2, h/2, h*0.9);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.35)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      animId = requestAnimationFrame(draw);
    }

    const onMouseMove  = e => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onMouseLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    resize();
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="bg-canvas" />
      <header className="app-header">
        <div className="logo">
          Lumina <span>Calendar</span>
        </div>
        <div className="header-actions">
          <button className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>
    </>
  );
}
