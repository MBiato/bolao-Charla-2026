const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

let palpites = {};
let resultados = {};

// JOGOS CONFIRMADOS — fonte: CNN Brasil / FIFA (grupos fechados após repescagens em 01/04/2026)
// Grupos: A=MEX/AFS/COR/TCH | B=CAN/BOS/CAT/SUI | C=BRA/MAR/HAI/ESC | D=EUA/PAR/AUS/TUR
//         E=ALE/CUR/CIM/EQU | F=HOL/JAP/SUE/TUN | G=BEL/EGI/IRA/NZL | H=ESP/CAV/ARS/URU
//         I=FRA/SEN/IRQ/NOR | J=ARG/ALG/AUT/JOR | K=POR/RDC/UZB/COL | L=ING/CRO/PAN/GAN

const JOGOS = [
  // ── RODADA 1 ──────────────────────────────────────────────────────────────
  // Grupo A
  [1,1,"11/06","16h","Mexico","Africa do Sul"],
  [2,1,"11/06","23h","Coreia do Sul","Rep. Tcheca"],
  // Grupo B
  [3,1,"12/06","16h","Canada","Bosnia e Herzegovina"],
  [4,1,"12/06","19h","Catar","Suica"],
  // Grupo C
  [5,1,"13/06","19h","Brasil","Marrocos"],
  [6,1,"13/06","22h","Haiti","Escocia"],
  // Grupo D
  [7,1,"12/06","22h","EUA","Paraguai"],
  [8,1,"13/06","01h","Australia","Turquia"],
  // Grupo E
  [9,1,"14/06","14h","Alemanha","Curacao"],
  [10,1,"14/06","20h","Costa do Marfim","Equador"],
  // Grupo F
  [11,1,"14/06","17h","Holanda","Japao"],
  [12,1,"14/06","23h","Suecia","Tunisia"],
  // Grupo G
  [13,1,"15/06","16h","Belgica","Egito"],
  [14,1,"15/06","22h","Ira","Nova Zelandia"],
  // Grupo H
  [15,1,"15/06","13h","Espanha","Cabo Verde"],
  [16,1,"15/06","19h","Arabia Saudita","Uruguai"],
  // Grupo I
  [17,1,"16/06","16h","Franca","Senegal"],
  [18,1,"16/06","19h","Iraque","Noruega"],
  // Grupo J
  [19,1,"16/06","14h","Argentina","Algeria"],
  [20,1,"17/06","01h","Austria","Jordania"],
  // Grupo K
  [21,1,"17/06","14h","Portugal","RD Congo"],
  [22,1,"17/06","23h","Uzbequistao","Colombia"],
  // Grupo L
  [23,1,"17/06","17h","Inglaterra","Croacia"],
  [24,1,"17/06","20h","Panama","Gana"],

  // ── RODADA 2 ──────────────────────────────────────────────────────────────
  // Grupo A
  [25,2,"18/06","13h","Africa do Sul","Rep. Tcheca"],
  [26,2,"18/06","22h","Mexico","Coreia do Sul"],
  // Grupo B
  [27,2,"18/06","19h","Canada","Catar"],
  [28,2,"18/06","16h","Bosnia e Herzegovina","Suica"],
  // Grupo C
  [29,2,"19/06","19h","Escocia","Marrocos"],
  [30,2,"19/06","22h","Brasil","Haiti"],
  // Grupo D
  [31,2,"19/06","01h","Turquia","Paraguai"],
  [32,2,"19/06","16h","EUA","Australia"],
  // Grupo E
  [33,2,"20/06","17h","Alemanha","Costa do Marfim"],
  [34,2,"20/06","21h","Equador","Curacao"],
  // Grupo F
  [35,2,"21/06","01h","Tunisia","Japao"],
  [36,2,"20/06","14h","Holanda","Suecia"],
  // Grupo G
  [37,2,"21/06","16h","Belgica","Ira"],
  [38,2,"21/06","22h","Nova Zelandia","Egito"],
  // Grupo H
  [39,2,"21/06","13h","Espanha","Arabia Saudita"],
  [40,2,"21/06","19h","Uruguai","Cabo Verde"],
  // Grupo I
  [41,2,"22/06","18h","Franca","Iraque"],
  [42,2,"22/06","21h","Noruega","Senegal"],
  // Grupo J
  [43,2,"22/06","14h","Argentina","Austria"],
  [44,2,"23/06","00h","Jordania","Algeria"],
  // Grupo K
  [45,2,"23/06","14h","Portugal","Uzbequistao"],
  [46,2,"23/06","23h","Colombia","RD Congo"],
  // Grupo L
  [47,2,"23/06","17h","Inglaterra","Panama"],
  [48,2,"23/06","20h","Croacia","Gana"],

  // ── RODADA 3 ──────────────────────────────────────────────────────────────
  // Grupo A
  [49,3,"24/06","22h","Rep. Tcheca","Mexico"],
  [50,3,"24/06","22h","Africa do Sul","Coreia do Sul"],
  // Grupo B
  [51,3,"24/06","16h","Suica","Canada"],
  [52,3,"24/06","16h","Bosnia e Herzegovina","Catar"],
  // Grupo C
  [53,3,"24/06","19h","Escocia","Brasil"],
  [54,3,"24/06","19h","Marrocos","Haiti"],
  // Grupo D
  [55,3,"25/06","23h","Turquia","EUA"],
  [56,3,"25/06","23h","Paraguai","Australia"],
  // Grupo E
  [57,3,"25/06","17h","Equador","Alemanha"],
  [58,3,"25/06","17h","Curacao","Costa do Marfim"],
  // Grupo F
  [59,3,"25/06","20h","Japao","Suecia"],
  [60,3,"25/06","20h","Tunisia","Holanda"],
  // Grupo G
  [61,3,"27/06","00h","Egito","Ira"],
  [62,3,"27/06","00h","Nova Zelandia","Belgica"],
  // Grupo H
  [63,3,"26/06","21h","Cabo Verde","Arabia Saudita"],
  [64,3,"26/06","21h","Uruguai","Espanha"],
  // Grupo I
  [65,3,"26/06","16h","Noruega","Franca"],
  [66,3,"26/06","16h","Senegal","Iraque"],
  // Grupo J
  [67,3,"27/06","23h","Algeria","Austria"],
  [68,3,"27/06","23h","Jordania","Argentina"],
  // Grupo K
  [69,3,"27/06","20h","Colombia","Portugal"],
  [70,3,"27/06","20h","RD Congo","Uzbequistao"],
  // Grupo L
  [71,3,"27/06","18h","Croacia","Inglaterra"],
  [72,3,"27/06","18h","Gana","Panama"]
];

const NOMES = ['Cantarelli','Betao','Enzo','Matheus','Covarde','Machado','Azevedo','Phill','Blu'];

app.get('/api/jogos', (req, res) => res.json(JOGOS));
app.get('/api/nomes', (req, res) => res.json(NOMES));

app.get('/api/palpites/:nome', (req, res) => {
  const nome = req.params.nome;
  const map = {};
  Object.values(palpites).filter(p => p.nome === nome).forEach(p => {
    map[p.jogo_id] = [p.gols_a, p.gols_b];
  });
  res.json(map);
});

app.post('/api/palpites', (req, res) => {
  const { nome, jogo_id, gols_a, gols_b } = req.body;
  if (!NOMES.includes(nome)) return res.status(400).json({ error: 'Nome invalido' });
  palpites[`${nome}:${jogo_id}`] = { nome, jogo_id, gols_a, gols_b };
  res.json({ ok: true });
});

app.post('/api/resultado', (req, res) => {
  const { senha, jogo_id, gols_a, gols_b } = req.body;
  if (senha !== 'admin2026') return res.status(401).json({ error: 'Senha incorreta' });
  resultados[jogo_id] = { gols_a, gols_b };
  res.json({ ok: true });
});

app.get('/api/ranking', (req, res) => {
  const ranking = NOMES.map(nome => {
    const meusPalpites = Object.values(palpites).filter(p => p.nome === nome);
    let pts = 0, exatos = 0, vencedores = 0;
    meusPalpites.forEach(p => {
      const res = resultados[p.jogo_id];
      if (!res) return;
      const pv = p.gols_a > p.gols_b ? 'A' : p.gols_a < p.gols_b ? 'B' : 'E';
      const rv = res.gols_a > res.gols_b ? 'A' : res.gols_a < res.gols_b ? 'B' : 'E';
      if (p.gols_a === res.gols_a && p.gols_b === res.gols_b) { pts += 3; exatos++; }
      else if (pv === rv) { pts += 1; vencedores++; }
    });
    return { nome, pts, exatos, vencedores, total: meusPalpites.length };
  });
  ranking.sort((a, b) => b.pts - a.pts || b.exatos - a.exatos);
  res.json(ranking);
});

app.get('/api/backup', (req, res) => {
  const { senha } = req.query;
  if (senha !== 'admin2026') return res.status(401).json({ error: 'Senha incorreta' });
  res.json({ exportado_em: new Date().toISOString(), palpites: Object.values(palpites), resultados });
});

app.post('/api/restore', (req, res) => {
  const { senha, data } = req.body;
  if (senha !== 'admin2026') return res.status(401).json({ error: 'Senha incorreta' });
  if (data.palpites) {
    palpites = {};
    data.palpites.forEach(p => { palpites[`${p.nome}:${p.jogo_id}`] = p; });
  }
  if (data.resultados) resultados = data.resultados;
  res.json({ ok: true, palpites: Object.keys(palpites).length });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Bolao rodando na porta ' + PORT));
