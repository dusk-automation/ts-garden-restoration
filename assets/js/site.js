/* T&S Garden Restoration: design preview by Dusk. No forms, nothing is sent anywhere. */
(function () {
  'use strict';
  window.__ts = true;
  var doc = document.documentElement;
  var motion = doc.classList.contains('motion');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ---------- header and mobile menu ---------- */
  var hdr = $('#hdr');
  var menuBtn = $('.menu-btn');
  var mnav = $('#mnav');
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    mnav.hidden = !open;
    menuBtn.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
    if (open) hdr.classList.add('is-solid');
  }
  menuBtn.addEventListener('click', function () { setMenu(mnav.hidden); });
  mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !mnav.hidden) { setMenu(false); menuBtn.focus(); }
  });

  /* ---------- background films (hero and dusk) ---------- */
  function sizeKey() {
    var w = window.innerWidth, h = window.innerHeight;
    var saver = navigator.connection && navigator.connection.saveData;
    if (w < 700 && h > w) return 'sm';
    if (w < 1000 || saver) return 'md';
    return 'lg';
  }
  function Film(video, holder, opts) {
    this.v = video; this.holder = holder; this.visible = false;
    this.userPaused = !motion; this.loaded = false; this.opts = opts || {};
    var self = this;
    video.addEventListener('playing', function () { video.classList.add('is-on'); });
    video.addEventListener('loadeddata', function () { if (!self.userPaused) video.classList.add('is-on'); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        self.visible = es[0].isIntersecting;
        if (self.visible && !self.loaded && !self.userPaused) self.load();
        self.sync();
      }, { rootMargin: this.opts.margin || '0px', threshold: 0.01 }).observe(holder);
    } else { this.visible = true; }
  }
  Film.prototype.pick = function () {
    var k = sizeKey(), v = this.v;
    var src = v.getAttribute('data-src-' + k) || v.getAttribute('data-src-md') || v.getAttribute('data-src-lg') || v.getAttribute('data-src-sm');
    if (k === 'sm' && v.getAttribute('data-poster-sm')) v.poster = v.getAttribute('data-poster-sm');
    return src;
  };
  Film.prototype.load = function () {
    var want = this.pick();
    if (!want) return;
    this.loaded = true;
    var cur = this.v.getAttribute('src') || (this.v.querySelector('source') && this.v.querySelector('source').getAttribute('src'));
    if (cur !== want) {
      var s = this.v.querySelector('source');
      if (s) s.parentNode.removeChild(s);
      this.v.src = want;
      this.v.load();
    }
  };
  Film.prototype.sync = function () {
    var play = !this.userPaused && this.visible && !document.hidden;
    if (play) {
      if (!this.loaded) this.load();
      var p = this.v.play();
      if (p && p.catch) p.catch(function () { /* autoplay refused: the still frame stays */ });
    } else if (!this.v.paused) {
      this.v.pause();
    }
  };

  var hero = $('.hero');
  var heroFilm = new Film($('.hero-video'), hero);
  heroFilm.load();
  var vidBtn = $('.vid-btn');
  function syncBtn() {
    vidBtn.classList.toggle('is-paused', heroFilm.userPaused);
    vidBtn.setAttribute('aria-label', heroFilm.userPaused ? 'Play the background films' : 'Pause the background films');
  }
  var duskHolder = $('[data-dusk]');
  var duskFilm = duskHolder ? new Film($('video', duskHolder), duskHolder, { margin: '300px 0px' }) : null;
  vidBtn.addEventListener('click', function () {
    var paused = !heroFilm.userPaused;
    [heroFilm, duskFilm].forEach(function (f) {
      if (!f) return;
      f.userPaused = paused;
      if (!paused && f.visible && !f.loaded) f.load();
      f.sync();
    });
    syncBtn();
  });
  document.addEventListener('visibilitychange', function () { heroFilm.sync(); if (duskFilm) duskFilm.sync(); });
  heroFilm.sync(); syncBtn();

  /* ---------- hero entrance: lines rise once the fonts are in ---------- */
  if (motion) {
    var went = false;
    var go = function () { if (went) return; went = true; doc.classList.add('hero-go'); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(go, 80); });
    setTimeout(go, 1200);

    // light motes drifting in the low sun, mostly on the sunny right side
    var motes = $('[data-motes]');
    if (motes) {
      var n = window.innerWidth < 700 ? 9 : 18;
      for (var m = 0; m < n; m++) {
        var sp = document.createElement('span');
        sp.className = 'mote';
        var x = 35 + Math.random() * 62, y = 15 + Math.random() * 70, s = 3 + Math.random() * 7;
        sp.style.cssText = '--x:' + x.toFixed(1) + '%;--y:' + y.toFixed(1) + '%;--s:' + s.toFixed(1) + 'px;--b:' + (s > 7 ? 1.5 : 0.4) + 'px;--o:' + (0.35 + Math.random() * 0.5).toFixed(2) +
          ';--d:' + (9 + Math.random() * 10).toFixed(1) + 's;--dl:-' + (Math.random() * 12).toFixed(1) + 's;--dx:' + (-30 + Math.random() * 60).toFixed(0) + 'px';
        motes.appendChild(sp);
      }
    }
  } else {
    doc.classList.add('hero-go');
  }

  /* ---------- headings: wrap each word so it can rise ---------- */
  var wordIndex = 0;
  function wrapWords(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
      if (ch.nodeType === 3) {
        var parts = ch.textContent.split(/(\s+)/);
        var frag = document.createDocumentFragment();
        parts.forEach(function (p) {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
          var w = document.createElement('span'); w.className = 'w';
          var wi = document.createElement('span'); wi.className = 'wi'; wi.textContent = p;
          wi.style.setProperty('--i', String(wordIndex++));
          w.appendChild(wi); frag.appendChild(w);
        });
        node.replaceChild(frag, ch);
      } else if (ch.nodeType === 1) {
        wrapWords(ch);
      }
    });
  }
  $$('.split').forEach(function (h) { wordIndex = 0; wrapWords(h); });

  // the big review quote: each word lights up as the section scrolls past
  var wordsBox = $('[data-words] p');
  var lightWords = [];
  if (wordsBox && motion) {
    var txt = wordsBox.textContent;
    wordsBox.textContent = '';
    txt.split(/(\s+)/).forEach(function (p) {
      if (!p) return;
      if (/^\s+$/.test(p)) { wordsBox.appendChild(document.createTextNode(p)); return; }
      var sp = document.createElement('span'); sp.className = 'wd'; sp.textContent = p;
      wordsBox.appendChild(sp); lightWords.push(sp);
    });
  }

  /* ---------- before and after ---------- */
  function Compare(fig) {
    this.fig = fig;
    this.range = $('.ba-range', fig);
    this.dragging = false;
    this.touched = false;
    // without scroll motion the story pair starts half-way, so both photos show
    this.set(motion ? (parseFloat(fig.getAttribute('data-start')) || 50) : 50);
    var self = this;
    fig.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      self.dragging = true; self.touched = true;
      self.startX = e.clientX; self.startY = e.clientY; self.locked = e.pointerType === 'mouse';
      if (self.locked) { fig.setPointerCapture(e.pointerId); self.fromPointer(e); }
    });
    fig.addEventListener('pointermove', function (e) {
      if (!self.dragging) return;
      if (!self.locked) {
        // on touch, only take over once the finger is clearly moving sideways, so the page still scrolls
        var dx = Math.abs(e.clientX - self.startX), dy = Math.abs(e.clientY - self.startY);
        if (dx < 6 && dy < 6) return;
        if (dy > dx) { self.dragging = false; return; }
        self.locked = true; try { fig.setPointerCapture(e.pointerId); } catch (err) {}
      }
      self.fromPointer(e);
    });
    var end = function () { self.dragging = false; };
    fig.addEventListener('pointerup', end);
    fig.addEventListener('pointercancel', end);
    fig.addEventListener('click', function (e) { if (!self.locked) { self.touched = true; self.fromPointer(e); } });
    this.range.addEventListener('input', function () { self.touched = true; self.set(parseFloat(self.range.value)); });
  }
  Compare.prototype.fromPointer = function (e) {
    var r = this.fig.getBoundingClientRect();
    this.set(clamp((e.clientX - r.left) / r.width * 100, 0, 100));
  };
  Compare.prototype.set = function (v) {
    this.value = v;
    this.fig.style.setProperty('--p', v.toFixed(2) + '%');
    this.range.value = String(Math.round(v));
  };
  var compares = $$('[data-ba]').map(function (f) { return new Compare(f); });

  // the second pair sweeps once when it comes into view, to show it can be dragged
  if (motion && 'IntersectionObserver' in window) {
    $$('[data-sweep]').forEach(function (fig) {
      var cmp = compares.filter(function (c) { return c.fig === fig; })[0];
      var io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        var t0 = null, dur = 2200;
        var tick = function (ts) {
          if (cmp.touched) return;
          if (t0 === null) t0 = ts;
          var k = clamp((ts - t0) / dur, 0, 1);
          var v = 50 + Math.sin(k * Math.PI * 2) * 32 * (1 - k * 0.15);
          cmp.set(k >= 1 ? 50 : v);
          if (k < 1) requestAnimationFrame(tick);
        };
        setTimeout(function () { requestAnimationFrame(tick); }, 350);
      }, { threshold: 0.6 });
      io.observe(fig);
    });
  }

  /* ---------- restoration film: frames drawn on a canvas, picked by scroll ---------- */
  var restore = $('[data-restore]');
  var R = null;
  if (restore && motion) {
    R = {
      sec: restore.closest('.restore'),
      canvas: $('.restore-canvas', restore),
      bar: $('.restore-bar', restore),
      steps: $$('.restore-steps li', restore),
      n: parseInt(restore.getAttribute('data-frames'), 10) || 96,
      frames: [], set: null, want: 0, drawn: -1, started: false
    };
    R.ctx = R.canvas.getContext('2d');
    R.pickSet = function () { return (window.innerWidth < 700 && window.innerHeight > window.innerWidth) ? 't' : 'w'; };
    R.url = function (i) { return 'assets/restore/' + R.set + '/' + String(i + 1).padStart(3, '0') + '.webp'; };
    R.size = function () {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      var w = R.canvas.clientWidth, h = R.canvas.clientHeight;
      if (R.canvas.width !== Math.round(w * dpr) || R.canvas.height !== Math.round(h * dpr)) {
        R.canvas.width = Math.round(w * dpr); R.canvas.height = Math.round(h * dpr); R.drawn = -1;
      }
    };
    R.nearest = function (i) {
      for (var d = 0; d < R.n; d++) {
        if (R.frames[i - d] && R.frames[i - d].ok) return i - d;
        if (R.frames[i + d] && R.frames[i + d].ok) return i + d;
      }
      return -1;
    };
    R.draw = function () {
      var i = R.nearest(R.want);
      if (i < 0 || i === R.drawn) return;
      R.size();
      var img = R.frames[i].img, cw = R.canvas.width, ch = R.canvas.height;
      var s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      var w = img.naturalWidth * s, h = img.naturalHeight * s;
      // keep the garden bed in view on narrow screens: favour the right-hand side of the frame
      var x = (cw - w) * (R.set === 'w' ? 0.62 : 0.5), y = (ch - h) / 2;
      R.ctx.drawImage(img, x, y, w, h);
      R.drawn = i;
      if (!R.sec.classList.contains('has-frames')) R.sec.classList.add('has-frames');
    };
    R.start = function () {
      if (R.started) return;
      R.started = true;
      R.set = R.pickSet();
      // load a spread of frames first, then fill the gaps, six at a time
      var order = [], seen = {}, steps = [16, 8, 4, 2, 1];
      order.push(0, R.n - 1); seen[0] = seen[R.n - 1] = true;
      steps.forEach(function (st) { for (var i = 0; i < R.n; i += st) { if (!seen[i]) { seen[i] = true; order.push(i); } } });
      var next = 0, active = 0;
      var pump = function () {
        while (active < 6 && next < order.length) {
          (function (i) {
            active++;
            var img = new Image();
            img.decoding = 'async';
            R.frames[i] = { img: img, ok: false };
            img.onload = function () { R.frames[i].ok = true; active--; R.drawn = -1; R.draw(); pump(); };
            img.onerror = function () { active--; pump(); };
            img.src = R.url(i);
          })(order[next++]);
        }
      };
      pump();
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { if (es[0].isIntersecting) R.start(); }, { rootMargin: '25% 0px' }).observe(restore);
    } else { R.start(); }
  }

  /* ---------- the ribbon of services: drifts, and speeds up with the scroll ---------- */
  var ribbon = $('[data-ribbon]');
  if (ribbon) {
    var base = ribbon.innerHTML;
    // repeat the run until it is at least twice the screen width, so the loop never shows a gap
    var guard = 0;
    while (ribbon.scrollWidth < window.innerWidth * 2.2 && guard++ < 8) ribbon.insertAdjacentHTML('beforeend', base);
    ribbon.insertAdjacentHTML('beforeend', ribbon.innerHTML);
  }
  var ribbonX = 0, ribbonDir = 1, ribbonBoost = 0, ribbonOn = false, ribbonLast = 0;
  function ribbonTick(ts) {
    if (!ribbonOn) return;
    var dt = ribbonLast ? Math.min(ts - ribbonLast, 50) : 16;
    ribbonLast = ts;
    ribbonBoost *= 0.92;
    ribbonX -= (0.035 + ribbonBoost) * dt * ribbonDir;
    var half = ribbon.scrollWidth / 2;
    if (ribbonX <= -half) ribbonX += half;
    if (ribbonX > 0) ribbonX -= half;
    ribbon.style.transform = 'translate3d(' + ribbonX.toFixed(2) + 'px,0,0)';
    requestAnimationFrame(ribbonTick);
  }
  if (ribbon && motion && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      var on = es[0].isIntersecting;
      if (on && !ribbonOn) { ribbonOn = true; ribbonLast = 0; requestAnimationFrame(ribbonTick); }
      ribbonOn = on;
    }).observe(ribbon.parentNode);
  }

  /* ---------- services: the photo follows the pointer ---------- */
  var float = $('.svc-float');
  if (float && finePointer && motion) {
    var fImg = $('img', float), fx = 0, fy = 0, tx = 0, ty = 0, fOn = false, fRun = false;
    var fTick = function () {
      fx += (tx - fx) * 0.16; fy += (ty - fy) * 0.16;
      float.style.transform = 'translate3d(' + (fx + 26).toFixed(1) + 'px,' + (fy - 214).toFixed(1) + 'px,0)';
      if (fOn || Math.abs(tx - fx) > 0.5) requestAnimationFrame(fTick); else fRun = false;
    };
    $$('.svc[data-img]').forEach(function (li) {
      li.addEventListener('mouseenter', function (e) {
        var src = li.getAttribute('data-img');
        if (fImg.getAttribute('src') !== src) fImg.setAttribute('src', src);
        tx = e.clientX; ty = e.clientY;
        if (!fOn) { fx = tx; fy = ty; }
        fOn = true; float.classList.add('is-on');
        if (!fRun) { fRun = true; requestAnimationFrame(fTick); }
      });
      li.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; });
      li.addEventListener('mouseleave', function () { fOn = false; float.classList.remove('is-on'); });
    });
    window.addEventListener('scroll', function () { if (fOn) { fOn = false; float.classList.remove('is-on'); } }, { passive: true });
  }

  /* ---------- buttons lean toward the pointer ---------- */
  if (finePointer && motion) {
    $$('.mag').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width, dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        b.style.transform = 'translate3d(' + (dx * 10).toFixed(1) + 'px,' + (dy * 8).toFixed(1) + 'px,0)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* ---------- everything tied to the scroll position ---------- */
  var story = $('[data-story]');
  var storyCmp = story ? compares.filter(function (c) { return story.contains(c.fig); })[0] : null;
  var storyBar = $('.story-bar');
  var heroMedia = $('[data-hero="media"]');
  var heroText = $('[data-hero="text"]');
  var heroGrass = $('[data-hero="grass"]');
  var parEls = $$('[data-par]');
  var badgeRing = $('.badge-ring');
  var reviews = $('.reviews');
  var duskFilmBox = $('.ftr-film');
  var callbar = $('[data-callbar]');
  var lastStoryP = -1, lastY = window.scrollY || 0;
  var queued = false;

  function update() {
    queued = false;
    var y = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight;
    var heroH = hero.offsetHeight;
    var dy = y - lastY; lastY = y;

    hdr.classList.toggle('is-solid', y > heroH - 90 || !mnav.hidden);
    var maxY = document.documentElement.scrollHeight - vh;
    hdr.style.setProperty('--prog', maxY > 0 ? (y / maxY).toFixed(4) : '0');
    if (callbar) callbar.classList.toggle('is-on', y > heroH * 0.6);

    // fallbacks for when the browser is not reporting what is on screen (background tabs, hidden panes)
    [heroFilm, duskFilm].forEach(function (f) {
      if (!f) return;
      var fr = f.holder.getBoundingClientRect();
      var vis = fr.bottom > -300 && fr.top < vh + 300;
      if (vis !== f.visible) { f.visible = vis; if (vis && !f.loaded && !f.userPaused) f.load(); f.sync(); }
    });
    if (R && !R.started && restore.getBoundingClientRect().top < vh * 1.25) R.start();

    if (!motion) return;

    // ribbon reacts to how fast and which way the page is moving
    if (dy !== 0) { ribbonDir = dy > 0 ? 1 : -1; ribbonBoost = Math.min(ribbonBoost + Math.abs(dy) * 0.004, 0.9); }

    if (y < heroH + 40) {
      // far: the film drifts down (moves up slower than the page); middle: the words lift and fade; near: the grass stays fixed to the bottom edge, so it never leaves a gap
      heroMedia.style.transform = 'translate3d(0,' + (y * 0.4).toFixed(1) + 'px,0)';
      heroText.style.transform = 'translate3d(0,' + (y * 0.16).toFixed(1) + 'px,0)';
      heroText.style.opacity = clamp(1 - y / (heroH * 0.7), 0, 1).toFixed(3);
    }

    if (R) {
      var rr = restore.getBoundingClientRect();
      var travel = rr.height - vh;
      if (rr.top < vh && rr.bottom > 0) {
        var p = clamp(-rr.top / travel, 0, 1);
        // hold on the overgrown garden for a moment, play the clearing, then hold on the result
        var k = clamp((p - 0.08) / 0.78, 0, 1);
        R.want = Math.round(k * (R.n - 1));
        R.draw();
        R.bar.style.setProperty('--rp', p.toFixed(3));
        var step = k < 0.28 ? 0 : k < 0.72 ? 1 : 2;
        R.steps.forEach(function (li, i) { li.classList.toggle('is-on', i === step); });
      }
    }

    if (story && storyCmp) {
      var r = story.getBoundingClientRect();
      var trav = r.height - (vh - (hdr.offsetHeight + 8));
      var sp = clamp((-r.top + 30) / (trav * 0.9), 0, 1);
      if (Math.abs(sp - lastStoryP) > 0.0005) {
        lastStoryP = sp;
        var e = sp < 0.5 ? 2 * sp * sp : 1 - Math.pow(-2 * sp + 2, 2) / 2;
        if (r.top < vh && r.bottom > 0 && !storyCmp.dragging) storyCmp.set(100 - e * 100);
        if (storyBar) storyBar.style.setProperty('--sp', sp.toFixed(3));
        storyCmp.fig.style.setProperty('--z', (1.06 - e * 0.06).toFixed(4));
      }
    }

    for (var i = 0; i < parEls.length; i++) {
      var el = parEls[i], img = el.firstElementChild;
      var pr = el.getBoundingClientRect();
      if (pr.bottom < -100 || pr.top > vh + 100) continue;
      var kk = clamp((pr.top + pr.height / 2 - vh / 2) / vh, -1, 1);
      img.style.transform = 'translate3d(0,' + (kk * 9).toFixed(2) + '%,0)';
    }

    if (badgeRing) badgeRing.style.transform = 'rotate(' + (y * 0.12).toFixed(1) + 'deg)';

    if (lightWords.length && reviews) {
      var qr = wordsBox.getBoundingClientRect();
      if (qr.top < vh && qr.bottom > 0) {
        // the first word lights as the quote enters, the last as it reaches the upper third of the screen
        var lp = clamp((vh * 0.92 - qr.top) / (vh * 0.6), 0, 1);
        var lit = Math.round(lp * lightWords.length);
        for (var w = 0; w < lightWords.length; w++) lightWords[w].classList.toggle('on', w < lit);
      }
    }

    if (duskFilmBox) {
      var fr = duskFilmBox.parentNode.getBoundingClientRect();
      if (fr.top < vh && fr.bottom > 0) {
        var fk = (fr.top + fr.height / 2 - vh / 2) / vh;
        duskFilmBox.style.transform = 'translate3d(0,' + (fk * 60).toFixed(1) + 'px,0)';
      }
    }
  }
  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
    // backup for panes and tabs where animation frames are paused
    setTimeout(function () { if (queued) update(); }, 140);
  }
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', function () {
    if (R && R.started && R.pickSet() !== R.set) { R.started = false; R.frames = []; R.drawn = -1; R.start(); }
    if (R) R.drawn = -1;
    queue();
  });
  window.addEventListener('load', queue);
  update();

  /* ---------- reveals ---------- */
  if (motion) {
    var rvs = $$('.rv, .split, .rv-clip, [data-map]');
    if ('IntersectionObserver' in window) {
      var rio = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); rio.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      rvs.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in'); else rio.observe(el);
      });
      // if the observer never fires (hidden pane), show whatever has been scrolled to
      window.addEventListener('scroll', function () {
        var vh = window.innerHeight;
        rvs.forEach(function (el) { if (!el.classList.contains('in') && el.getBoundingClientRect().top < vh * 0.92) el.classList.add('in'); });
      }, { passive: true });
    } else {
      rvs.forEach(function (el) { el.classList.add('in'); });
    }
    doc.classList.add('ready');
  }

  /* ---------- hours: today and open now, in Alstonville's time ---------- */
  (function () {
    var badge = $('[data-open]');
    var parts;
    try {
      parts = new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Sydney', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    } catch (e) { return; }
    var get = function (t) { var p = parts.filter(function (x) { return x.type === t; })[0]; return p ? p.value : ''; };
    var dayIdx = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday').slice(0, 3));
    if (dayIdx < 0) return;
    var mins = parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10);
    var row = $('.hours tr[data-day="' + dayIdx + '"]');
    if (row) row.classList.add('is-today');
    var weekday = dayIdx >= 1 && dayIdx <= 5;
    var open = weekday && mins >= 540 && mins < 960;
    var msg;
    if (open) msg = 'Open now, until 4 pm';
    else if (weekday && mins < 540) msg = 'Closed now, opens 9 am today';
    else if (dayIdx >= 1 && dayIdx <= 4) msg = 'Closed now, opens 9 am tomorrow';
    else msg = 'Closed now, opens Monday 9 am';
    badge.textContent = msg;
    badge.classList.toggle('is-open', open);
    badge.hidden = false;
  })();
})();
