// FINAL ROUND site: character select, move list, stages, painted ember/smoke particles, scroll reveals.
(() => {
  const D = window.FR_DATA, $ = s => document.querySelector(s);
  const ART = { fighter1: 'renegade' }; // roster id -> full-art file
  const STAGES = ['SUNSET ROOFTOP', 'JUNGLE RUINS', 'THE STUDIO', 'BROKEN BRIDGE', 'PLATFORM 3', 'THE MANSION', 'SUBWAY'];
  const SIG = { weapon: 'Special', power: 'Power move', crouchHeavy: 'Launcher' };

  // nav goes solid after the hero
  const nav = $('.nav'); const onScroll = () => nav.classList.toggle('solid', scrollY > 60); addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // ---- character select ----
  const grid = $('#grid'), big = $('#bigArt'); let cur = null;
  const artOf = id => `assets/fighters/${ART[id] || id}.webp`;
  D.roster.forEach(r => { const b = document.createElement('button'); b.className = 'tile'; b.setAttribute('role', 'option'); b.dataset.id = r.id;
    b.innerHTML = `<img src="${artOf(r.id)}" alt="" loading="lazy"><b>${r.name}</b>${D.defs[r.id] ? '' : '<span class="soon">SOON</span>'}`;
    b.addEventListener('click', () => pick(r.id)); b.addEventListener('mouseenter', () => matchMedia('(hover:hover)').matches && pick(r.id, true)); grid.appendChild(b); });
  const maxDmg = Math.max(...Object.values(D.defs).flatMap(d => d.moves.map(m => m.dmg || 0)));
  const maxWalk = Math.max(...Object.values(D.defs).map(d => d.walk));
  function pick(id, hover) {
    if (id === cur) return; cur = id; const r = D.roster.find(x => x.id === id), d = D.defs[id];
    grid.querySelectorAll('.tile').forEach(t => t.classList.toggle('on', t.dataset.id === id));
    big.classList.remove('in'); big.src = artOf(id); big.alt = r.name; void big.offsetWidth; big.classList.add('in');
    $('#fName').textContent = r.name; $('#nameGhost').textContent = r.name;
    const sig = d && d.moves.find(m => m.key === 'weapon') || d && d.moves.find(m => m.key === 'power');
    $('#fTag').textContent = d ? (sig ? `${SIG[sig.key] || 'Signature'}: ${sig.name}` : 'Street fighter') : 'Coming soon';
    const st = d ? { Power: Math.max(...d.moves.map(m => m.dmg || 0)) / maxDmg, Speed: 1 - (Math.min(...d.moves.map(m => m.st || 9)) - 2) / 10, Mobility: d.walk / maxWalk, Moves: d.moves.length / 7 } : { Power: 0, Speed: 0, Mobility: 0, Moves: 0 };
    $('#fStats').innerHTML = Object.entries(st).map(([k]) => `<div class="stat">${k}<div class="bar"><i></i></div></div>`).join('');
    requestAnimationFrame(() => [...$('#fStats').querySelectorAll('i')].forEach((el, i) => el.style.width = Math.round(Math.max(0.08, Math.min(1, Object.values(st)[i])) * 100) + '%'));
    $('#movesFor').textContent = r.name;
    $('#moves').innerHTML = d ? d.moves.map((m, i) => `<div class="move" style="animation-delay:${i * 60}ms"><div class="pic"><img src="${m.img}" alt="${m.name}" loading="lazy"></div>
      <div class="info"><div class="inp">${m.input}</div><h5>${m.name}</h5><div class="meta"><span>DMG <b>${m.dmg}</b></span><span>Startup <b>${m.st}f</b></span></div></div></div>`).join('')
      : '<div class="empty">Move list revealed soon</div>';
  }
  pick(D.roster[0].id);

  // ---- stages ----
  const sImg = $('#stageImg'), thumbs = $('#stageThumbs'); let si = 0;
  STAGES.forEach((n, i) => { const b = document.createElement('button'); b.setAttribute('aria-label', n); b.innerHTML = `<img src="assets/stages/stage${i + 1}.webp" alt="" loading="lazy">`; b.onclick = () => showStage(i); thumbs.appendChild(b); });
  function showStage(i) { si = (i + STAGES.length) % STAGES.length; sImg.classList.add('swap');
    setTimeout(() => { sImg.src = `assets/stages/stage${si + 1}.webp`; sImg.alt = STAGES[si]; sImg.onload = () => sImg.classList.remove('swap'); }, 220);
    $('#stageNo').textContent = String(si + 1).padStart(2, '0'); $('#stageName').textContent = STAGES[si];
    thumbs.querySelectorAll('button').forEach((b, k) => b.classList.toggle('on', k === si)); }
  $('#stPrev').onclick = () => showStage(si - 1); $('#stNext').onclick = () => showStage(si + 1); showStage(0);

  // ---- scroll reveals ----
  document.querySelectorAll('.sec-head, .select, .moves-wrap, .video-frame, .pillars, .stage-show, .sys-grid, .play-logo').forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('seen'); io.unobserve(e.target); } }), { threshold: .15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ---- painted particles: embers (fx28) rising, smoke (fx31/fx14) drifting low; only while on screen ----
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const load = s => { const i = new Image(); i.src = s; return i; };
  const EMB = [load('assets/fx/fx28.webp'), load('assets/fx/fx01.webp')], SMK = [load('assets/fx/fx31.webp'), load('assets/fx/fx14.webp')];
  function particles(cv, opt) {
    const g = cv.getContext('2d'); let W = 0, H = 0, P = [], vis = false, last = 0;
    const size = () => { const r = devicePixelRatio > 1.5 ? 1.5 : devicePixelRatio; W = cv.clientWidth; H = cv.clientHeight; cv.width = W * r; cv.height = H * r; g.setTransform(r, 0, 0, r, 0, 0); };
    const spawn = (y0) => { const smoke = Math.random() < opt.smoke;
      return smoke ? { s: 1, img: SMK[Math.random() * 2 | 0], x: Math.random() * W, y: H * (0.75 + Math.random() * 0.35), vx: (Math.random() - .5) * .25, vy: -.08 - Math.random() * .12, r: 260 + Math.random() * 320, a: 0, max: .08 + Math.random() * .08, rot: Math.random() * 6, vr: (Math.random() - .5) * .002, life: 0, ttl: 900 + Math.random() * 600 }
        : { s: 0, img: EMB[Math.random() < .8 ? 0 : 1], x: Math.random() * W, y: y0 ?? H + 20, vx: (Math.random() - .5) * .5, vy: -.5 - Math.random() * 1.3, r: 10 + Math.random() * 26, a: 0, max: .5 + Math.random() * .5, rot: Math.random() * 6, vr: (Math.random() - .5) * .04, life: 0, ttl: 260 + Math.random() * 260, ph: Math.random() * 6 }; };
    size(); addEventListener('resize', size); for (let i = 0; i < opt.n; i++) { const p = spawn(Math.random() * H); p.life = Math.random() * p.ttl; P.push(p); }
    new IntersectionObserver(e => { vis = e[0].isIntersecting; if (vis) { last = performance.now(); requestAnimationFrame(tick); } }).observe(cv);
    function tick(now) { if (!vis) return; const dt = Math.min(3, (now - last) / 16.7); last = now; g.clearRect(0, 0, W, H);
      for (let i = 0; i < P.length; i++) { const p = P[i]; p.life += dt; const k = p.life / p.ttl;
        if (k >= 1 || p.y < -60) { P[i] = spawn(); continue; }
        p.x += (p.vx + (p.s ? 0 : Math.sin(p.life * .03 + p.ph) * .35)) * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        p.a = p.max * Math.min(1, k * 6) * Math.min(1, (1 - k) * 3); if (!p.img.complete || !p.img.naturalWidth) continue;
        g.globalAlpha = p.a; g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.drawImage(p.img, -p.r / 2, -p.r / 2, p.r, p.r); g.restore(); }
      g.globalAlpha = 1; requestAnimationFrame(tick); }
  }
  particles($('#fxHero'), { n: 70, smoke: .18 }); particles($('#fxPlay'), { n: 45, smoke: .25 });
})();
