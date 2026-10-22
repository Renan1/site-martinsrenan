// Página do projeto Scanner: a lente revela a camada digital.
(function () {
  var stage = document.getElementById('stage'), dig = document.getElementById('digital'), lens = document.getElementById('lens'), btn = document.getElementById('all');
  var R = innerWidth < 760 ? 110 : 150, r = R, x = 0, y = 0, demo = true, full = false, t0 = performance.now();

  function set() {
    [dig, lens].forEach(function (n) {
      n.style.setProperty('--r', r + 'px');
      n.style.setProperty('--lx', x + 'px'); n.style.setProperty('--ly', y + 'px');
      n.style.setProperty('--lxp', x + 'px'); n.style.setProperty('--lyp', y + 'px');
    });
  }
  function move(e) {
    var b = stage.getBoundingClientRect();
    demo = false; x = e.clientX - b.left; y = e.clientY - b.top; set();
  }
  stage.addEventListener('pointermove', move);
  stage.addEventListener('pointerdown', move);

  // Demonstração: a lente passeia sozinha até o visitante mexer.
  (function loop(t) {
    if (demo && !full) {
      var b = stage.getBoundingClientRect(), s = (t - t0) / 1000;
      x = b.width * (0.55 + 0.25 * Math.sin(s * 0.7));
      y = Math.min(b.height, innerHeight) * (0.5 + 0.25 * Math.sin(s * 1.1));
      set();
    }
    requestAnimationFrame(loop);
  })(t0);

  function animateR(to, ms) {
    var from = r, start = performance.now();
    (function step(now) {
      var k = Math.min(1, (now - start) / ms), e = 1 - Math.pow(1 - k, 3);
      r = from + (to - from) * e; set();
      if (k < 1) requestAnimationFrame(step);
    })(start);
  }
  btn.addEventListener('click', function () {
    full = !full;
    stage.classList.toggle('full', full);
    var b = stage.getBoundingClientRect();
    animateR(full ? Math.hypot(b.width, b.height) : R, 1100);
    btn.textContent = full ? 'Voltar ao papel' : 'Escanear tudo';
  });
})();
