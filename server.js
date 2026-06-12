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

// Calendário oficial FIFA — horários de Brasília
// Fonte: trivela.com.br (FIFA.com) — atualizado 11/06/2026
const JOGOS = [
  // RODADA 1 — data e horário LOCAL do estádio — fonte FIFA oficial
  [ 1, 1, "11/06", "16h",   "Mexico",               "Africa do Sul"],
  [ 2, 1, "11/06", "20h",   "Coreia do Sul",         "Rep. Tcheca"],
  [ 3, 1, "12/06", "15h",   "Canada",                "Bosnia e Herzegovina"],
  [ 4, 1, "12/06", "18h",   "EUA",                   "Paraguai"],
  [ 5, 1, "13/06", "12h",   "Catar",                 "Suica"],
  [ 6, 1, "13/06", "18h",   "Brasil",                "Marrocos"],
  [ 7, 1, "13/06", "21h",   "Haiti",                 "Escocia"],
  [ 8, 1, "13/06", "21h",   "Australia",             "Turquia"],
  [ 9, 1, "14/06", "12h",   "Alemanha",              "Curacao"],
  [10, 1, "14/06", "15h",   "Holanda",               "Japao"],
  [11, 1, "14/06", "19h",   "Costa do Marfim",       "Equador"],
  [12, 1, "14/06", "20h",   "Suecia",                "Tunisia"],
  [13, 1, "15/06", "12h",   "Espanha",               "Cabo Verde"],
  [14, 1, "15/06", "12h",   "Belgica",               "Egito"],
  [15, 1, "15/06", "18h",   "Arabia Saudita",        "Uruguai"],
  [16, 1, "15/06", "18h",   "Ira",                   "Nova Zelandia"],
  [17, 1, "16/06", "15h",   "Franca",                "Senegal"],
  [18, 1, "16/06", "18h",   "Iraque",                "Noruega"],
  [19, 1, "16/06", "20h",   "Argentina",             "Algeria"],
  [20, 1, "16/06", "21h",   "Austria",               "Jordania"],
  [21, 1, "17/06", "12h",   "Portugal",              "RD Congo"],
  [22, 1, "17/06", "15h",   "Inglaterra",            "Croacia"],
  [23, 1, "17/06", "19h",   "Gana",                  "Panama"],
  [24, 1, "17/06", "20h",   "Uzbequistao",           "Colombia"],
  // RODADA 2 — data e horário LOCAL do estádio — fonte FIFA oficial
  [25, 2, "18/06", "12h",   "Rep. Tcheca",           "Africa do Sul"],
  [26, 2, "18/06", "12h",   "Suica",                 "Bosnia e Herzegovina"],
  [27, 2, "18/06", "15h",   "Canada",                "Catar"],
  [28, 2, "18/06", "19h",   "Mexico",                "Coreia do Sul"],
  [29, 2, "19/06", "12h",   "EUA",                   "Australia"],
  [30, 2, "19/06", "18h",   "Escocia",               "Marrocos"],
  [31, 2, "19/06", "20h30", "Brasil",                "Haiti"],
  [32, 2, "19/06", "20h",   "Turquia",               "Paraguai"],
  [33, 2, "20/06", "12h",   "Holanda",               "Suecia"],
  [34, 2, "20/06", "16h",   "Alemanha",              "Costa do Marfim"],
  [35, 2, "20/06", "19h",   "Equador",               "Curacao"],
  [36, 2, "20/06", "20h",   "Tunisia",               "Japao"],
  [37, 2, "21/06", "12h",   "Espanha",               "Arabia Saudita"],
  [38, 2, "21/06", "12h",   "Belgica",               "Ira"],
  [39, 2, "21/06", "18h",   "Uruguai",               "Cabo Verde"],
  [40, 2, "21/06", "18h",   "Nova Zelandia",         "Egito"],
  [41, 2, "22/06", "12h",   "Argentina",             "Austria"],
  [42, 2, "22/06", "17h",   "Franca",                "Iraque"],
  [43, 2, "22/06", "20h",   "Noruega",               "Senegal"],
  [44, 2, "22/06", "20h",   "Jordania",              "Algeria"],
  [45, 2, "23/06", "12h",   "Portugal",              "Uzbequistao"],
  [46, 2, "23/06", "16h",   "Inglaterra",            "Gana"],
  [47, 2, "23/06", "19h",   "Panama",                "Croacia"],
  [48, 2, "23/06", "20h",   "Colombia",              "RD Congo"],
  // RODADA 3 — data e horário LOCAL do estádio — fonte FIFA oficial
  [49, 3, "24/06", "12h",   "Suica",                 "Canada"],
  [50, 3, "24/06", "12h",   "Bosnia e Herzegovina",  "Catar"],
  [51, 3, "24/06", "18h",   "Escocia",               "Brasil"],
  [52, 3, "24/06", "18h",   "Marrocos",              "Haiti"],
  [53, 3, "24/06", "19h",   "Rep. Tcheca",           "Mexico"],
  [54, 3, "24/06", "19h",   "Africa do Sul",         "Coreia do Sul"],
  [55, 3, "25/06", "16h",   "Equador",               "Alemanha"],
  [56, 3, "25/06", "16h",   "Curacao",               "Costa do Marfim"],
  [57, 3, "25/06", "18h",   "Japao",                 "Suecia"],
  [58, 3, "25/06", "18h",   "Tunisia",               "Holanda"],
  [59, 3, "25/06", "19h",   "Turquia",               "EUA"],
  [60, 3, "25/06", "19h",   "Paraguai",              "Australia"],
  [61, 3, "26/06", "15h",   "Noruega",               "Franca"],
  [62, 3, "26/06", "15h",   "Senegal",               "Iraque"],
  [63, 3, "26/06", "19h",   "Cabo Verde",            "Arabia Saudita"],
  [64, 3, "26/06", "18h",   "Uruguai",               "Espanha"],
  [65, 3, "26/06", "20h",   "Egito",                 "Ira"],
  [66, 3, "26/06", "20h",   "Nova Zelandia",         "Belgica"],
  [67, 3, "27/06", "17h",   "Panama",                "Inglaterra"],
  [68, 3, "27/06", "17h",   "Croacia",               "Gana"],
  [69, 3, "27/06", "19h30", "Colombia",              "Portugal"],
  [70, 3, "27/06", "19h30", "RD Congo",              "Uzbequistao"],
  [71, 3, "27/06", "21h",   "Algeria",               "Austria"],
  [72, 3, "27/06", "21h",   "Jordania",              "Argentina"],
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
  const dias = [...new Set(JOGOS.map(j => j[2]))].sort((a, b) => {
    const [da, ma] = a.split('/').map(Number);
    const [db, mb] = b.split('/').map(Number);
    return ma - mb || da - db;
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
