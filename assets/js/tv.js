// Página do projeto TV corporativa: player igual ao da TV real + pasta conteudo/ editável.
// O número do arquivo é a ordem; desmarcar = tirar da pasta; vídeo com codec errado mostra aviso e é pulado.
(function () {
  var IMG = '../../assets/img/tv/';
  var files = [
    { id: 'a', src: 'slide-01.jpg', title: 'Boas-vindas' },
    { id: 'b', src: 'slide-02.jpg', title: 'Horários' },
    { id: 'c', src: 'slide-04.jpg', title: 'Dica de nutrição' },
    { id: 'd', src: 'slide-05.jpg', title: 'Evite o desperdício' },
    { id: 'e', src: 'slide-07.jpg', title: 'Pesquisa de satisfação' },
    { id: 'f', src: 'slide-12.jpg', title: 'Outubro Rosa' },
    { id: 'g', src: 'slide-13.jpg', title: 'Outubro Rosa (2)' },
    { id: 'h', src: 'slide-14.jpg', title: 'Festinha adiada' }
  ].map(function (f) { f.on = true; f.kind = 'image'; return f; });
  var BAD = { id: 'x', kind: 'video', bad: true, title: 'vídeo exportado em HEVC (codec errado)', on: true };

  var screen = document.getElementById('screen'), list = document.getElementById('files'), add = document.getElementById('add');
  var diag = document.getElementById('diag'), empty = document.getElementById('empty'), now = document.getElementById('now');
  var pi = document.querySelector('.pi'), fast = document.getElementById('fast');
  var current = null, timer = null, diagTimer = null, left = 0;

  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function pad(n) { return String(n).padStart(2, '0'); }
  function playlist() { return files.filter(function (f) { return f.on; }); }
  function fileName(f) { var i = playlist().indexOf(f); return i < 0 ? '—' : pad(i + 1) + (f.kind === 'video' ? '.mov' : '.png'); }
  function duration() { return fast.checked ? 5 : 30; }

  // Uma <img> por slide, como na TV: todas empilhadas, só a ativa aparece (transição de 1,2 s).
  files.forEach(function (f) {
    var img = el('img', 'slide'); img.src = IMG + f.src; img.alt = f.title; img.decoding = 'async';
    screen.insertBefore(img, screen.firstChild); f.el = img;
  });

  function flashError(msg) {
    diag.textContent = msg; diag.hidden = false;
    clearTimeout(diagTimer); diagTimer = setTimeout(function () { diag.hidden = true; }, fast.checked ? 4000 : 8000);
  }

  function show(f) {
    files.forEach(function (x) { if (x.el) x.el.classList.toggle('active', x === f); });
    current = f;
    clearInterval(timer);
    if (!f) { empty.hidden = false; pi.classList.remove('busy'); now.textContent = 'Pasta vazia'; return; }
    empty.hidden = true; pi.classList.add('busy');
    if (f.bad) { // igual à TV real: erro de decodificação → aviso vermelho e segue para o próximo
      flashError('Erro no vídeo conteudo/' + fileName(f) + ' (código 4 - provavelmente codec incompatível, exporte em H.264)');
      setTimeout(next, 600);
      return;
    }
    left = duration();
    label();
    timer = setInterval(function () { left--; if (left <= 0) next(); else label(); }, 1000);
  }
  function label() { if (current) now.textContent = 'Passando: ' + fileName(current) + ' · ' + current.title + ' · próximo em ' + left + ' s'; }

  function next() {
    var p = playlist();
    if (!p.length) return show(null);
    var i = p.indexOf(current);
    show(p[(i + 1) % p.length]);
  }

  function render() {
    list.replaceChildren();
    files.forEach(function (f, i) {
      var li = el('li', (f.on ? 'on' : '') + (f.bad ? ' bad' : ''));
      var cb = el('input'); cb.type = 'checkbox'; cb.checked = f.on; cb.setAttribute('aria-label', 'Manter ' + f.title + ' na pasta');
      cb.addEventListener('change', function () {
        f.on = cb.checked;
        render();
        if (!playlist().length) show(null);
        else if (!current || !current.on) next();
        else label();
      });
      li.appendChild(cb);
      var th;
      if (f.kind === 'video') th = el('span', 'thumb video', 'MOV');
      else { th = el('img', 'thumb'); th.src = IMG + f.src; th.alt = ''; }
      li.appendChild(th);
      var nm = el('span', 'name', fileName(f)); nm.appendChild(el('small', '', f.title)); li.appendChild(nm);
      var mv = el('span', 'mv');
      [['↑', -1], ['↓', 1]].forEach(function (d) {
        var b = el('button', '', d[0]); b.type = 'button'; b.setAttribute('aria-label', (d[1] < 0 ? 'Subir ' : 'Descer ') + f.title);
        b.disabled = i + d[1] < 0 || i + d[1] >= files.length;
        b.addEventListener('click', function () { var j = i + d[1]; files[i] = files[j]; files[j] = f; render(); label(); });
        mv.appendChild(b);
      });
      li.appendChild(mv);
      list.appendChild(li);
    });
    add.replaceChildren();
    if (files.indexOf(BAD) < 0) {
      var b = el('button', '', '+ vídeo .mov (codec errado)'); b.type = 'button';
      b.addEventListener('click', function () {
        var i = current ? files.indexOf(current) + 1 : 0;
        BAD.on = true; files.splice(i, 0, BAD); render();   // entra logo depois do slide atual, para o aviso aparecer já
      });
      add.appendChild(b);
    } else add.appendChild(el('span', 'none', 'Nada a adicionar. Desmarque o vídeo para tirá-lo.'));
  }

  document.getElementById('next').addEventListener('click', next);
  fast.addEventListener('change', function () { if (current && !current.bad) { left = Math.min(left, duration()); label(); } });

  // Relógio da TV (como no app: só horas e minutos)
  function tick() { var d = new Date(); document.getElementById('clock').textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  tick(); setInterval(tick, 30000);

  render();
  show(playlist()[0]);
})();
