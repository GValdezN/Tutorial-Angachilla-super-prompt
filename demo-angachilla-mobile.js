const { chromium } = require('playwright');
const path = require('path');

const SITE = 'https://angachilla.strategiccode.cl';
const W = 390, H = 844;

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

// =========================================================================
//  INJECTION: finger cursor, trail, overlays, title cards, scene badges
// =========================================================================

async function injectProduction(page) {
  await page.evaluate(() => {
    if (document.getElementById('prod-style')) return;
    const style = document.createElement('style');
    style.id = 'prod-style';
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');

      @keyframes fadeSlideUp {
        from { opacity: 0; transform: translate(-50%, 16px); }
        to   { opacity: 1; transform: translate(-50%, 0); }
      }
      @keyframes fadeSlideDown {
        from { opacity: 1; transform: translate(-50%, 0); }
        to   { opacity: 0; transform: translate(-50%, 16px); }
      }
      @keyframes scaleIn {
        from { opacity: 0; transform: translate(-50%,-50%) scale(0.7); }
        to   { opacity: 1; transform: translate(-50%,-50%) scale(1); }
      }
      @keyframes scaleOut {
        from { opacity: 1; transform: translate(-50%,-50%) scale(1); }
        to   { opacity: 0; transform: translate(-50%,-50%) scale(1.15); }
      }
      @keyframes tapPulse {
        0%   { transform: translate(-24px,-24px) scale(1); opacity: .7; }
        50%  { transform: translate(-24px,-24px) scale(.7); opacity: 1; }
        100% { transform: translate(-24px,-24px) scale(1); opacity: .7; }
      }
      @keyframes ringPulse {
        0%   { transform: translate(-50%,-50%) scale(1); opacity: .6; }
        50%  { transform: translate(-50%,-50%) scale(1.6); opacity: 0; }
        100% { transform: translate(-50%,-50%) scale(1.6); opacity: 0; }
      }
      @keyframes trailFade {
        from { opacity: .35; transform: scale(1); }
        to   { opacity: 0;  transform: scale(.2); }
      }

      #demo-finger {
        position: fixed; top: 0; left: 0; z-index: 2147483647;
        width: 48px; height: 48px; border-radius: 50%;
        background: radial-gradient(circle at 40% 35%,
          rgba(255,255,255,.85) 0%, rgba(255,255,255,.25) 50%, transparent 100%);
        border: 2.5px solid rgba(255,255,255,.85);
        box-shadow: 0 0 24px rgba(0,0,0,.25), 0 0 8px rgba(56,189,248,.3),
                    inset 0 0 10px rgba(255,255,255,.25);
        pointer-events: none; opacity: 0;
        transition: transform .35s cubic-bezier(.4,0,.2,1), opacity .25s;
        transform: translate(-24px, -24px);
      }
      .finger-trail {
        position: fixed; z-index: 2147483646; pointer-events: none;
        width: 10px; height: 10px; border-radius: 50%;
        background: radial-gradient(circle, rgba(56,189,248,.4), transparent);
        animation: trailFade .5s ease forwards;
      }

      #demo-overlay {
        position: fixed; bottom: 94px; left: 50%; transform: translateX(-50%);
        z-index: 2147483645; pointer-events: none; opacity: 0;
        font-family: 'Inter', system-ui, sans-serif;
        text-align: center; max-width: 350px;
      }
      #demo-overlay .ov-box {
        background: linear-gradient(135deg, rgba(15,23,42,.9), rgba(30,41,59,.9));
        color: #fff; padding: 12px 22px; border-radius: 14px;
        backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,.1);
        box-shadow: 0 8px 36px rgba(0,0,0,.35);
      }
      #demo-overlay .ov-label {
        font-size: 9px; font-weight: 700; text-transform: uppercase;
        letter-spacing: .12em; color: #94a3b8; margin-bottom: 3px;
      }
      #demo-overlay .ov-text {
        font-size: 15px; font-weight: 700; line-height: 1.3;
      }

      #demo-title-card {
        position: fixed; inset: 0; z-index: 2147483647;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        pointer-events: none; opacity: 0;
        font-family: 'Inter', system-ui, sans-serif;
      }
      #demo-title-card .tc-bg {
        position: absolute; inset: 0;
        background: linear-gradient(160deg, #1e3a4f 0%, #0f172a 50%, #1e293b 100%);
      }
      #demo-title-card .tc-content {
        position: relative; text-align: center; color: white; padding: 32px 24px;
      }
      #demo-title-card .tc-logo { font-size: 12px; font-weight: 600; color: #94a3b8; letter-spacing: .1em; text-transform: uppercase; margin-bottom: 12px; }
      #demo-title-card .tc-title { font-size: 32px; font-weight: 900; line-height: 1.1; letter-spacing: -.02em; margin-bottom: 8px; }
      #demo-title-card .tc-title span { background: linear-gradient(135deg, #38bdf8, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      #demo-title-card .tc-sub { font-size: 14px; font-weight: 500; color: #cbd5e1; }
      #demo-title-card .tc-badge { margin-top: 20px; display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; color: #38bdf8; border: 1.5px solid rgba(56,189,248,.35); background: rgba(56,189,248,.08); letter-spacing: .04em; }

      #demo-scene {
        position: fixed; top: 10px; left: 50%; z-index: 2147483645;
        transform: translateX(-50%); pointer-events: none; opacity: 0;
        font-family: 'Inter', system-ui, sans-serif;
        background: rgba(255,255,255,.92); color: #1e293b;
        padding: 5px 16px; border-radius: 8px; font-size: 10px; font-weight: 700;
        letter-spacing: .05em; text-transform: uppercase;
        box-shadow: 0 2px 12px rgba(0,0,0,.12); border: 1px solid rgba(0,0,0,.05);
        backdrop-filter: blur(8px);
      }

      #demo-highlight {
        position: fixed; z-index: 2147483644; pointer-events: none;
        width: 50px; height: 50px; border-radius: 50%;
        border: 2.5px solid rgba(56,189,248,.7);
        box-shadow: 0 0 20px rgba(56,189,248,.3), inset 0 0 10px rgba(56,189,248,.1);
        opacity: 0; transition: opacity .3s, transform .35s cubic-bezier(.4,0,.2,1);
      }
    `;
    document.head.appendChild(style);

    // finger cursor
    const f = document.createElement('div');
    f.id = 'demo-finger';
    document.body.appendChild(f);

    // overlay
    const ov = document.createElement('div');
    ov.id = 'demo-overlay';
    ov.innerHTML = '<div class="ov-box"><div class="ov-label"></div><div class="ov-text"></div></div>';
    document.body.appendChild(ov);

    // title card
    const tc = document.createElement('div');
    tc.id = 'demo-title-card';
    tc.innerHTML = `<div class="tc-bg"></div><div class="tc-content">
      <div class="tc-logo">Reserva Comunitaria</div>
      <div class="tc-title">Bosque Humedal<br><span>Angachilla</span></div>
      <div class="tc-sub">Valdivia · 20 hectáreas de santuario</div>
      <div class="tc-badge">VERSIÓN MÓVIL</div>
    </div>`;
    document.body.appendChild(tc);

    // scene badge
    const sc = document.createElement('div');
    sc.id = 'demo-scene';
    document.body.appendChild(sc);

    // highlight
    const hl = document.createElement('div');
    hl.id = 'demo-highlight';
    document.body.appendChild(hl);
  });
}

async function moveFinger(page, x, y) {
  await page.evaluate(([cx, cy]) => {
    const f = document.getElementById('demo-finger');
    if (!f) return;
    const rect = f.getBoundingClientRect();
    for (let i = 0; i < 2; i++) {
      const dot = document.createElement('div');
      dot.className = 'finger-trail';
      dot.style.left = (rect.left + 24) + 'px';
      dot.style.top = (rect.top + 24) + 'px';
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 500);
    }
    f.style.opacity = '1';
    f.style.transform = `translate(${cx - 24}px, ${cy - 24}px)`;
  }, [x, y]);
  await page.mouse.move(x, y, { steps: 15 });
  await wait(180);
}

async function tapAt(page, x, y) {
  await moveFinger(page, x, y);
  await page.evaluate(([cx, cy]) => {
    const f = document.getElementById('demo-finger');
    if (f) f.style.animation = 'tapPulse .35s ease';
    setTimeout(() => { if (f) f.style.animation = 'none'; }, 350);
  }, [x, y]);
  await wait(350);
}

async function hideFinger(page) {
  await page.evaluate(() => {
    const f = document.getElementById('demo-finger');
    if (f) f.style.opacity = '0';
  });
}

async function highlightAt(page, x, y, size = 50) {
  await page.evaluate(([cx, cy, s]) => {
    const hl = document.getElementById('demo-highlight');
    if (!hl) return;
    hl.style.width = s + 'px'; hl.style.height = s + 'px';
    hl.style.left = cx + 'px'; hl.style.top = cy + 'px';
    hl.style.transform = 'translate(-50%,-50%)';
    hl.style.opacity = '1';
    hl.style.animation = 'ringPulse .9s ease forwards';
  }, [x, y, size]);
  await wait(900);
  await page.evaluate(() => {
    const hl = document.getElementById('demo-highlight');
    if (hl) { hl.style.opacity = '0'; hl.style.animation = 'none'; }
  });
}

async function showOverlay(page, label, text) {
  await page.evaluate(([l, t]) => {
    const ov = document.getElementById('demo-overlay');
    if (!ov) return;
    ov.querySelector('.ov-label').textContent = l;
    ov.querySelector('.ov-text').textContent = t;
    ov.style.opacity = '1';
    ov.style.animation = 'fadeSlideUp .45s ease forwards';
  }, [label, text]);
}

async function hideOverlay(page) {
  await page.evaluate(() => {
    const ov = document.getElementById('demo-overlay');
    if (!ov) return;
    ov.style.animation = 'fadeSlideDown .35s ease forwards';
    setTimeout(() => { ov.style.opacity = '0'; ov.style.animation = 'none'; }, 350);
  });
  await wait(350);
}

async function showScene(page, text) {
  await page.evaluate((t) => {
    const sc = document.getElementById('demo-scene');
    if (sc) { sc.textContent = t; sc.style.opacity = '1'; }
  }, text);
}

async function hideScene(page) {
  await page.evaluate(() => {
    const sc = document.getElementById('demo-scene');
    if (sc) sc.style.opacity = '0';
  });
}

async function showTitle(page) {
  await page.evaluate(() => {
    const tc = document.getElementById('demo-title-card');
    if (tc) { tc.style.opacity = '1'; tc.style.animation = 'scaleIn .7s cubic-bezier(.16,1,.3,1) forwards'; }
  });
}

async function hideTitle(page) {
  await page.evaluate(() => {
    const tc = document.getElementById('demo-title-card');
    if (tc) { tc.style.animation = 'scaleOut .5s ease forwards'; setTimeout(() => tc.style.display = 'none', 500); }
  });
}

async function smoothScroll(page, dy, duration = 700) {
  await page.evaluate(([d, dur]) => {
    const s = window.scrollY, t0 = performance.now();
    function step(now) {
      const t = Math.min((now - t0) / dur, 1);
      const e = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
      window.scrollTo(0, s + d * e);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [dy, duration]);
  await wait(duration + 80);
}

async function dismissCookies(page) {
  await page.evaluate(() => {
    for (const b of document.querySelectorAll('button')) {
      if (b.textContent.includes('Aceptar') && b.closest('[role="region"]')) { b.click(); break; }
    }
  });
  await wait(300);
}

async function closeBanner(page) {
  await page.evaluate(() => {
    document.querySelector('[aria-label*="Cerrar aviso"], aside button')?.click();
  });
  await wait(300);
}

// =========================================================================
//  MAIN
// =========================================================================

(async () => {
  const browser = await chromium.launch({
    headless: false,
    ignoreDefaultArgs: ['--enable-automation'],
    args: ['--disable-blink-features=AutomationControlled']
  });

  const ctx = await browser.newContext({
    viewport: { width: W, height: H },
    recordVideo: { dir: path.join(__dirname, 'videos'), size: { width: W, height: H } },
    locale: 'es-CL', colorScheme: 'light',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    isMobile: true, hasTouch: true, deviceScaleFactor: 2
  });

  const page = await ctx.newPage();
  page.setDefaultTimeout(12000);

  // ===== INTRO: Title Card (0-4s) =======================================
  await page.goto(SITE, { waitUntil: 'networkidle' });
  await dismissCookies(page);
  await closeBanner(page);
  await injectProduction(page);
  await showTitle(page);
  await wait(3500);
  await hideTitle(page);
  await wait(600);

  // ===== ESCENA 1: Portada + entrar (4-10s) =============================
  await showScene(page, '01 — PORTADA');
  await showOverlay(page, 'App gratuita', 'Angachilla — Descárgala en iOS y Android');
  await moveFinger(page, 195, 300);
  await wait(1500);

  // enter app
  try {
    const enterBtn = page.locator('[data-testid="enter-app"]').first();
    await enterBtn.waitFor({ state: 'visible', timeout: 4000 });
    const eb = await enterBtn.boundingBox();
    if (eb) { await tapAt(page, eb.x + eb.width/2, eb.y + eb.height/2); await highlightAt(page, eb.x + eb.width/2, eb.y + eb.height/2, 60); }
    await enterBtn.click();
    await wait(1500);
    await injectProduction(page);
  } catch (e) { /* already in app */ }

  // ===== ESCENA 2: Comunidad (10-18s) ===================================
  await hideOverlay(page); await hideScene(page);
  await showScene(page, '02 — COMUNIDAD');
  await showOverlay(page, 'Feed comunitario', 'Avisos oficiales · Publicaciones · Buzón ciudadano');
  await smoothScroll(page, 200, 900);
  await wait(600);
  await moveFinger(page, 195, 300);
  await wait(500);
  await moveFinger(page, 300, 460);
  await highlightAt(page, 300, 460, 50);
  await wait(500);
  await hideFinger(page);
  await smoothScroll(page, 300, 800);
  await wait(1200);

  // ===== ESCENA 3: Mapa (18-28s) ========================================
  await hideOverlay(page); await hideScene(page);
  await showScene(page, '03 — MAPA SATELITAL');
  await showOverlay(page, 'GPS offline', 'Circuitos con geolocalización — funciona sin señal');
  await page.goto(SITE + '/mapa', { waitUntil: 'networkidle' });
  await wait(2200);
  await injectProduction(page);
  await showScene(page, '03 — MAPA SATELITAL');
  await showOverlay(page, 'GPS offline', 'Circuitos con geolocalización — funciona sin señal');
  await moveFinger(page, 195, 400);
  await wait(800);

  try {
    const zorroTab = page.locator('button:has-text("Circuito del Zorro")').first();
    const ztBox = await zorroTab.boundingBox().catch(() => null);
    if (ztBox) {
      await tapAt(page, ztBox.x + ztBox.width/2, ztBox.y + ztBox.height/2);
      await highlightAt(page, ztBox.x + ztBox.width/2, ztBox.y + ztBox.height/2, 55);
      await zorroTab.click();
      await wait(1000);
    }
  } catch (e) { /* skip */ }

  await hideOverlay(page);
  await showOverlay(page, 'Circuito del Zorro', '1,62 km · 66 min · Dificultad Fácil');
  await moveFinger(page, 100, 720);
  await wait(400);
  await moveFinger(page, 280, 720);
  await wait(1500);
  await hideFinger(page);

  // ===== ESCENA 4: Guía de Especies (28-42s) ============================
  await hideOverlay(page); await hideScene(page);
  await showScene(page, '04 — GUÍA DE ESPECIES');
  await showOverlay(page, '138 especies', 'Flora, fauna y Reino Fungi con nombre en mapudungun');
  await page.goto(SITE + '/especies', { waitUntil: 'networkidle' });
  await wait(1500);
  await injectProduction(page);
  await showScene(page, '04 — GUÍA DE ESPECIES');
  await showOverlay(page, '138 especies', 'Flora, fauna y Reino Fungi con nombre en mapudungun');
  await wait(800);

  // hero illustrations
  await smoothScroll(page, 300, 900);
  await hideOverlay(page);
  await showOverlay(page, '¿Sabías que...?', 'Aquí vive la garza, el roedor y el anfibio más grande de Chile');
  await moveFinger(page, 100, 480);
  await wait(500);
  await moveFinger(page, 300, 400);
  await wait(1000);
  await hideFinger(page);

  // tap Especies tab
  await hideOverlay(page);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await wait(600);
  await showOverlay(page, 'Catálogo', 'Filtros por hábitat, grupo biológico y conservación');
  try {
    const espTab = page.locator('button:has-text("Especies")').first();
    const espBox = await espTab.boundingBox().catch(() => null);
    if (espBox) {
      await tapAt(page, espBox.x + espBox.width/2, espBox.y + espBox.height/2);
      await highlightAt(page, espBox.x + espBox.width/2, espBox.y + espBox.height/2, 45);
    }
    await espTab.click();
    await wait(1000);
  } catch (e) { /* skip */ }

  // scroll to trigger lazy load + open Cisne
  for (let i = 0; i < 5; i++) { await smoothScroll(page, 400, 350); await wait(250); }
  await wait(500);

  await hideOverlay(page);
  await showOverlay(page, 'Ficha de especie', 'Cisne de Cuello Negro — Wañke en mapudungun');
  try {
    const cisne = page.locator('button[title*="Cisne"], button:has-text("Cisne de Cuello Negro")').first();
    await cisne.waitFor({ state: 'attached', timeout: 4000 });
    await cisne.scrollIntoViewIfNeeded({ timeout: 3000 });
    await wait(300);
    const cb = await cisne.boundingBox();
    if (cb) { await tapAt(page, cb.x + cb.width/2, cb.y + cb.height/2); await highlightAt(page, cb.x + cb.width/2, cb.y + cb.height/2, 60); }
    await cisne.click({ timeout: 5000 });
    await wait(2500);
    try {
      const audio = page.locator('button:has-text("Escuchar silbido")').first();
      const ab = await audio.boundingBox().catch(() => null);
      if (ab) { await moveFinger(page, ab.x + ab.width/2, ab.y + ab.height/2); await highlightAt(page, ab.x + ab.width/2, ab.y + ab.height/2, 50); await wait(800); }
    } catch (e) { /* skip */ }
    await hideFinger(page);
    await page.keyboard.press('Escape');
    await wait(400);
  } catch (e) {
    console.log('Cisne skipped (mobile):', e.message);
    await hideFinger(page);
    await wait(600);
  }

  // ===== ESCENA 5: Calendario (42-48s) ==================================
  await hideOverlay(page); await hideScene(page);
  await showScene(page, '05 — CALENDARIO');
  await showOverlay(page, 'Actividades', 'Caminatas guiadas · Talleres · Voluntariados');
  await page.goto(SITE + '/eventos', { waitUntil: 'networkidle' });
  await wait(500);
  await injectProduction(page);
  await showScene(page, '05 — CALENDARIO');
  await showOverlay(page, 'Actividades', 'Caminatas guiadas · Talleres · Voluntariados');
  await moveFinger(page, 195, 450);
  await wait(1500);
  await hideFinger(page);

  // ===== ESCENA 6: Donar (48-54s) =======================================
  await hideOverlay(page); await hideScene(page);
  await showScene(page, '06 — APORTAR');
  await showOverlay(page, 'Cuida el santuario', 'Tu aporte mantiene circuitos y protege la biodiversidad');
  await page.goto(SITE + '/donar', { waitUntil: 'networkidle' });
  await wait(500);
  await injectProduction(page);
  await showScene(page, '06 — APORTAR');
  await showOverlay(page, 'Cuida el santuario', 'Tu aporte mantiene circuitos y protege la biodiversidad');
  await smoothScroll(page, 180, 600);
  await moveFinger(page, 195, 350);
  await highlightAt(page, 195, 350, 55);
  await wait(500);
  await moveFinger(page, 195, 410);
  await wait(800);
  await hideFinger(page);

  // ===== OUTRO (54-58s) =================================================
  await hideOverlay(page); await hideScene(page);
  await wait(300);

  await page.evaluate(() => {
    const tc = document.getElementById('demo-title-card');
    if (!tc) return;
    tc.style.display = 'flex';
    tc.querySelector('.tc-logo').textContent = 'DESCÁRGALA GRATIS';
    tc.querySelector('.tc-title').innerHTML = '<span>angachilla.strategiccode.cl</span>';
    tc.querySelector('.tc-sub').textContent = 'Google Play · App Store · Web';
    tc.querySelector('.tc-badge').textContent = 'DISPONIBLE AHORA';
    tc.style.opacity = '1';
    tc.style.animation = 'scaleIn .7s cubic-bezier(.16,1,.3,1) forwards';
  });
  await wait(3500);

  // --- save video -------------------------------------------------------
  await page.close();
  const videoPath = await page.video().path();
  console.log('✅ Video MOBILE:', path.resolve(videoPath));
  await ctx.close();
  await browser.close();
})();
