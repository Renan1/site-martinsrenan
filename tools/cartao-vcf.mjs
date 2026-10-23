// Gera os arquivos .vcf ("Salvar contato") dos cartões digitais em cartao/<pessoa>/.
// Rodar depois de mudar um contato ou uma foto: node tools/cartao-vcf.mjs
// vCard 3.0 com quebra CRLF e linhas dobradas em 75 caracteres (o iPhone e o Android leem assim).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const foto = nome => readFileSync(`${root}assets/img/cartao/${nome}.jpg`).toString('base64');
const esc = s => s.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;');

const couveflor = [
  'ORG:Couve Flor Ltda',
  'URL:https://www.couveflorrefeicoes.com.br/',
  'EMAIL;TYPE=INTERNET,WORK:diretoria@couveflorrefeicoes.com.br',
  'X-SOCIALPROFILE;TYPE=instagram:https://instagram.com/couveflorrefeicoes',
];

const cartoes = [
  { arquivo: 'renan/renan-martins.vcf', n: 'Martins;Renan;;;', fn: 'Renan Martins', foto: 'renan', linhas: [
    'TEL;TYPE=CELL,VOICE:+5532988134420',
    'EMAIL;TYPE=INTERNET,PREF:contato@martinsrenan.com.br',
    'EMAIL;TYPE=INTERNET:renanasmartins@outlook.com',
    'URL:https://martinsrenan.com.br/',
    'URL:https://www.linkedin.com/in/renan-martins-77465841/',
    'X-SOCIALPROFILE;TYPE=instagram:https://instagram.com/martinsrenan',
    'X-SOCIALPROFILE;TYPE=linkedin:https://www.linkedin.com/in/renan-martins-77465841/',
    `NOTE:${esc('TI, infraestrutura, segurança e IA. Portfólio: martinsrenan.com.br')}`,
  ] },
  { arquivo: 'renan/renan-martins-couveflor.vcf', n: 'Martins;Renan;;;', fn: 'Renan Martins', foto: 'renan', linhas: [
    `TITLE:${esc('Sócio Proprietário')}`,
    'TEL;TYPE=CELL,VOICE:+5532988134420',
    'TEL;TYPE=WORK,VOICE:+5532991333703',
    'TEL;TYPE=WORK,VOICE:+5532991734073',
    ...couveflor,
  ] },
  { arquivo: 'camilla/camilla-simas.vcf', n: 'Simas;Camilla;;;', fn: 'Camilla Simas', foto: 'camilla', linhas: [
    'TEL;TYPE=CELL,VOICE:+5532991333703',
    'EMAIL;TYPE=INTERNET,HOME:millasimas@gmail.com',
    'X-SOCIALPROFILE;TYPE=instagram:https://instagram.com/camillasimas',
  ] },
  { arquivo: 'camilla/camilla-simas-couveflor.vcf', n: 'Simas;Camilla;;;', fn: 'Camilla Simas', foto: 'camilla', linhas: [
    `TITLE:${esc('Sócia Proprietária')}`,
    'TEL;TYPE=WORK,VOICE:+5532991333703',
    'TEL;TYPE=WORK,VOICE:+5532991734073',
    ...couveflor,
  ] },
];

// Dobra a linha em pedaços de até 75 bytes; a continuação começa com um espaço.
function dobrar(linha) {
  const partes = [];
  let atual = '', bytes = 0;
  for (const ch of linha) {
    const b = Buffer.byteLength(ch);
    if (bytes + b > (partes.length ? 74 : 75)) { partes.push(atual); atual = ''; bytes = 0; }
    atual += ch; bytes += b;
  }
  partes.push(atual);
  return partes.join('\r\n ');
}

for (const c of cartoes) {
  const linhas = ['BEGIN:VCARD', 'VERSION:3.0', `N:${c.n}`, `FN:${c.fn}`, ...c.linhas, `PHOTO;ENCODING=b;TYPE=JPEG:${foto(c.foto)}`, 'END:VCARD'];
  writeFileSync(`${root}cartao/${c.arquivo}`, linhas.map(dobrar).join('\r\n') + '\r\n');
  console.log('ok', c.arquivo);
}
