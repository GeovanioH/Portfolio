/* ═══════════════════════════════════════════════════════════
   1. TEXT SCRAMBLE ENGINE
═══════════════════════════════════════════════════════════ */
class Scramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$%';
    this._update = this._update.bind(this);
  }
  run(txt) {
    const len = txt.length;
    this._q = [];
    for (let i = 0; i < len; i++) {
      const s = Math.floor(Math.random() * 16);
      const e = s + Math.floor(Math.random() * 14) + 4;
      this._q.push({ to: txt[i], s, e, c: '' });
    }
    this._f = 0;
    cancelAnimationFrame(this._raf);
    this._update();
  }
  _update() {
    let out = '', done = 0;
    for (let i = 0; i < this._q.length; i++) {
      const item = this._q[i];
      if (this._f >= item.e) {
        done++;
        out += item.to;
      } else if (this._f >= item.s) {
        if (!item.c || Math.random() < 0.28) {
          item.c = this.chars[Math.random() * this.chars.length | 0];
        }
        out += `<span class="gc">${item.c}</span>`;
      } else {
        out += item.to;
      }
    }
    this.el.innerHTML = out;
    if (done < this._q.length) {
      this._raf = requestAnimationFrame(this._update);
      this._f++;
    }
  }
}

/* ═══════════════════════════════════════════════════════════
   2. ANIMATED NOISE GRAIN
═══════════════════════════════════════════════════════════ */
(function initNoise() {
  const c = document.getElementById('noise-canvas');
  const ctx = c.getContext('2d');
  let W, H;
  const resize = () => { W = c.width = innerWidth; H = c.height = innerHeight; };
  resize();
  addEventListener('resize', resize);

  let tick = 0;
  function loop() {
    tick++;
    // Only redraw every 2 frames for performance
    if (tick % 2 === 0) {
      const img = ctx.createImageData(W, H);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 255 | 0;
        d[i] = d[i+1] = d[i+2] = v;
        d[i+3] = 22;
      }
      ctx.putImageData(img, 0, 0);
    }
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ═══════════════════════════════════════════════════════════
   3. CHROMATIC ABERRATION FLASH
═══════════════════════════════════════════════════════════ */
const chromaCanvas = document.getElementById('chroma-overlay');
const chromaCtx    = chromaCanvas.getContext('2d');
let chromaW, chromaH;
(function() {
  const r = () => { chromaW = chromaCanvas.width = innerWidth; chromaH = chromaCanvas.height = innerHeight; };
  r(); addEventListener('resize', r);
})();

function chromaFlash(dur = 300) {
  chromaCanvas.style.opacity = '1';
  chromaCtx.clearRect(0, 0, chromaW, chromaH);

  // Red shift left
  chromaCtx.fillStyle = 'rgba(255,0,80,0.22)';
  chromaCtx.fillRect(0, 0, chromaW, chromaH);

  // Blue shift right (composite)
  chromaCtx.fillStyle = 'rgba(0,150,255,0.18)';
  chromaCtx.fillRect(6, 0, chromaW, chromaH);

  // Radial white flash
  const grad = chromaCtx.createRadialGradient(chromaW/2, chromaH/2, 0, chromaW/2, chromaH/2, Math.hypot(chromaW, chromaH)*0.6);
  grad.addColorStop(0, 'rgba(255,255,255,0.1)');
  grad.addColorStop(1, 'transparent');
  chromaCtx.fillStyle = grad;
  chromaCtx.fillRect(0, 0, chromaW, chromaH);

  // Fade out
  let t = 0;
  const step = 14;
  const id = setInterval(() => {
    t += step;
    const a = Math.max(0, 1 - t / dur);
    chromaCanvas.style.opacity = a.toString();
    if (t >= dur) {
      clearInterval(id);
      chromaCanvas.style.opacity = '0';
      chromaCtx.clearRect(0, 0, chromaW, chromaH);
    }
  }, step);
}

/* ═══════════════════════════════════════════════════════════
   4. INTRO SEQUENCE
═══════════════════════════════════════════════════════════ */
(function initIntro() {
  const intro   = document.getElementById('intro');
  const iCanvas = document.getElementById('intro-canvas');
  const ictx    = iCanvas.getContext('2d');
  const nameEl  = document.getElementById('intro-name');
  const barEl   = document.getElementById('introBar');
  const statEl  = document.getElementById('introStatus');
  let W, H, ptcs = [], iRaf;

  const resize = () => {
    W = iCanvas.width = innerWidth;
    H = iCanvas.height = innerHeight;
  };
  resize();

  // Create intro particles that fly in from edges
  function mkPtcs() {
    ptcs = [];
    const count = Math.min(260, (W * H) / 9000 | 0);
    for (let i = 0; i < count; i++) {
      const edge = Math.random() < 0.5 ? 'x' : 'y';
      let sx, sy;
      if (edge === 'x') { sx = Math.random() < 0.5 ? -100 : W+100; sy = Math.random()*H; }
      else               { sy = Math.random() < 0.5 ? -100 : H+100; sx = Math.random()*W; }
      const spread = 240;
      ptcs.push({
        x: sx, y: sy,
        tx: W/2 + (Math.random()-0.5)*spread,
        ty: H/2 + (Math.random()-0.5)*spread*0.6,
        vx: 0, vy: 0,
        size: Math.random()*1.8+0.3,
        spd: 0.028 + Math.random()*0.04,
        col: Math.random()<0.58 ? '#2563ff' : Math.random()<0.55 ? '#ff5c1a' : '#9aabd4',
        a: 0
      });
    }
  }
  mkPtcs();

  let frame = 0;
  function drawIntro() {
    iRaf = requestAnimationFrame(drawIntro);
    ictx.fillStyle = 'rgba(5,8,16,0.16)';
    ictx.fillRect(0, 0, W, H);
    frame++;

    // Grid after 20 frames
    if (frame > 20) {
      ictx.strokeStyle = 'rgba(37,99,255,0.04)';
      ictx.lineWidth = 0.5;
      const gs = 55;
      for (let x = 0; x < W; x += gs) { ictx.beginPath(); ictx.moveTo(x,0); ictx.lineTo(x,H); ictx.stroke(); }
      for (let y = 0; y < H; y += gs) { ictx.beginPath(); ictx.moveTo(0,y); ictx.lineTo(W,y); ictx.stroke(); }
    }

    // Particles converge to center
    ptcs.forEach(p => {
      p.vx += (p.tx - p.x) * p.spd;
      p.vy += (p.ty - p.y) * p.spd;
      p.vx *= 0.82; p.vy *= 0.82;
      p.x += p.vx;  p.y += p.vy;
      p.a = Math.min(1, p.a + 0.022);
      ictx.save();
      ictx.globalAlpha = p.a * 0.85;
      ictx.fillStyle = p.col;
      ictx.shadowBlur = 10; ictx.shadowColor = p.col;
      ictx.beginPath();
      ictx.arc(p.x, p.y, p.size, 0, Math.PI*2);
      ictx.fill();
      ictx.restore();
    });
  }
  drawIntro();

  // Text scramble on intro name
  const sc = new Scramble(nameEl);

  const statusMsgs = ['Chargement...', 'Initialisation Three.js...', 'Prêt.'];
  let si = 0;
  const statusInterval = setInterval(() => {
    si = (si + 1) % statusMsgs.length;
    statEl.textContent = statusMsgs[si];
  }, 700);

  // Start scramble + loader bar at 400ms
  setTimeout(() => {
    barEl.classList.add('go');
    sc.run('DENAKPO  GÉOVANIO');
  }, 400);

  // Exit at 2900ms
  setTimeout(() => {
    clearInterval(statusInterval);
    cancelAnimationFrame(iRaf);

    // Chromatic flash
    chromaFlash(500);

    // Slide intro up
    intro.style.transition = 'transform 0.85s cubic-bezier(0.77,0,0.18,1), opacity 0.6s ease';
    intro.style.transform  = 'translateY(-100%)';
    intro.style.opacity    = '0';

    setTimeout(() => {
      intro.style.display = 'none';
      document.body.classList.add('ready');
      scrambleHeroLines();
      setTimeout(startGlitch, 2500);
    }, 850);
  }, 2900);
})();

/* ═══════════════════════════════════════════════════════════
   5. HERO LINE SCRAMBLE (on intro exit)
═══════════════════════════════════════════════════════════ */
function scrambleHeroLines() {
  const spans = document.querySelectorAll('#heroName span');
  const texts = ['DENAKPO', 'HURIEL', 'GÉOVANIO'];
  spans.forEach((el, i) => {
    setTimeout(() => new Scramble(el).run(texts[i]), i * 140);
  });
}

/* ═══════════════════════════════════════════════════════════
   6. PERIODIC GLITCH on hero name
═══════════════════════════════════════════════════════════ */
function startGlitch() {
  const hn = document.getElementById('heroName');
  function fire() {
    hn.classList.add('glitching');
    // brief chroma on glitch
    chromaFlash(180);
    setTimeout(() => hn.classList.remove('glitching'), 300);
    setTimeout(fire, 4000 + Math.random() * 7000);
  }
  fire();
}

/* ═══════════════════════════════════════════════════════════
   7. THREE.JS — PARTICLES WITH MOUSE REPULSION
═══════════════════════════════════════════════════════════ */
(function initThree() {
  const canvas   = document.getElementById('canvas-bg');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000);
  camera.position.z = 6;

  const COUNT = 2400;
  const pos     = new Float32Array(COUNT*3);
  const origPos = new Float32Array(COUNT*3);
  const vel     = new Float32Array(COUNT*3);
  const cols    = new Float32Array(COUNT*3);

  const C1 = new THREE.Color('#2563ff');
  const C2 = new THREE.Color('#ff5c1a');
  const C3 = new THREE.Color('#8ab4f8');

  for (let i = 0; i < COUNT; i++) {
    const x = (Math.random()-0.5)*26;
    const y = (Math.random()-0.5)*26;
    const z = (Math.random()-0.5)*20;
    pos[i*3]   = origPos[i*3]   = x;
    pos[i*3+1] = origPos[i*3+1] = y;
    pos[i*3+2] = origPos[i*3+2] = z;
    const r = Math.random();
    const c = r<0.55 ? C1 : r<0.72 ? C2 : C3;
    cols[i*3]=c.r; cols[i*3+1]=c.g; cols[i*3+2]=c.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(cols, 3));

  const mat = new THREE.PointsMaterial({
    size:0.052, vertexColors:true, transparent:true, opacity:0.7, sizeAttenuation:true
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);

  // Connecting lines
  const lineMat = new THREE.LineBasicMaterial({ color:0x2563ff, transparent:true, opacity:0.05 });
  const lineGrp = new THREE.Group();
  for (let i = 0; i < 90; i++) {
    const a = Math.random()*COUNT|0, b = Math.random()*COUNT|0;
    const lg = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(pos[a*3],pos[a*3+1],pos[a*3+2]),
      new THREE.Vector3(pos[b*3],pos[b*3+1],pos[b*3+2])
    ]);
    lineGrp.add(new THREE.Line(lg, lineMat));
  }
  scene.add(lineGrp);

  let mx = 0, my = 0;
  const m3 = { x:0, y:0 };
  addEventListener('mousemove', e => {
    mx = (e.clientX/innerWidth  - 0.5)*0.5;
    my = (e.clientY/innerHeight - 0.5)*0.35;
    m3.x = (e.clientX/innerWidth  * 2 - 1) * 5.5;
    m3.y = -(e.clientY/innerHeight * 2 - 1) * 5.5;
  });
  addEventListener('resize', () => {
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    const pa = geo.attributes.position;

    // Mouse repulsion with spring-back
    for (let i = 0; i < COUNT; i++) {
      const ix = i*3, iy=ix+1;
      const cx = pa.array[ix], cy = pa.array[iy];
      const dx = cx - m3.x, dy = cy - m3.y;
      const d  = Math.sqrt(dx*dx + dy*dy) + 0.001;
      if (d < 2.2) {
        const f = (2.2 - d) / 2.2 * 0.065;
        vel[ix] += (dx/d)*f;
        vel[iy] += (dy/d)*f;
      }
      // Spring back to origin
      vel[ix] += (origPos[ix] - cx) * 0.016;
      vel[iy] += (origPos[iy] - cy) * 0.016;
      // Dampen
      vel[ix] *= 0.86;
      vel[iy] *= 0.86;
      pa.array[ix] += vel[ix];
      pa.array[iy] += vel[iy];
    }
    pa.needsUpdate = true;

    pts.rotation.y  = t*0.013 + mx*0.2;
    pts.rotation.x  = t*0.006 + my*0.14;
    lineGrp.rotation.y = pts.rotation.y;
    lineGrp.rotation.x = pts.rotation.x;
    renderer.render(scene, camera);
  }
  animate();
})();

/* ═══════════════════════════════════════════════════════════
   8. CURSOR
═══════════════════════════════════════════════════════════ */
(function initCursor() {
  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  let cx=0,cy=0,rx=0,ry=0;

  addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    dot.style.left = cx+'px'; dot.style.top = cy+'px';
  });

  const hoverTargets = 'a,button,.skill-cell,.project-card,.side-dot,.tech-pill,.about-tag,.btn-primary,.btn-ghost';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => { dot.classList.add('hov'); ring.classList.add('hov'); });
    el.addEventListener('mouseleave', () => { dot.classList.remove('hov'); ring.classList.remove('hov'); });
  });

  (function lerp() {
    rx += (cx-rx)*0.1; ry += (cy-ry)*0.1;
    ring.style.left = rx+'px'; ring.style.top = ry+'px';
    requestAnimationFrame(lerp);
  })();
})();

/* ═══════════════════════════════════════════════════════════
   9. 3D TILT on project cards
═══════════════════════════════════════════════════════════ */
(function initTilt() {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x*15}deg) rotateX(${-y*15}deg) translateY(-8px) scale(1.01)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ═══════════════════════════════════════════════════════════
   10. CARD CHROMATIC HOVER EFFECT
═══════════════════════════════════════════════════════════ */
(function initCardChroma() {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.classList.add('chroma-on');
      setTimeout(() => card.classList.remove('chroma-on'), 280);
    });
  });
})();

/* ═══════════════════════════════════════════════════════════
   11. SCROLL REVEALS + SECTION CHROMA FLASH
═══════════════════════════════════════════════════════════ */
(function initReveals() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('vis');

      // Scramble section headings on reveal
      if (e.target.classList.contains('section-title')) {
        const spans = e.target.querySelectorAll('span');
        spans.forEach(s => {
          const t = s.textContent;
          setTimeout(() => new Scramble(s).run(t), 300);
        });
        setTimeout(() => chromaFlash(220), 150);
      }
      obs.unobserve(e.target);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();

/* ═══════════════════════════════════════════════════════════
   12. SCROLL-TRIGGERED CHROMA on section change
═══════════════════════════════════════════════════════════ */
(function initSectionChroma() {
  let last = 'hero';
  const secs = document.querySelectorAll('section, .section-wrap, .contact-strip');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && e.target.id !== last && e.target.id) {
        last = e.target.id;
        if (e.target.id !== 'hero') setTimeout(() => chromaFlash(180), 80);
      }
    });
  }, { threshold: 0.35 });
  secs.forEach(s => obs.observe(s));
})();

/* ═══════════════════════════════════════════════════════════
   13. NAV ACTIVE + SIDE DOTS
═══════════════════════════════════════════════════════════ */
(function initNav() {
  const sections = ['hero','apropos','competences','projets'];
  const links    = document.querySelectorAll('.nav-links a');
  const dots     = document.querySelectorAll('.side-dot');

  const set = id => {
    links.forEach(a => a.classList.toggle('active', a.dataset.section===id));
    dots.forEach(d =>  d.classList.toggle('active',  d.dataset.target===id));
  };

  dots.forEach(d => d.addEventListener('click', () =>
    document.getElementById(d.dataset.target)?.scrollIntoView({ behavior:'smooth' })
  ));

  const obs = new IntersectionObserver(entries =>
    entries.forEach(e => { if (e.isIntersecting) set(e.target.id); }),
    { threshold: 0.38 }
  );
  sections.forEach(id => { const el = document.getElementById(id); if(el) obs.observe(el); });
})();

/* ═══════════════════════════════════════════════════════════
   14. SCROLL PROGRESS BAR
═══════════════════════════════════════════════════════════ */
(function initProgress() {
  const bar = document.getElementById('progress-bar');
  addEventListener('scroll', () => {
    const pct = scrollY / (document.documentElement.scrollHeight - innerHeight) * 100;
    bar.style.width = pct + '%';
  }, { passive:true });
})();

/* ═══════════════════════════════════════════════════════════
   15. MARQUEE TECH STACK
═══════════════════════════════════════════════════════════ */
(function initMarquee() {
  const track = document.getElementById('marqueeTrack');
  const techs = ['HTML','CSS','JavaScript','React.js','TypeScript','Python','SQL Server','Supabase','Make','n8n','Git & GitHub','Netlify','Groq API','Claude API','REST API','TailwindCSS','Figma','Flutter'];
  [...techs,...techs].forEach(t => {
    const el = document.createElement('span');
    el.className = 'tech-pill';
    el.textContent = t;
    track.appendChild(el);
  });
})();
