const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const db = new Database('.data/bolao.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS palpites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    jogo_id INTEGER NOT NULL,
    gols_a INTEGER,
    gols_b INTEGER,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(nome, jogo_id)
  );
  CREATE TABLE IF NOT EXISTS resultados (
    jogo_id INTEGER PRIMARY KEY,
    gols_a INTEGER,
    gols_b INTEGER
  );
`);

const JOGOS = [
  [1,1,"11/06","16h","Mexico","Africa do Sul"],
  [2,1,"11/06","23h","Coreia do Sul","Rep. Tcheca"],
  [3,1,"12/06","16h","Canada","Italia"],
  [4,1,"12/06","22h","EUA","Paraguai"],
  [5,1,"13/06","01h","Australia","Turquia"],
  [6,1,"13/06","16h","Catar","Suica"],
  [7,1,"13/06","19h","Brasil","Marrocos"],
  [8,1,"13/06","22h","Haiti","Escocia"],
  [9,1,"14/06","14h","Alemanha","Curacao"],
  [10,1,"14/06","17h","Holanda","Japao"],
  [11,1,"14/06","20h","Costa do Marfim","Equador"],
  [12,1,"14/06","23h","Ucrania","Tunisia"],
  [13,1,"15/06","13h","Espanha","Cabo Verde"],
  [14,1,"15/06","16h","Belgica","Egito"],
  [15,1,"15/06","19h","Arabia Saudita","Uruguai"],
  [16,1,"15/06","22h","Ira","Nova Zelandia"],
  [17,1,"16/06","14h","Argentina","Algeria"],
  [18,1,"16/06","16h","Franca","Senegal"],
  [19,1,"16/06","19h","Iraque","Noruega"],
  [20,1,"17/06","01h","Austria","Jordania"],
  [21,1,"17/06","14h","Portugal","RD Congo"],
  [22,1,"17/06","17h","Inglaterra","Croacia"],
  [23,1,"17/06","20h","Gana","Panama"],
  [24,1,"17/06","23h","Uzbequistao","Colombia"],
  [25,2,"18/06","13h","Rep. Tcheca","Africa do Sul"],
  [26,2,"18/06","16h","Suica","Italia"],
  [27,2,"18/06","19h","Canada","Catar"],
  [28,2,"18/06","22h","Mexico","Coreia do Sul"],
  [29,2,"19/06","01h","Turquia","Paraguai"],
  [30,2,"19/06","16h","EUA","Australia"],
  [31,2,"19/06","19h","Escocia","Marrocos"],
  [32,2,"19/06","22h","Brasil","Haiti"],
  [33,2,"20/06","14h","Holanda","Ucrania"],
  [34,2,"20/06","17h","Alemanha","Costa do Marfim"],
  [35,2,"20/06","21h","Equador","Curacao"],
  [36,2,"21/06","01h","Tunisia","Japao"],
  [37,2,"21/06","13h","Espanha","Arabia Saudita"],
  [38,2,"21/06","16h","Belgica","Ira"],
  [39,2,"21/06","19h","Uruguai","Cabo Verde"],
  [40,2,"21/06","22h","Nova Zelandia","Egito"],
  [41,2,"22/06","14h","Argentina","Austria"],
  [42,2,"22/06","18h","Franca","Iraque"],
  [43,2,"22/06","21h","Noruega","Senegal"],
  [44,2,"23/06","00h","Jordania","Algeria"],
  [45,2,"23/06","14h","Portugal","Uzbequistao"],
  [46,2,"23/06","17h","Inglaterra","Gana"],
  [47,2,"23/06","20h","Panama","Croacia"],
  [48,2,"23/06","23h","Colombia","RD Congo"],
  [49,3,"24/06","16h","Suica","Canada"],
  [50,3,"24/06","16h","Italia","Catar"],
  [51,3,"24/06","19h","Escocia","Brasil"],
  [52,3,"24/06","19h","Marrocos","Haiti"],
  [53,3,"24/06","22h","Rep. Tcheca","Mexico"],
  [54,3,"24/06","22h","Africa do Sul","Coreia do Sul"],
  [55,3,"25/06","17h","Equador","Alemanha"],
  [56,3,"25/06","17h","Curacao","Costa do Marfim"],
  [57,3,"25/06","20h","Japao","Ucrania"],
  [58,3,"25/06","20h","Tunisia","Holanda"],
  [59,3,"25/06","23h","Turquia","EUA"],
  [60,3,"25/06","23h","Paraguai","Australia"],
  [61,3,"26/06","16h","Noruega","Franca"],
  [62,3,"26/06","16h","Senegal","Iraque"],
  [63,3,"26/06","21h","Cabo Verde","Arabia Saudita"],
  [64,3,"26/06","21h","Uruguai","Espanha"],
  [65,3,"27/06","00h","Egito","Ira"],
  [66,3,"27/06","00h","Nova Zelandia","Belgica"],
  [67,3,"27/06","18h","Panama","Inglaterra"],
  [68,3,"27/06","18h","Croacia","Gana"],
  [69,3,"27/06","20h","Colombia","Portugal"],
  [70,3,"27/06","20h","RD Congo","Uzbequistao"],
  [71,3,"27/06","23h","Algeria","Austria"],
  [72,3,"27/06","23h","Jordania","Argentina"]
];

const NOMES = ['Cantarelli','Betao','Enzo','Matheus','Covarde','Machado','Azevedo','Phill','Blu'];

// ── API ──────────────────────────────────────────────────────────────────────

app.get('/api/jogos', (req, res) => res.json(JOGOS));
app.get('/api/nomes', (req, res) => res.json(NOMES));

app.get('/api/palpites/:nome', (req, res) => {
  const rows = db.prepare('SELECT jogo_id, gols_a, gols_b FROM palpites WHERE nome = ?').all(req.params.nome);
  const map = {};
  rows.forEach(r => { map[r.jogo_id] = [r.gols_a, r.gols_b]; });
  res.json(map);
});

app.post('/api/palpites', (req, res) => {
  const { nome, jogo_id, gols_a, gols_b } = req.body;
  if (!NOMES.includes(nome)) return res.status(400).json({ error: 'Nome invalido' });
  db.prepare(`
    INSERT INTO palpites (nome, jogo_id, gols_a, gols_b)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(nome, jogo_id) DO UPDATE SET gols_a=excluded.gols_a, gols_b=excluded.gols_b
  `).run(nome, jogo_id, gols_a, gols_b);
  res.json({ ok: true });
});

// Admin: lançar resultado oficial
app.post('/api/resultado', (req, res) => {
  const { senha, jogo_id, gols_a, gols_b } = req.body;
  if (senha !== 'admin2026') return res.status(401).json({ error: 'Senha incorreta' });
  db.prepare(`
    INSERT INTO resultados (jogo_id, gols_a, gols_b)
    VALUES (?, ?, ?)
    ON CONFLICT(jogo_id) DO UPDATE SET gols_a=excluded.gols_a, gols_b=excluded.gols_b
  `).run(jogo_id, gols_a, gols_b);
  res.json({ ok: true });
});

// Ranking calculado
app.get('/api/ranking', (req, res) => {
  const resultados = db.prepare('SELECT * FROM resultados').all();
  const resMap = {};
  resultados.forEach(r => { resMap[r.jogo_id] = r; });

  const ranking = NOMES.map(nome => {
    const palpites = db.prepare('SELECT * FROM palpites WHERE nome = ?').all(nome);
    let pts = 0, exatos = 0, vencedores = 0, total = palpites.length;
    palpites.forEach(p => {
      const res = resMap[p.jogo_id];
      if (!res) return;
      const palvenc = p.gols_a > p.gols_b ? 'A' : p.gols_a < p.gols_b ? 'B' : 'E';
      const resvenc = res.gols_a > res.gols_b ? 'A' : res.gols_a < res.gols_b ? 'B' : 'E';
      if (p.gols_a === res.gols_a && p.gols_b === res.gols_b) { pts += 3; exatos++; }
      else if (palvenc === resvenc) { pts += 1; vencedores++; }
    });
    return { nome, pts, exatos, vencedores, total };
  });

  ranking.sort((a, b) => b.pts - a.pts || b.exatos - a.exatos);
  res.json(ranking);
});

// Todos os palpites (admin)
app.get('/api/admin/palpites', (req, res) => {
  const rows = db.prepare('SELECT * FROM palpites ORDER BY nome, jogo_id').all();
  res.json(rows);
});

app.listen(3000, () => console.log('Bolao rodando na porta 3000'));
