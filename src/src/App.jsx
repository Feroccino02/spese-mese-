import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const CATEGORIE_USCITE = [
  { nome: "Casa", colore: "#E8C547", icona: "🏠" },
  { nome: "Cibo", colore: "#F4845F", icona: "🛒" },
  { nome: "Trasporti", colore: "#7EC8E3", icona: "🚗" },
  { nome: "Svago", colore: "#A78BFA", icona: "🎬" },
  { nome: "Salute", colore: "#6EE7B7", icona: "💊" },
  { nome: "Abbigliamento", colore: "#F9A8D4", icona: "👗" },
  { nome: "Altro", colore: "#94A3B8", icona: "📦" },
];

const CATEGORIE_ENTRATE = [
  { nome: "Stipendio", colore: "#4ADE80", icona: "💼" },
  { nome: "Freelance", colore: "#34D399", icona: "💻" },
  { nome: "Affitto", colore: "#86EFAC", icona: "🏘️" },
  { nome: "Investimenti", colore: "#6EE7B7", icona: "📈" },
  { nome: "Regalo", colore: "#A7F3D0", icona: "🎁" },
  { nome: "Altro", colore: "#D1FAE5", icona: "✨" },
];

const MESI = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
const meseCorrDefault = new Date().getMonth();
const FORM_VUOTO = { desc: "", cat: "", imp: "" };

export default function DashboardSpese() {
  const [mese, setMese] = useState(meseCorrDefault);
  const [dati, setDati] = useState(() => {
    try {
      const saved = localStorage.getItem("budget-tracker-v2");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [tipoForm, setTipoForm] = useState(null);
  const [form, setForm] = useState(FORM_VUOTO);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => { setAnimKey(k => k + 1); }, [mese]);
  useEffect(() => {
    try { localStorage.setItem("budget-tracker-v2", JSON.stringify(dati)); } catch {}
  }, [dati]);

  const meseDati = dati[mese] || { uscite: [], entrate: [] };
  const uscite = meseDati.uscite || [];
  const entrate = meseDati.entrate || [];
  const totUscite = uscite.reduce((s, x) => s + x.imp, 0);
  const totEntrate = entrate.reduce((s, x) => s + x.imp, 0);
  const saldo = totEntrate - totUscite;

  const perCategoria = CATEGORIE_USCITE.map(c => ({
    ...c,
    totale: uscite.filter(x => x.cat === c.nome).reduce((s, x) => s + x.imp, 0),
  })).filter(c => c.totale > 0);

  const dataMesi = MESI.map((m, i) => {
    const d = dati[i] || {};
    return {
      mese: m,
      entrate: (d.entrate || []).reduce((s, x) => s + x.imp, 0),
      uscite: (d.uscite || []).reduce((s, x) => s + x.imp, 0),
    };
  });

  const apriForm = (tipo) => {
    if (tipoForm === tipo) { setTipoForm(null); return; }
    const categorie = tipo === "uscita" ? CATEGORIE_USCITE : CATEGORIE_ENTRATE;
    setForm({ ...FORM_VUOTO, cat: categorie[0].nome });
    setTipoForm(tipo);
  };

  const salva = () => {
    if (!form.desc || !form.imp) return;
    const chiave = tipoForm === "uscita" ? "uscite" : "entrate";
    setDati(prev => ({
      ...prev,
      [mese]: {
        uscite: prev[mese]?.uscite || [],
        entrate: prev[mese]?.entrate || [],
        [chiave]: [...(prev[mese]?.[chiave] || []), { ...form, imp: parseFloat(form.imp) }],
      },
    }));
    setForm(FORM_VUOTO);
    setTipoForm(null);
  };

  const rimuovi = (tipo, i) => {
    const chiave = tipo === "uscita" ? "uscite" : "entrate";
    setDati(prev => ({
      ...prev,
      [mese]: {
        ...meseDati,
        [chiave]: meseDati[chiave].filter((_, idx) => idx !== i),
      },
    }));
  };

  const pct = (v) => totUscite ? Math.round((v / totUscite) * 100) : 0;
  const fmt = (n) => n.toLocaleString("it-IT");
  const categorieCorrenti = tipoForm === "uscita" ? CATEGORIE_USCITE : CATEGORIE_ENTRATE;

  return (
    <div style={{ fontFamily: "'DM Mono', 'Courier New', monospace", background: "#0F0F12", minHeight: "100vh", color: "#E8E6E1" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Playfair+Display:wght@700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0F0F12; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        .card { background: #16161A; border: 1px solid #1E1E26; border-radius: 16px; }
        .pill { background: #1E1E24; border: 1px solid #2A2A32; border-radius: 8px; padding: 4px 12px; font-size: 11px; cursor: pointer; transition: all 0.2s; color: #666; }
        .pill:hover { border-color: #E8C547; color: #E8C547; }
        .pill.active { background: #E8C547; color: #0F0F12; border-color: #E8C547; font-weight: 500; }
        .btn { border: none; border-radius: 10px; padding: 10px 22px; font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; letter-spacing: 0.5px; }
        .btn-uscita { background: #F4845F; color: #0F0F12; }
        .btn-uscita:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 4px 20px rgba(244,132,95,0.3); }
        .btn-entrata { background: #4ADE80; color: #0F0F12; }
        .btn-entrata:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 4px 20px rgba(74,222,128,0.3); }
        .btn-salva { background: #E8C547; color: #0F0F12; }
        .btn-salva:hover { filter: brightness(1.1); }
        .input { background: #1E1E24; border: 1px solid #2A2A32; border-radius: 8px; color: #E8E6E1; font-family: inherit; font-size: 13px; padding: 10px 14px; outline: none; transition: border 0.2s; }
        .input:focus { border-color: #E8C547; }
        .row-t { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #1A1A20; }
        .row-t:hover .del-btn { opacity: 1; }
        .del-btn { opacity: 0; background: none; border: 1px solid #2A2A32; border-radius: 6px; color: #555; font-size: 11px; padding: 3px 8px; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .del-btn:hover { border-color: #f87171; color: #f87171; }
        .stat-num { font-family: 'Playfair Display', serif; font-size: 34px; font-weight: 900; letter-spacing: -1px; }
        .fade-in { animation: fadeSlide 0.35s ease both; }
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .bar-fill { height: 5px; border-radius: 3px; transition: width 0.6s cubic-bezier(0.34,1.56,0.64,1); }
        .tooltip-box { background: #1E1E24; border: 1px solid #2A2A32; border-radius: 8px; padding: 10px 14px; font-size: 12px; }
        .badge { display: inline-flex; align-items: center; padding: 1px 7px; border-radius: 20px; font-size: 10px; font-weight: 500; }
        .badge-e { background: #4ADE8018; color: #4ADE80; }
        .badge-u { background: #F4845F18; color: #F4845F; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "32px 32px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: "#444", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 6 }}>BUDGET TRACKER</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 900, color: "#E8E6E1", lineHeight: 1 }}>
            {MESI[mese]} {new Date().getFullYear()}
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className={`btn btn-entrata`} onClick={() => apriForm("entrata")}>
            {tipoForm === "entrata" ? "✕ Chiudi" : "+ Entrata"}
          </button>
          <button className={`btn btn-uscita`} onClick={() => apriForm("uscita")}>
            {tipoForm === "uscita" ? "✕ Chiudi" : "− Uscita"}
          </button>
        </div>
      </div>

      {/* Mesi */}
      <div style={{ padding: "20px 32px 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
        {MESI.map((m, i) => (
          <button key={m} className={`pill ${mese === i ? "active" : ""}`} onClick={() => setMese(i)}>{m}</button>
        ))}
      </div>

      {/* Form panel */}
      {tipoForm && (
        <div style={{ padding: "16px 32px 0" }}>
          <div style={{
            padding: "20px", background: "#16161A", borderRadius: 16,
            borderTop: `3px solid ${tipoForm === "uscita" ? "#F4845F" : "#4ADE80"}`
          }}>
            <div style={{ fontSize: 11, color: tipoForm === "uscita" ? "#F4845F" : "#4ADE80", letterSpacing: 2, marginBottom: 14 }}>
              {tipoForm === "uscita" ? "▼ NUOVA USCITA" : "▲ NUOVA ENTRATA"}
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: 2, minWidth: 160 }}>
                <div style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>DESCRIZIONE</div>
                <input className="input" style={{ width: "100%" }}
                  placeholder={tipoForm === "uscita" ? "es. Affitto, Spesa..." : "es. Stipendio, Bonus..."}
                  value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>CATEGORIA</div>
                <select className="input" style={{ width: "100%" }} value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))}>
                  {categorieCorrenti.map(c => <option key={c.nome} value={c.nome}>{c.icona} {c.nome}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>IMPORTO (€)</div>
                <input className="input" style={{ width: "100%" }} type="number" placeholder="0.00"
                  value={form.imp} onChange={e => setForm(f => ({ ...f, imp: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && salva()} />
              </div>
              <button className="btn btn-salva" onClick={salva} style={{ height: 42 }}>Salva</button>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div key={animKey} className="fade-in" style={{ padding: "24px 32px 32px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>

        {/* Entrate KPI */}
        <div className="card" style={{ padding: "24px 28px", borderTop: "3px solid #4ADE80" }}>
          <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 8 }}>ENTRATE {MESI[mese].toUpperCase()}</div>
          <div className="stat-num" style={{ color: "#4ADE80" }}>€{fmt(totEntrate)}</div>
          <div style={{ marginTop: 10, fontSize: 12, color: "#444" }}>{entrate.length} {entrate.length === 1 ? "voce" : "voci"}</div>
        </div>

        {/* Uscite KPI */}
        <div className="card" style={{ padding: "24px 28px", borderTop: "3px solid #F4845F" }}>
          <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 8 }}>USCITE {MESI[mese].toUpperCase()}</div>
          <div className="stat-num" style={{ color: "#F4845F" }}>€{fmt(totUscite)}</div>
          <div style={{ marginTop: 10, fontSize: 12, color: "#444" }}>{uscite.length} {uscite.length === 1 ? "voce" : "voci"}</div>
        </div>

        {/* Saldo KPI */}
        <div className="card" style={{ padding: "24px 28px", borderTop: `3px solid ${saldo >= 0 ? "#E8C547" : "#f87171"}` }}>
          <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 8 }}>SALDO NETTO</div>
          <div className="stat-num" style={{ color: saldo >= 0 ? "#E8C547" : "#f87171" }}>
            {saldo >= 0 ? "+" : "-"}€{fmt(Math.abs(saldo))}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: saldo >= 0 ? "#4ADE8088" : "#f8717188" }}>
            {saldo >= 0 ? "✓ In positivo" : "⚠ In negativo"}
          </div>
        </div>

        {/* Transazioni */}
        <div className="card" style={{ gridColumn: "1 / 3", padding: "24px 28px" }}>
          <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 16 }}>TRANSAZIONI</div>
          <div style={{ maxHeight: 340, overflowY: "auto", paddingRight: 4 }}>
            {entrate.length === 0 && uscite.length === 0 && (
              <div style={{ color: "#2A2A32", fontSize: 13, textAlign: "center", padding: "50px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
                Nessuna transazione per {MESI[mese]}
              </div>
            )}
            {entrate.map((s, i) => {
              const cat = CATEGORIE_ENTRATE.find(c => c.nome === s.cat) || CATEGORIE_ENTRATE[0];
              return (
                <div key={`e${i}`} className="row-t">
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#4ADE8014", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{cat.icona}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#D0CEC9" }}>{s.desc}</div>
                    <div style={{ fontSize: 11, color: "#444", marginTop: 3, display: "flex", gap: 6, alignItems: "center" }}>
                      <span className="badge badge-e">▲ entrata</span>
                      <span>{s.cat}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#4ADE80" }}>+€{fmt(s.imp)}</div>
                  <button className="del-btn" onClick={() => rimuovi("entrata", i)}>✕</button>
                </div>
              );
            })}
            {uscite.map((s, i) => {
              const cat = CATEGORIE_USCITE.find(c => c.nome === s.cat) || CATEGORIE_USCITE[0];
              return (
                <div key={`u${i}`} className="row-t">
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: cat.colore + "14", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{cat.icona}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#D0CEC9" }}>{s.desc}</div>
                    <div style={{ fontSize: 11, color: "#444", marginTop: 3, display: "flex", gap: 6, alignItems: "center" }}>
                      <span className="badge badge-u">▼ uscita</span>
                      <span>{s.cat}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: cat.colore }}>-€{fmt(s.imp)}</div>
                  <button className="del-btn" onClick={() => rimuovi("uscita", i)}>✕</button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categorie uscite */}
        <div className="card" style={{ padding: "24px 28px" }}>
          <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 16 }}>USCITE PER CATEGORIA</div>
          {perCategoria.length === 0
            ? <div style={{ color: "#2A2A32", fontSize: 12, textAlign: "center", padding: "50px 0" }}>Nessuna uscita</div>
            : <>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={perCategoria} dataKey="totale" nameKey="nome" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} stroke="none">
                    {perCategoria.map((c, i) => <Cell key={i} fill={c.colore} />)}
                  </Pie>
                  <Tooltip content={({ payload }) => payload?.[0] ? (
                    <div className="tooltip-box">
                      <div style={{ color: payload[0].payload.colore }}>{payload[0].payload.icona} {payload[0].name}</div>
                      <div style={{ color: "#E8E6E1", marginTop: 4 }}>€{payload[0].value}</div>
                    </div>
                  ) : null} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                {perCategoria.map((c, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11, color: "#666" }}>
                      <span>{c.icona} {c.nome}</span>
                      <span style={{ color: c.colore }}>{pct(c.totale)}%</span>
                    </div>
                    <div style={{ background: "#1A1A20", borderRadius: 3, height: 5 }}>
                      <div className="bar-fill" style={{ width: `${pct(c.totale)}%`, background: c.colore }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          }
        </div>

        {/* Andamento annuale */}
        <div className="card" style={{ gridColumn: "1 / 4", padding: "24px 28px" }}>
          <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 6 }}>ANDAMENTO ANNUALE</div>
          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <span style={{ fontSize: 11, color: "#4ADE80" }}>▲ Entrate</span>
            <span style={{ fontSize: 11, color: "#F4845F" }}>▼ Uscite</span>
          </div>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={dataMesi} barSize={14} barGap={3}>
              <XAxis dataKey="mese" tick={{ fill: "#444", fontSize: 11, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={({ payload, label }) => payload?.length ? (
                <div className="tooltip-box">
                  <div style={{ color: "#666", marginBottom: 6 }}>{label}</div>
                  <div style={{ color: "#4ADE80" }}>▲ €{payload[0]?.value?.toLocaleString("it-IT") || 0}</div>
                  <div style={{ color: "#F4845F" }}>▼ €{payload[1]?.value?.toLocaleString("it-IT") || 0}</div>
                </div>
              ) : null} />
              <Bar dataKey="entrate" radius={[4, 4, 0, 0]}>
                {dataMesi.map((_, i) => <Cell key={i} fill={i === mese ? "#4ADE80" : "#1A2E22"} />)}
              </Bar>
              <Bar dataKey="uscite" radius={[4, 4, 0, 0]}>
                {dataMesi.map((_, i) => <Cell key={i} fill={i === mese ? "#F4845F" : "#2E1A16"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
