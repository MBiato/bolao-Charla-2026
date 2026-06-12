const express = require('express');
const { Pool } = require('pg');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS palpites (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      jogo_id INTEGER NOT NULL,
      gols_a INTEGER NOT NULL,
      gols_b INTEGER NOT NULL,
      atualizado_em TIMESTAMP DEFAULT NOW(),
      UNIQUE(nome, jogo_id)
    );
    CREATE TABLE IF NOT EXISTS resultados (
      jogo_id INTEGER PRIMARY KEY,
      gols_a INTEGER NOT NULL,
      gols_b INTEGER NOT NULL,
      twoup_time TEXT DEFAULT NULL,
      atualizado_em TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('Banco pronto!');
}

// Calendário oficial FIFA — horários de Brasília — fonte: FIFA/Soccerway abril 2026
const JOGOS = [
  // ── RODADA 1 ──────────────────────────────────────────────────────────────
  // Grupo A
  [1,  1, "11/06", "16h",    "Mexico",               "Africa do Sul"],
  [2,  1, "11/06", "23h",    "Coreia do Sul",         "Rep. Tcheca"],
  // Grupo B
  [3,  1, "12/06", "16h",    "Canada",                "Bosnia e Herzegovina"],
  [4,  1, "12/06", "22h",    "EUA",                   "Paraguai"],
  // Grupo D
  [5,  1, "13/06", "01h",    "Australia",              "Turquia"],
  // Grupo B
  [6,  1, "13/06", "16h",    "Catar",                 "Suica"],
  // Grupo C
  [7,  1, "13/06", "19h",    "Brasil",                "Marrocos"],
  [8,  1, "13/06", "22h",    "Haiti",                 "Escocia"],
  // Grupo E
  [9,  1, "14/06", "14h",    "Alemanha",              "Curacao"],
  // Grupo F
  [10, 1, "14/06", "17h",    "Holanda",               "Japao"],
  // Grupo E
  [11, 1, "14/06", "20h",    "Costa do Marfim",       "Equador"],
  // Grupo F
  [12, 1, "14/06", "23h",    "Suecia",                "Tunisia"],
  // Grupo H
  [13, 1, "15/06", "13h",    "Espanha",               "Cabo Verde"],
  // Grupo G
  [14, 1, "15/06", "16h",    "Belgica",               "Egito"],
  // Grupo H
  [15, 1, "15/06", "19h",    "Arabia Saudita",        "Uruguai"],
  // Grupo G
  [16, 1, "15/06", "22h",    "Ira",                   "Nova Zelandia"],
  // Grupo J
  [17, 1, "16/06", "14h",    "Argentina",             "Algeria"],
  // Grupo I
  [18, 1, "16/06", "16h",    "Franca",                "Senegal"],
  [19, 1, "16/06", "19h",    "Iraque",                "Noruega"],
  // Grupo J
  [20, 1, "17/06", "01h",    "Austria",               "Jordania"],
  // Grupo K
  [21, 1, "17/06", "14h",    "Portugal",              "RD Congo"],
  // Grupo L
  [22, 1, "17/06", "17h",    "Inglaterra",            "Croacia"],
  [23, 1, "17/06", "20h",    "Gana",                  "Panama"],
  // Grupo K
  [24, 1, "17/06", "23h",    "Uzbequistao",           "Colombia"],

  // ── RODADA 2 ──────────────────────────────────────────────────────────────
  // Grupo A
  [25, 2, "18/06", "13h",    "Rep. Tcheca",           "Africa do Sul"],
  // Grupo B
  [26, 2, "18/06", "16h",    "Suica",                 "Bosnia e Herzegovina"],
  [27, 2, "18/06", "19h",    "Canada",                "Catar"],
  // Grupo A
  [28, 2, "18/06", "22h",    "Mexico",                "Coreia do Sul"],
  // Grupo D
  [29, 2, "19/06", "01h",    "Turquia",               "Paraguai"],
  [30, 2, "19/06", "16h",    "EUA",                   "Australia"],
  // Grupo C
  [31, 2, "19/06", "19h",    "Escocia",               "Marrocos"],
  [32, 2, "19/06", "22h",    "Brasil",                "Haiti"],
  // Grupo F
  [33, 2, "20/06", "14h",    "Holanda",               "Suecia"],
  // Grupo E
  [34, 2, "20/06", "17h",    "Alemanha",              "Costa do Marfim"],
  [35, 2, "20/06", "21h",    "Equador",               "Curacao"],
  // Grupo F
  [36, 2, "21/06", "01h",    "Tunisia",               "Japao"],
  // Grupo H
  [37, 2, "21/06", "13h",    "Espanha",               "Arabia Saudita"],
  // Grupo G
  [38, 2, "21/06", "16h",    "Belgica",               "Ira"],
  // Grupo H
  [39, 2, "21/06", "19h",    "Uruguai",               "Cabo Verde"],
  // Grupo G
  [40, 2, "21/06", "22h",    "Nova Zelandia",         "Egito"],
  // Grupo J
  [41, 2, "22/06", "14h",    "Argentina",             "Austria"],
  // Grupo I
  [42, 2, "22/06", "18h",    "Franca",                "Iraque"],
  [43, 2, "22/06", "21h",    "Noruega",               "Senegal"],
  // Grupo J
  [44, 2, "23/06", "00h",    "Jordania",              "Algeria"],
  // Grupo K
  [45, 2, "23/06", "14h",    "Portugal",              "Uzbequistao"],
  // Grupo L
  [46, 2, "23/06", "17h",    "Inglaterra",            "Gana"],
  [47, 2, "23/06", "20h",    "Panama",                "Croacia"],
  // Grupo K
  [48, 2, "23/06", "23h",    "Colombia",              "RD Congo"],

  // ── RODADA 3 ──────────────────────────────────────────────────────────────
  // Grupo B
  [49, 3, "24/06", "16h",    "Suica",                 "Canada"],
  [50, 3, "24/06", "16h",    "Bosnia e Herzegovina",  "Catar"],
  // Grupo C
  [51, 3, "24/06", "19h",    "Escocia",               "Brasil"],
  [52, 3, "24/06", "19h",    "Marrocos",              "Haiti"],
  // Grupo A
  [53, 3, "24/06", "22h",    "Rep. Tcheca",           "Mexico"],
  [54, 3, "24/06", "22h",    "Africa do Sul",         "Coreia do Sul"],
  // Grupo E
  [55, 3, "25/06", "17h",    "Equador",               "Alemanha"],
  [56, 3, "25/06", "17h",    "Curacao",               "Costa do Marfim"],
  // Grupo F
  [57, 3, "25/06", "20h",    "Japao",                 "Suecia"],
  [58, 3, "25/06", "20h",    "Tunisia",               "Holanda"],
  // Grupo D
  [59, 3, "25/06", "23h",    "Turquia",               "EUA"],
  [60, 3, "25/06", "23h",    "Paraguai",              "Australia"],
  // Grupo I
  [61, 3, "26/06", "16h",    "Noruega",               "Franca"],
  [62, 3, "26/06", "16h",    "Senegal",               "Iraque"],
  // Grupo H
  [63, 3, "26/06", "21h",    "Cabo Verde",            "Arabia Saudita"],
  [64, 3, "26/06", "21h",    "Uruguai",               "Espanha"],
  // Grupo G
  [65, 3, "27/06", "00h",    "Egito",                 "Ira"],
  [66, 3, "27/06", "00h",    "Nova Zelandia",         "Belgica"],
  // Grupo L
  [67, 3, "27/06", "18h",    "Panama",                "Inglaterra"],
  [68, 3, "27/06", "18h",    "Croacia",               "Gana"],
  // Grupo K
  [69, 3, "27/06", "20h30",  "Colombia",              "Portugal"],
  [70, 3, "27/06", "20h30",  "RD Congo",              "Uzbequistao"],
  // Grupo J
  [71, 3, "27/06", "23h",    "Algeria",               "Austria"],
  [72, 3, "27/06", "23h",    "Jordania",              "Argentina"],
];

const NOMES = ['Cantarelli','Betao','Enzo','Matheus','Covarde','Machado','Azevedo','Phill','Blu'];

function calcularPontos(p, r) {
  const ga = parseInt(p.gols_a), gb = parseInt(p.gols_b);
  const ra = parseInt(r.gols_a), rb = parseInt(r.gols_b);
  const pV = ga > gb ? 'A' : ga < gb ? 'B' : 'E';
  const rV = ra > rb ? 'A' : ra < rb ? 'B' : 'E';
  const twoup = r.twoup_time || null;
  if (ga === ra && gb === rb) return { pts: 3, tipo: twoup ? '2UP-exato' : 'exato' };
  if (pV === rV) return { pts: 1, tipo: twoup ? '2UP-vencedor' : 'vencedor' };
  if (twoup && ((twoup === 'A' && pV === 'A') || (twoup === 'B' && pV === 'B')))
    return { pts: 1, tipo: '2UP' };
  return { pts: 0, tipo: 'erro' };
}

app.get('/api/jogos', (req, res) => res.json(JOGOS));
app.get('/api/nomes', (req, res) => res.json(NOMES));

app.get('/api/palpites/:nome', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT jogo_id, gols_a, gols_b FROM palpites WHERE nome = $1', [req.params.nome]);
  const map = {};
  rows.forEach(r => { map[r.jogo_id] = [r.gols_a, r.gols_b]; });
  res.json(map);
});

app.post('/api/palpites', async (req, res) => {
  const { nome, jogo_id, gols_a, gols_b } = req.body;
  if (!NOMES.includes(nome)) return res.status(400).json({ error: 'Nome invalido' });
  await pool.query(`
    INSERT INTO palpites (nome, jogo_id, gols_a, gols_b)
    VALUES ($1,$2,$3,$4)
    ON CONFLICT (nome, jogo_id) DO UPDATE SET gols_a=$3, gols_b=$4, atualizado_em=NOW()
  `, [nome, jogo_id, gols_a, gols_b]);
  res.json({ ok: true });
});

app.post('/api/resultado', async (req, res) => {
  const { senha, jogo_id, gols_a, gols_b, twoup_time } = req.body;
  if (senha !== 'admin2026') return res.status(401).json({ error: 'Senha incorreta' });
  await pool.query(`
    INSERT INTO resultados (jogo_id, gols_a, gols_b, twoup_time)
    VALUES ($1,$2,$3,$4)
    ON CONFLICT (jogo_id) DO UPDATE SET gols_a=$2, gols_b=$3, twoup_time=$4, atualizado_em=NOW()
  `, [jogo_id, gols_a, gols_b, twoup_time || null]);
  res.json({ ok: true });
});

app.get('/api/ranking', async (req, res) => {
  const { rows: todosP } = await pool.query('SELECT * FROM palpites');
  const { rows: todosR } = await pool.query('SELECT * FROM resultados');
  const resMap = {};
  todosR.forEach(r => { resMap[r.jogo_id] = r; });
  const ranking = NOMES.map(nome => {
    const meus = todosP.filter(p => p.nome === nome);
    let pts = 0, exatos = 0, vencedores = 0, twoup = 0;
    meus.forEach(p => {
      const r = resMap[p.jogo_id];
      if (!r) return;
      const c = calcularPontos(p, r);
      pts += c.pts;
      if (c.tipo === 'exato') exatos++;
      else if (c.tipo === 'vencedor') vencedores++;
      else if (c.tipo.startsWith('2UP')) twoup++;
    });
    return { nome, pts, exatos, vencedores, twoup, total: meus.length };
  });
  ranking.sort((a, b) => b.pts - a.pts || b.exatos - a.exatos);
  res.json(ranking);
});

app.get('/api/resultados-dia', async (req, res) => {
  const { dia } = req.query;
  const { rows: todosP } = await pool.query('SELECT * FROM palpites');
  const { rows: todosR } = await pool.query('SELECT * FROM resultados');
  const resMap = {};
  todosR.forEach(r => { resMap[r.jogo_id] = r; });
  const jogosDia = dia ? JOGOS.filter(j => j[2] === dia) : JOGOS;
  const result = jogosDia.map(j => {
    const res = resMap[j[0]] || null;
    const palpitesPorJogo = NOMES.map(nome => {
      const p = todosP.find(x => x.nome === nome && parseInt(x.jogo_id) === j[0]);
      if (!p) return null;
      const calc = res ? calcularPontos(p, res) : { pts: 0, tipo: 'pendente' };
      return { nome, gols_a: p.gols_a, gols_b: p.gols_b, pts: calc.pts, tipo: calc.tipo };
    }).filter(Boolean);
    return {
      jogo_id: j[0], rodada: j[1], dia: j[2], hora: j[3],
      time_a: j[4], time_b: j[5],
      resultado: res ? { gols_a: res.gols_a, gols_b: res.gols_b, twoup_time: res.twoup_time } : null,
      palpites: palpitesPorJogo
    };
  });
  res.json(result);
});

app.get('/api/dias', (req, res) => {
  const dias = [...new Set(JOGOS.map(j => j[2]))].sort((a,b) => {
    const [da,ma] = a.split('/').map(Number);
    const [db,mb] = b.split('/').map(Number);
    return ma-mb || da-db;
  });
  res.json(dias);
});

app.get('/api/backup', async (req, res) => {
  const { senha } = req.query;
  if (senha !== 'admin2026') return res.status(401).json({ error: 'Senha incorreta' });
  const { rows: palpites } = await pool.query('SELECT * FROM palpites ORDER BY nome, jogo_id');
  const { rows: resultados } = await pool.query('SELECT * FROM resultados ORDER BY jogo_id');
  res.json({ exportado_em: new Date().toISOString(), palpites, resultados });
});

const PORT = process.env.PORT || 3000;
initDB().then(() => app.listen(PORT, () => console.log('Bolao na porta ' + PORT)));
