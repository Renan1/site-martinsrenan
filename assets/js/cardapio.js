// Página do Gerador de cardápio: desenha no canvas a imagem 1080×1920 do cardápio, como o app real.
// Regras do app: ignora maiúsculas/acentos, nome mais longo ganha, desconhecido = tigela genérica + aviso.
// Os ícones aqui são ilustrativos (prato com cor e textura do alimento), desenhados em código.
(function () {
  // [nome, cor, textura] por categoria. Texturas: solid, dots, stripes, slices.
  var CATALOG = {
    'Proteínas': [
      ['Frango assado', '#C9853A', 'solid'], ['Frango frito', '#D99A3E', 'dots'], ['Frango grelhado', '#B8762F', 'stripes'],
      ['Frango ao molho', '#C0602E', 'solid'], ['Filé de frango a pizzaiolo', '#C8432A', 'dots'], ['Isca de frango a milanesa', '#D9A24A', 'stripes'],
      ['Isca de fígado', '#6E2B22', 'stripes'], ['Bisteca', '#8A4B2A', 'solid'], ['Feijoada', '#3B2620', 'dots'],
      ['Frango', '#C9853A', 'solid'], ['Bife', '#7A3E26', 'solid'], ['Lombo', '#B06A45', 'solid'], ['Peixe frito', '#D8B26A', 'stripes']
    ],
    'Grãos, massas e feijões': [
      ['Arroz', '#F4F1E8', 'dots'], ['Arroz integral', '#C7A97C', 'dots'], ['Feijão', '#4A2C22', 'dots'], ['Massa', '#EBC45A', 'stripes'],
      ['Lasanha', '#D9813A', 'stripes'], ['Farofa de cebola', '#D8B47A', 'dots'], ['Bolinho de arroz', '#C98F45', 'solid']
    ],
    'Guarnições e vegetais': [
      ['Couve', '#3E7D3A', 'stripes'], ['Couve flor', '#EFE6CF', 'dots'], ['Batata gratinada', '#E9C46A', 'solid'], ['Purê de batata', '#F1DC9B', 'solid'],
      ['Legumes refogados', '#E07A3F', 'dots'], ['Abóbora', '#E58B2E', 'solid'], ['Chuchu', '#A9C46B', 'solid'], ['Cenoura', '#E8762B', 'stripes']
    ],
    'Saladas e frutas': [
      ['Alface', '#6DAA45', 'stripes'], ['Vinagrete', '#C8432A', 'dots'], ['Tomate', '#D9442E', 'solid'], ['Salada mista', '#7DB04D', 'dots'],
      ['Laranja', '#F28C28', 'slices'], ['Banana', '#F1D04B', 'stripes'], ['Melancia', '#E2455A', 'dots'], ['Mamão', '#F29A4A', 'dots']
    ]
  };
  var START = ['Arroz', 'Arroz integral', 'Massa', 'Feijão', 'Farofa de cebola', 'Couve', 'Batata gratinada', 'Feijoada',
    'Isca de fígado', 'Isca de frango a milanesa', 'Alface', 'Vinagrete', 'Laranja', 'Filé de frango a pizzaiolo'];
  var MAX_ITEMS = 22;

  var day = document.getElementById('day'), items = document.getElementById('items'), canvas = document.getElementById('story');
  var warns = document.getElementById('warns'), groups = document.getElementById('groups'), search = document.getElementById('search');
  var ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height;

  function norm(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim(); }
  var ALL = [];
  Object.keys(CATALOG).forEach(function (cat) { CATALOG[cat].forEach(function (d) { ALL.push({ name: d[0], color: d[1], tex: d[2], key: norm(d[0]) }); }); });
  // Nome mais longo primeiro: "bolinho de arroz" é testado antes de "arroz".
  var BY_LENGTH = ALL.slice().sort(function (a, b) { return b.key.length - a.key.length; });
  function match(text) { var k = norm(text); for (var i = 0; i < BY_LENGTH.length; i++) if (k.indexOf(BY_LENGTH[i].key) !== -1) return BY_LENGTH[i]; return null; }

  // Ícone: prato visto de cima, com a "comida" na cor e textura do alimento. null = tigela genérica.
  function icon(c, x, y, r, dish) {
    c.save();
    if (!dish) { // tigela genérica
      c.fillStyle = '#B7B2A6'; c.beginPath(); c.arc(x, y - r * 0.05, r * 0.95, 0, Math.PI); c.closePath(); c.fill();
      c.fillStyle = '#D9D4C7'; c.beginPath(); c.ellipse(x, y - r * 0.05, r * 0.95, r * 0.28, 0, 0, Math.PI * 2); c.fill();
      c.restore(); return;
    }
    c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = Math.max(1, r * 0.06); c.stroke();
    c.fillStyle = dish.color; c.beginPath(); c.arc(x, y, r * 0.68, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(x, y, r * 0.68, 0, Math.PI * 2); c.clip();
    var light = parseInt(dish.color.slice(1, 3), 16) > 200;
    c.fillStyle = c.strokeStyle = light ? 'rgba(0,0,0,.18)' : 'rgba(255,255,255,.35)';
    if (dish.tex === 'dots') { for (var i = 0; i < 9; i++) { var a = i * 2.4, d = r * 0.42 * ((i % 3) / 2.2 + 0.2); c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r * 0.08, 0, Math.PI * 2); c.fill(); } }
    if (dish.tex === 'stripes') { c.lineWidth = r * 0.1; for (var j = -2; j <= 2; j++) { c.beginPath(); c.moveTo(x - r, y + j * r * 0.28 - r * 0.2); c.lineTo(x + r, y + j * r * 0.28 + r * 0.2); c.stroke(); } }
    if (dish.tex === 'slices') { c.lineWidth = r * 0.06; for (var k = 0; k < 6; k++) { var b = k * Math.PI / 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(b) * r, y + Math.sin(b) * r); c.stroke(); } }
    c.restore();
  }

  function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

  function lines() { return items.value.split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean); }

  function draw() {
    var list = lines(), unknown = [], tooLong = [];
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#F3EEDF'; ctx.fillRect(0, 0, W, H);
    // Marca (wordmark simples, não é a logo oficial)
    ctx.fillStyle = '#2F6B3A'; ctx.beginPath(); ctx.arc(W / 2, 200, 96, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F3EEDF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '400 92px Kalam'; ctx.fillText('CF', W / 2, 208);
    ctx.fillStyle = '#2F6B3A'; ctx.font = '700 40px Sora'; ctx.fillText('COUVE FLOR', W / 2, 345);
    ctx.font = '400 30px "Red Hat Mono"'; ctx.fillStyle = '#5F6A5B'; ctx.fillText('restaurante', W / 2, 392);
    // Título
    ctx.fillStyle = '#1F2A1E'; ctx.font = '800 62px Sora'; ctx.fillText('Cardápio do Dia', W / 2, 500);
    ctx.fillStyle = '#2F6B3A'; ctx.font = '400 64px Kalam'; ctx.fillText(day.value, W / 2, 578);
    // Cartão com os itens
    var cx = 80, cy = 650, cw = W - 160, ch = 1150;
    ctx.fillStyle = '#FFFFFF'; roundRect(ctx, cx, cy, cw, ch, 44); ctx.fill();
    var n = Math.max(list.length, 1), row = Math.min(78, (ch - 80) / n), r = row * 0.36, fs = Math.round(Math.min(44, row * 0.56));
    ctx.textAlign = 'left'; ctx.font = '600 ' + fs + 'px Sora';
    var textX = cx + 60 + r * 2 + 26, maxW = cx + cw - 40 - textX;
    list.forEach(function (t, i) {
      var y = cy + 40 + row * i + row / 2, dish = match(t);
      if (!dish) unknown.push(t);
      if (ctx.measureText(t).width > maxW) tooLong.push(t);
      icon(ctx, cx + 60 + r, y, r, dish);
      ctx.fillStyle = '#1F2A1E'; ctx.fillText(t, textX, y + 2);
    });
    if (!list.length) { ctx.textAlign = 'center'; ctx.fillStyle = '#9AA894'; ctx.font = '400 40px Sora'; ctx.fillText('(sem itens)', W / 2, cy + ch / 2); }
    ctx.textAlign = 'center'; ctx.fillStyle = '#5F6A5B'; ctx.font = '400 28px "Red Hat Mono"';
    ctx.fillText('gerado no celular · Couve Flor Refeições', W / 2, 1862);

    warns.replaceChildren();
    function warn(text) { var li = document.createElement('li'); li.textContent = text; warns.appendChild(li); }
    if (unknown.length) warn('Sem ícone específico (usei um genérico): ' + unknown.join(', '));
    if (tooLong.length) warn('Nome longo pode passar da borda: ' + tooLong.join(', '));
    if (list.length > MAX_ITEMS) warn('Mais de ' + MAX_ITEMS + ' itens: o texto fica apertado.');
    var ph = canvas.parentNode; ph.classList.remove('flash'); void ph.offsetWidth; ph.classList.add('flash');
    markChips();
  }

  // Galeria: chips por categoria, com busca. Prato já na lista não entra de novo.
  var chips = [];
  Object.keys(CATALOG).forEach(function (cat) {
    var g = document.createElement('div'); g.className = 'group';
    var h = document.createElement('h3'); h.textContent = cat; g.appendChild(h);
    var box = document.createElement('div'); box.className = 'chips';
    CATALOG[cat].forEach(function (d) {
      var dish = ALL.filter(function (x) { return x.name === d[0]; })[0];
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip';
      var mini = document.createElement('canvas'); mini.width = mini.height = 44; icon(mini.getContext('2d'), 22, 22, 20, dish);
      b.appendChild(mini); b.appendChild(document.createTextNode(d[0]));
      b.addEventListener('click', function () {
        if (inList(dish)) return;
        items.value = (items.value.replace(/\s+$/, '') + '\n' + d[0]).replace(/^\n/, '');
        markChips();
      });
      chips.push({ el: b, dish: dish, group: g });
      box.appendChild(b);
    });
    g.appendChild(box); groups.appendChild(g);
  });
  document.getElementById('count').textContent = String(ALL.length);
  function inList(dish) { return lines().some(function (t) { return norm(t) === dish.key; }); }
  function markChips() { chips.forEach(function (c) { c.el.classList.toggle('in', inList(c.dish)); }); }
  search.addEventListener('input', function () {
    var q = norm(search.value);
    chips.forEach(function (c) { c.el.hidden = q && c.dish.key.indexOf(q) === -1; });
    document.querySelectorAll('.group').forEach(function (g) { g.hidden = !g.querySelector('.chip:not([hidden])'); });
  });
  items.addEventListener('input', markChips);

  document.getElementById('clear').addEventListener('click', function () { items.value = ''; items.focus(); markChips(); });
  document.getElementById('gen').addEventListener('click', function () {
    draw();
    if (innerWidth < 900) canvas.parentNode.scrollIntoView({ behavior: 'smooth', block: 'start' }); // no celular, mostra o resultado
  });
  document.getElementById('save').addEventListener('click', function () {
    canvas.toBlob(function (blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'cardapio-' + norm(day.value).replace(/[^a-z]+/g, '-') + '.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    }, 'image/png');
  });

  items.value = START.join('\n');
  // Espera as fontes locais para o primeiro desenho sair com a tipografia certa.
  Promise.all(['800 62px Sora', '600 40px Sora', '400 64px Kalam', '400 28px "Red Hat Mono"'].map(function (f) { return document.fonts.load(f); }))
    .then(draw, draw);
})();
