const { chromium } = require('playwright');
const path = require('path');

const SITE = 'https://angachilla.strategiccode.cl';
const W = 1280, H = 720;
const HEADLESS = !process.env.DISPLAY && process.platform === 'linux';

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

// =========================================================================
//  INJECTION: cursor with trail, overlay system, highlight ring, intro/outro
// =========================================================================

async function injectProduction(page) {
  await page.evaluate(() => {
    if (document.getElementById('prod-style')) return;
    const style = document.createElement('style');
    style.id = 'prod-style';
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');

      @keyframes fadeSlideUp {
        from { opacity: 0; transform: translate(-50%, 20px); }
        to   { opacity: 1; transform: translate(-50%, 0); }
      }
      @keyframes fadeSlideDown {
        from { opacity: 1; transform: translate(-50%, 0); }
        to   { opacity: 0; transform: translate(-50%, 20px); }
      }
      @keyframes scaleIn {
        from { opacity: 0; transform: translate(-50%,-50%) scale(0.7); }
        to   { opacity: 1; transform: translate(-50%,-50%) scale(1); }
      }
      @keyframes scaleOut {
        from { opacity: 1; transform: translate(-50%,-50%) scale(1); }
        to   { opacity: 0; transform: translate(-50%,-50%) scale(1.1); }
      }
      @keyframes pulseRing {
        0%   { transform: translate(-50%,-50%) scale(1);   opacity: .6; }
        50%  { transform: translate(-50%,-50%) scale(1.5); opacity: 0;  }
        100% { transform: translate(-50%,-50%) scale(1.5); opacity: 0;  }
      }
      @keyframes cursorPulse {
        0%, 100% { filter: drop-shadow(2px 4px 8px rgba(0,0,0,.35)); }
        50%      { filter: drop-shadow(2px 4px 16px rgba(59,110,140,.6)); }
      }
      @keyframes trailFade {
        from { opacity: .4; transform: scale(1); }
        to   { opacity: 0;  transform: scale(.3); }
      }

      #demo-cursor {
        position: fixed; top: 0; left: 0; z-index: 2147483647;
        pointer-events: none; transition: transform .4s cubic-bezier(.4,0,.2,1);
        animation: cursorPulse 2s ease infinite;
        transform-origin: 4px 1px;
      }
      #demo-cursor svg { width: 44px; height: 44px; }

      .cursor-trail {
        position: fixed; z-index: 2147483646; pointer-events: none;
        width: 12px; height: 12px; border-radius: 50%;
        background: radial-gradient(circle, rgba(59,110,140,.5), transparent);
        animation: trailFade .6s ease forwards;
      }

      #demo-overlay {
        position: fixed; bottom: 36px; left: 50%; transform: translateX(-50%);
        z-index: 2147483645; pointer-events: none; opacity: 0;
        font-family: 'Inter', system-ui, sans-serif;
        text-align: center; max-width: 850px;
      }
      #demo-overlay .ov-box {
        background: linear-gradient(135deg, rgba(15,23,42,.88), rgba(30,41,59,.88));
        color: #fff; padding: 16px 36px; border-radius: 16px;
        backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,.12);
        box-shadow: 0 12px 48px rgba(0,0,0,.35);
      }
      #demo-overlay .ov-label {
        font-size: 11px; font-weight: 700; text-transform: uppercase;
        letter-spacing: .12em; color: #94a3b8; margin-bottom: 4px;
      }
      #demo-overlay .ov-text {
        font-size: 20px; font-weight: 700; line-height: 1.3;
        letter-spacing: -.01em;
      }

      #demo-title-card {
        position: fixed; inset: 0; z-index: 2147483647;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        pointer-events: none; opacity: 0;
        font-family: 'Inter', system-ui, sans-serif;
      }
      #demo-title-card .tc-bg {
        position: absolute; inset: 0;
        background: linear-gradient(135deg, #1e3a4f 0%, #0f172a 50%, #1e293b 100%);
      }
      #demo-title-card .tc-content {
        position: relative; text-align: center; color: white; padding: 40px;
      }
      #demo-title-card .tc-logo { font-size: 18px; font-weight: 600; color: #94a3b8; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 16px; }
      #demo-title-card .tc-title { font-size: 48px; font-weight: 900; line-height: 1.1; letter-spacing: -.03em; margin-bottom: 12px; }
      #demo-title-card .tc-title span { background: linear-gradient(135deg, #38bdf8, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      #demo-title-card .tc-sub { font-size: 20px; font-weight: 500; color: #cbd5e1; }

      #demo-highlight {
        position: fixed; z-index: 2147483644; pointer-events: none;
        width: 60px; height: 60px; border-radius: 50%;
        border: 3px solid rgba(56,189,248,.7);
        box-shadow: 0 0 24px rgba(56,189,248,.3), inset 0 0 12px rgba(56,189,248,.1);
        opacity: 0; transition: opacity .3s, transform .4s cubic-bezier(.4,0,.2,1);
      }

      #demo-scene-title {
        position: fixed; top: 24px; left: 50%; z-index: 2147483645;
        transform: translateX(-50%); pointer-events: none; opacity: 0;
        font-family: 'Inter', system-ui, sans-serif;
        background: rgba(255,255,255,.92); color: #1e293b;
        padding: 8px 24px; border-radius: 10px; font-size: 13px; font-weight: 700;
        letter-spacing: .04em; text-transform: uppercase;
        box-shadow: 0 4px 20px rgba(0,0,0,.12); border: 1px solid rgba(0,0,0,.06);
        backdrop-filter: blur(8px);
      }
    `;
    document.head.appendChild(style);

    // cursor
    const cur = document.createElement('div');
    cur.id = 'demo-cursor';
    cur.innerHTML = `<svg viewBox="0 0 24 24" fill="none"><path d="M4 1L4 17.3L8.6 13.1L12.8 22L15.3 20.9L11.1 12L17.3 12L4 1Z" fill="white" stroke="#1a1a1a" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
    document.body.appendChild(cur);

    // overlay
    const ov = document.createElement('div');
    ov.id = 'demo-overlay';
    ov.innerHTML = '<div class="ov-box"><div class="ov-label"></div><div class="ov-text"></div></div>';
    document.body.appendChild(ov);

    // title card
    const tc = document.createElement('div');
    tc.id = 'demo-title-card';
    tc.innerHTML = `<div class="tc-bg"></div><div class="tc-content">
      <div class="tc-logo">RESERVA COMUNITARIA</div>
      <div class="tc-title">Bosque Humedal<br><span>Angachilla</span></div>
      <div class="tc-sub">Valdivia · 20 hectáreas de santuario protegido</div>
    </div>`;
    document.body.appendChild(tc);

    // highlight ring
    const hl = document.createElement('div');
    hl.id = 'demo-highlight';
    document.body.appendChild(hl);

    // scene title badge
    const st = document.createElement('div');
    st.id = 'demo-scene-title';
    document.body.appendChild(st);
  });
}

async function moveCursor(page, x, y) {
  // spawn trail dots
  await page.evaluate(([cx, cy]) => {
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'cursor-trail';
      const cur = document.getElementById('demo-cursor');
      const rect = cur?.getBoundingClientRect();
      dot.style.left = (rect ? rect.left + 6 : cx) + 'px';
      dot.style.top = (rect ? rect.top + 4 : cy) + 'px';
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 600);
    }
  }, [x, y]);
  await page.mouse.move(x, y, { steps: 25 });
  await page.evaluate(([cx, cy]) => {
    const el = document.getElementById('demo-cursor');
    if (el) el.style.transform = `translate(${cx}px, ${cy}px)`;
  }, [x, y]);
  await wait(150);
}

async function highlightAt(page, x, y, size = 60) {
  await page.evaluate(([cx, cy, s]) => {
    const hl = document.getElementById('demo-highlight');
    if (!hl) return;
    hl.style.width = s + 'px'; hl.style.height = s + 'px';
    hl.style.left = cx + 'px'; hl.style.top = cy + 'px';
    hl.style.transform = 'translate(-50%,-50%)';
    hl.style.opacity = '1';
    hl.style.animation = 'pulseRing 1s ease forwards';
  }, [x, y, size]);
  await wait(1000);
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
    ov.style.animation = 'fadeSlideUp .5s ease forwards';
  }, [label, text]);
}

async function hideOverlay(page) {
  await page.evaluate(() => {
    const ov = document.getElementById('demo-overlay');
    if (!ov) return;
    ov.style.animation = 'fadeSlideDown .4s ease forwards';
    setTimeout(() => { ov.style.opacity = '0'; ov.style.animation = 'none'; }, 400);
  });
  await wait(400);
}

async function showScene(page, text) {
  await page.evaluate((t) => {
    const st = document.getElementById('demo-scene-title');
    if (!st) return;
    st.textContent = t;
    st.style.opacity = '1';
    st.style.animation = 'fadeSlideUp .4s ease forwards';
    st.style.bottom = 'auto'; st.style.top = '24px';
  }, text);
}

async function hideScene(page) {
  await page.evaluate(() => {
    const st = document.getElementById('demo-scene-title');
    if (!st) return;
    st.style.opacity = '0';
  });
}

async function showTitleCard(page) {
  await page.evaluate(() => {
    const tc = document.getElementById('demo-title-card');
    if (tc) { tc.style.opacity = '1'; tc.style.animation = 'scaleIn .8s cubic-bezier(.16,1,.3,1) forwards'; }
  });
}

async function hideTitleCard(page) {
  await page.evaluate(() => {
    const tc = document.getElementById('demo-title-card');
    if (tc) { tc.style.animation = 'scaleOut .6s ease forwards'; setTimeout(() => { tc.style.display = 'none'; }, 600); }
  });
}

async function smoothScroll(page, dy, duration = 800) {
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
    document.querySelector('[aria-label*="Cerrar aviso"], aside[aria-label*="Descarga"] button')?.click();
  });
  await wait(300);
}

// =========================================================================
//  MAIN
// =========================================================================

(async () => {
  if (HEADLESS) console.log('⚡ Modo headless (sin display detectado)');
  const browser = await chromium.launch({
    headless: HEADLESS,
    ignoreDefaultArgs: ['--enable-automation'],
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });

  const ctx = await browser.newContext({
    viewport: { width: W, height: H },
    recordVideo: { dir: path.join(__dirname, 'videos'), size: { width: W, height: H } },
    locale: 'es-CL', colorScheme: 'light'
  });

  const page = await ctx.newPage();
  page.setDefaultTimeout(12000);

  // ===== INTRO: Title Card (0-4s) =======================================
  await page.goto(SITE, { waitUntil: 'networkidle' });
  await dismissCookies(page);
  await closeBanner(page);
  await injectProduction(page);
  await showTitleCard(page);
  await wait(3500);
  await hideTitleCard(page);
  await wait(800);

  // ===== ESCENA 1: Portada (4-14s) ======================================
  await showScene(page, '01 — PORTADA');
  await showOverlay(page, 'Bienvenido a la', 'Reserva Comunitaria Bosque Humedal Angachilla');
  await moveCursor(page, 300, 250);
  await wait(1500);
  await moveCursor(page, 940, 350);
  await highlightAt(page, 940, 350, 80);
  await wait(800);

  // download buttons
  await hideOverlay(page);
  await smoothScroll(page, 400, 1000);
  await showOverlay(page, 'Descarga gratis', 'Disponible en Google Play y App Store');
  await moveCursor(page, 200, 260);
  await highlightAt(page, 200, 260, 70);
  await moveCursor(page, 490, 260);
  await highlightAt(page, 490, 260, 70);
  await wait(800);

  // stats
  await hideOverlay(page);
  await smoothScroll(page, 350, 1000);
  await showOverlay(page, 'El humedal en cifras', '2 Circuitos · 10 Estaciones · 112 Especies · Calendario');
  await moveCursor(page, 400, 220);
  await wait(600);
  await moveCursor(page, 900, 220);
  await wait(1200);

  // ===== ESCENA 2: Agendar Recorrido (14-20s) ===========================
  await hideOverlay(page); await hideScene(page);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await wait(500);
  await showScene(page, '02 — AGENDAR VISITA GUIADA');
  await showOverlay(page, 'Recorrido guiado', 'Elige fecha, personas y el comité te confirma en 48 hrs');
  await moveCursor(page, 600, 44);
  await highlightAt(page, 600, 44, 50);
  await page.locator('button:has-text("Agendar Recorrido Guiado")').click();
  await wait(1800);
  await moveCursor(page, 630, 340);
  await wait(400);
  await moveCursor(page, 790, 665);
  await highlightAt(page, 790, 665, 60);
  await wait(800);
  await page.keyboard.press('Escape');
  await wait(400);

  // ===== ESCENA 3: Entrar (20-24s) ======================================
  await hideOverlay(page); await hideScene(page);
  await showScene(page, '03 — COMUNIDAD');
  await showOverlay(page, 'Plataforma comunitaria', 'Avisos, publicaciones y participación vecinal');
  const enterBtn = page.locator('[data-testid="enter-app"]');
  const eb = await enterBtn.boundingBox().catch(() => null);
  if (eb) { await moveCursor(page, eb.x + eb.width/2, eb.y + eb.height/2); await highlightAt(page, eb.x + eb.width/2, eb.y + eb.height/2, 70); }
  await enterBtn.click();
  await wait(1500);
  await injectProduction(page);
  await showScene(page, '03 — COMUNIDAD');
  await showOverlay(page, 'Feed comunitario', 'Avisos oficiales · Publicar experiencias · Buzón ciudadano');
  await moveCursor(page, 500, 350);
  await wait(1500);

  // Crear menu
  await hideOverlay(page);
  await showOverlay(page, 'Menú Crear', 'Subir fotos · Escribir · Enviar ideas · Escanear QR');
  try {
    const crBtn = page.locator('button:has-text("Crear")').first();
    const cb = await crBtn.boundingBox();
    if (cb) { await moveCursor(page, cb.x + cb.width/2, cb.y + cb.height/2); await highlightAt(page, cb.x + cb.width/2, cb.y + cb.height/2, 50); }
    await crBtn.click();
    await wait(2000);
    await moveCursor(page, 220, 190);
    await wait(400);
    await moveCursor(page, 220, 310);
    await wait(400);
    await moveCursor(page, 220, 400);
    await wait(400);
    await page.keyboard.press('Escape');
    await wait(300);
  } catch (e) { /* skip */ }

  // ===== ESCENA 4: Galería (24-29s) =====================================
  await hideOverlay(page); await hideScene(page);
  await showScene(page, '04 — GALERÍA');
  await showOverlay(page, 'Galería comunitaria', 'Fotos organizadas por estación del circuito');
  await page.locator('a[href="/galeria"]').first().click();
  await wait(1200);
  await injectProduction(page);
  await showScene(page, '04 — GALERÍA');
  await showOverlay(page, 'Galería comunitaria', 'Fotos organizadas por estación del circuito');
  await moveCursor(page, 450, 425);
  await wait(400);
  await moveCursor(page, 700, 425);
  await wait(400);
  await moveCursor(page, 1180, 254);
  await highlightAt(page, 1180, 254, 60);
  await wait(800);

  // ===== ESCENA 5: Mapa (29-37s) ========================================
  await hideOverlay(page); await hideScene(page);
  await showScene(page, '05 — MAPA SATELITAL');
  await page.locator('a[href="/mapa"]').first().click();
  await wait(2200);
  await injectProduction(page);
  await showScene(page, '05 — MAPA SATELITAL');
  await showOverlay(page, 'Circuitos con GPS', 'Mapa satelital · Circuito del Zorro (1,62 km · 66 min)');
  await moveCursor(page, 500, 400);
  await wait(800);
  await moveCursor(page, 1050, 285);
  await highlightAt(page, 1050, 285, 55);
  await wait(500);
  await moveCursor(page, 1050, 517);
  await highlightAt(page, 1050, 517, 70);
  await wait(800);
  await hideOverlay(page);
  await showOverlay(page, 'Recorrido guiado paso a paso', '1,62 km · 66 min · Dificultad Fácil');
  await wait(1800);

  // ===== ESCENA 6: Guía de Especies (37-50s) ============================
  await hideOverlay(page); await hideScene(page);
  await showScene(page, '06 — GUÍA DE ESPECIES');
  await page.locator('a[href="/especies"]').first().click();
  await wait(1500);
  await injectProduction(page);
  await showScene(page, '06 — GUÍA DE ESPECIES');
  await showOverlay(page, '138 especies registradas', 'Flora, fauna y Reino Fungi con nombre en mapudungun');
  await wait(1000);

  await smoothScroll(page, 500, 1000);
  await hideOverlay(page);
  await showOverlay(page, '¿Sabías que...?', 'Aquí viven la garza, el roedor y el anfibio más grandes de Chile');
  await wait(1200);
  await smoothScroll(page, 400, 900);
  await moveCursor(page, 400, 350);
  await wait(500);
  await moveCursor(page, 900, 350);
  await wait(1000);

  // Especies tab + Cisne
  await hideOverlay(page);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await wait(600);
  await showOverlay(page, 'Catálogo de especies', 'Filtros por hábitat, grupo biológico y conservación');
  try {
    const espTab = page.locator('button:has-text("Especies")').first();
    const etb = await espTab.boundingBox().catch(() => null);
    if (etb) { await moveCursor(page, etb.x + etb.width/2, etb.y + etb.height/2); await highlightAt(page, etb.x + etb.width/2, etb.y + etb.height/2, 50); }
    await espTab.click();
    await wait(1200);
  } catch (e) { /* skip */ }

  // scroll to load cards + open Cisne
  for (let i = 0; i < 4; i++) { await smoothScroll(page, 500, 350); await wait(300); }
  await wait(600);

  await hideOverlay(page);
  await showOverlay(page, 'Ficha de especie', 'Cisne de Cuello Negro — Wañke en mapudungun');
  try {
    const cisne = page.locator('button[title*="Cisne"], button:has-text("Cisne de Cuello Negro")').first();
    await cisne.waitFor({ state: 'attached', timeout: 4000 });
    await cisne.scrollIntoViewIfNeeded({ timeout: 3000 });
    await wait(300);
    const cb2 = await cisne.boundingBox();
    if (cb2) { await moveCursor(page, cb2.x + cb2.width/2, cb2.y + cb2.height/2); await highlightAt(page, cb2.x + cb2.width/2, cb2.y + cb2.height/2, 70); }
    await cisne.click({ timeout: 5000 });
    await wait(2500);
    try {
      const audio = page.locator('button:has-text("Escuchar silbido")').first();
      const ab = await audio.boundingBox().catch(() => null);
      if (ab) { await moveCursor(page, ab.x + ab.width/2, ab.y + ab.height/2); await highlightAt(page, ab.x + ab.width/2, ab.y + ab.height/2, 60); await wait(1000); }
    } catch (e) { /* skip */ }
    await page.keyboard.press('Escape');
    await wait(400);
  } catch (e) {
    console.log('Cisne skipped:', e.message);
    await wait(600);
  }

  // ===== ESCENA 7: Calendario (50-54s) ==================================
  await hideOverlay(page); await hideScene(page);
  await showScene(page, '07 — CALENDARIO');
  await showOverlay(page, 'Calendario de actividades', 'Caminatas guiadas · Talleres · Voluntariados');
  await page.locator('a[href="/eventos"]').first().click();
  await wait(1800);
  await injectProduction(page);
  await showScene(page, '07 — CALENDARIO');
  await showOverlay(page, 'Calendario de actividades', 'Caminatas guiadas · Talleres · Voluntariados');
  await moveCursor(page, 500, 420);
  await wait(1500);

  // ===== ESCENA 8: Apps Complementarias (54-57s) ========================
  await hideOverlay(page); await hideScene(page);
  await showScene(page, '08 — APPS COMPLEMENTARIAS');
  await showOverlay(page, 'Para tu visita', 'eBird · Merlin Bird ID · iNaturalist · Windy');
  await page.locator('a[href="/apps"]').first().click();
  await wait(1200);
  await injectProduction(page);
  await showScene(page, '08 — APPS COMPLEMENTARIAS');
  await showOverlay(page, 'Para tu visita', 'eBird · Merlin Bird ID · iNaturalist · Windy');
  await moveCursor(page, 450, 400);
  await wait(500);
  await moveCursor(page, 900, 400);
  await wait(800);

  // ===== ESCENA 9: Donar (57-62s) =======================================
  await hideOverlay(page); await hideScene(page);
  await showScene(page, '09 — APORTAR');
  await showOverlay(page, 'Cuida el santuario', 'Tu aporte mantiene circuitos y protege la biodiversidad');
  await page.goto(SITE + '/donar', { waitUntil: 'networkidle' });
  await wait(500);
  await injectProduction(page);
  await showScene(page, '09 — APORTAR');
  await showOverlay(page, 'Cuida el santuario', 'Tu aporte mantiene circuitos y protege la biodiversidad');
  await moveCursor(page, 1025, 328);
  await highlightAt(page, 1025, 328, 55);
  await wait(500);
  await moveCursor(page, 1025, 378);
  await wait(600);
  await moveCursor(page, 640, 600);
  await wait(1000);

  // ===== OUTRO (62-66s) =================================================
  await hideOverlay(page); await hideScene(page);
  await wait(300);

  // show outro card
  await page.evaluate(() => {
    const tc = document.getElementById('demo-title-card');
    if (!tc) return;
    tc.style.display = 'flex';
    tc.querySelector('.tc-logo').textContent = 'DESCÁRGALA GRATIS';
    tc.querySelector('.tc-title').innerHTML = '<span>angachilla.strategiccode.cl</span>';
    tc.querySelector('.tc-sub').textContent = 'Google Play · App Store · Web';
    tc.style.opacity = '1';
    tc.style.animation = 'scaleIn .8s cubic-bezier(.16,1,.3,1) forwards';
  });
  await wait(3500);

  // --- save video -------------------------------------------------------
  await page.close();
  const videoPath = await page.video().path();
  console.log('✅ Video DESKTOP:', path.resolve(videoPath));
  await ctx.close();
  await browser.close();
})();
