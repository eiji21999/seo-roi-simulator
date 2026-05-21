import React, { useMemo, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const initialMeasures = [
  {
    id: 1,
    name: "SEO",
    sessions: "5000",
    cvr: "1.2",
    cost: "200000",
    revenuePerCv: "300000",
  },
  {
    id: 2,
    name: "Google広告",
    sessions: "3000",
    cvr: "2.5",
    cost: "500000",
    revenuePerCv: "300000",
  },
  {
    id: 3,
    name: "SNS広告",
    sessions: "4000",
    cvr: "0.8",
    cost: "300000",
    revenuePerCv: "300000",
  },
];

export default function App() {
  const [measures, setMeasures] = useState(initialMeasures);
  const [roundNumbers, setRoundNumbers] = useState(true);

  const toNumber = (value) => Number(String(value).replace(/,/g, "")) || 0;

  const yen = (value) =>
    new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

  const comma = (value) =>
    new Intl.NumberFormat("ja-JP", {
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  const sanitizeNumber = (value) => {
    const raw = String(value).replace(/,/g, "");
    const cleaned = raw.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length <= 2) return cleaned;
    return parts[0] + "." + parts.slice(1).join("");
  };

  const updateMeasure = (id, key, value) => {
    setMeasures((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [key]: key === "name" ? value : sanitizeNumber(value),
            }
          : item
      )
    );
  };

  const addMeasure = () => {
    const nextId = Math.max(...measures.map((item) => item.id), 0) + 1;
    setMeasures((prev) => [
      ...prev,
      {
        id: nextId,
        name: "新規施策",
        sessions: "0",
        cvr: "0",
        cost: "0",
        revenuePerCv: "0",
      },
    ]);
  };

  const removeMeasure = (id) => {
    setMeasures((prev) => prev.filter((item) => item.id !== id));
  };

  const results = useMemo(() => {
    return measures.map((item) => {
      const sessions = toNumber(item.sessions);
      const cvr = toNumber(item.cvr);
      const cost = toNumber(item.cost);
      const revenuePerCv = toNumber(item.revenuePerCv);
      const rawCv = sessions * (cvr / 100);
      const cv = roundNumbers ? Math.round(rawCv) : Number(rawCv.toFixed(2));
      const revenue = cv * revenuePerCv;
      const profit = revenue - cost;
      const cpa = cv > 0 ? cost / cv : 0;
      const roi = cost > 0 ? ((revenue - cost) / cost) * 100 : 0;
      const roas = cost > 0 ? (revenue / cost) * 100 : 0;

      return {
        ...item,
        sessions,
        cvr,
        cost,
        revenuePerCv,
        cv,
        revenue,
        profit,
        cpa,
        roi,
        roas,
      };
    });
  }, [measures, roundNumbers]);

  const bestRoi = useMemo(() => {
    return [...results].sort((a, b) => b.roi - a.roi)[0];
  }, [results]);

  const bestCv = useMemo(() => {
    return [...results].sort((a, b) => b.cv - a.cv)[0];
  }, [results]);

  const bestCpa = useMemo(() => {
    return [...results]
      .filter((item) => item.cv > 0)
      .sort((a, b) => a.cpa - b.cpa)[0];
  }, [results]);

  const totalCost = results.reduce((sum, item) => sum + item.cost, 0);
  const totalRevenue = results.reduce((sum, item) => sum + item.revenue, 0);
  const totalProfit = totalRevenue - totalCost;
  const totalCv = results.reduce((sum, item) => sum + item.cv, 0);
  const totalRoi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;

  const downloadPdf = () => {
    window.print();
  };

  const reset = () => {
    setMeasures(initialMeasures);
    setRoundNumbers(true);
  };

  return (
    <main style={styles.page}>
      <style>{printAndResponsiveCss}</style>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <p style={styles.sub}>Web Marketing ROI Tool</p>
            <h1 style={styles.title}>Webマーケティング施策比較ROIシミュレーター</h1>
            <p style={styles.text}>
              SEO、広告、SNSなど複数施策のCVR・CV数・CPA・ROIを比較し、費用対効果の高い施策を見極めます。
            </p>
          </div>
          <div style={styles.actionArea} className="no-print">
            <button onClick={downloadPdf} style={styles.primaryButton}>PDF出力</button>
            <button onClick={reset} style={styles.button}>初期値に戻す</button>
          </div>
        </header>

        <section style={styles.summaryGrid}>
          <Summary title="合計CV数" value={roundNumbers ? Math.round(totalCv) + "件" : comma(totalCv) + "件"} />
          <Summary title="合計費用" value={yen(totalCost)} />
          <Summary title="合計売上" value={yen(totalRevenue)} />
          <Summary title="合計ROI" value={totalRoi.toFixed(1) + "%"} negative={totalRoi < 0} />
        </section>

        <section style={styles.insightGrid}>
          <InsightCard
            title="ROIが最も高い施策"
            name={bestRoi?.name || "-"}
            detail={bestRoi ? `ROI ${bestRoi.roi.toFixed(1)}% / 利益 ${yen(bestRoi.profit)}` : "-"}
          />
          <InsightCard
            title="CV数が最も多い施策"
            name={bestCv?.name || "-"}
            detail={bestCv ? `${roundNumbers ? Math.round(bestCv.cv) : comma(bestCv.cv)}件 / CVR ${bestCv.cvr}%` : "-"}
          />
          <InsightCard
            title="CPAが最も低い施策"
            name={bestCpa?.name || "-"}
            detail={bestCpa ? `CPA ${yen(bestCpa.cpa)} / 費用 ${yen(bestCpa.cost)}` : "CVがある施策なし"}
          />
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>施策別入力</h2>
              <p style={styles.smallText}>流入数・CVR・費用・1CVあたり売上を入力してください。</p>
            </div>
            <div style={styles.optionArea} className="no-print">
              <label style={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={roundNumbers}
                  onChange={(e) => setRoundNumbers(e.target.checked)}
                />
                <span>CV数を四捨五入</span>
              </label>
              <button onClick={addMeasure} style={styles.button}>施策を追加</button>
            </div>
          </div>

          <div style={styles.inputList}>
            {measures.map((item) => (
              <div key={item.id} style={styles.measureBox}>
                <div style={styles.measureHeader}>
                  <input
                    value={item.name}
                    onChange={(e) => updateMeasure(item.id, "name", e.target.value)}
                    style={styles.measureNameInput}
                  />
                  {measures.length > 1 && (
                    <button onClick={() => removeMeasure(item.id)} style={styles.deleteButton} className="no-print">
                      削除
                    </button>
                  )}
                </div>

                <div style={styles.fieldGrid}>
                  <Field label="流入数" value={item.sessions} onChange={(value) => updateMeasure(item.id, "sessions", value)} suffix="PV" />
                  <Field label="CVR" value={item.cvr} onChange={(value) => updateMeasure(item.id, "cvr", value)} suffix="%" />
                  <Field label="施策費用" value={item.cost} onChange={(value) => updateMeasure(item.id, "cost", value)} suffix="円" />
                  <Field label="1CVあたり売上" value={item.revenuePerCv} onChange={(value) => updateMeasure(item.id, "revenuePerCv", value)} suffix="円" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>施策比較結果</h2>
          <div style={styles.tableScroll}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <Th>施策</Th>
                  <Th>流入数</Th>
                  <Th>CVR</Th>
                  <Th>CV数</Th>
                  <Th>費用</Th>
                  <Th>CPA</Th>
                  <Th>売上</Th>
                  <Th>利益</Th>
                  <Th>ROI</Th>
                  <Th>ROAS</Th>
                </tr>
              </thead>
              <tbody>
                {results
                  .slice()
                  .sort((a, b) => b.roi - a.roi)
                  .map((item, index) => (
                    <tr key={item.id} style={index === 0 ? styles.bestRow : undefined}>
                      <Td strong>{item.name}</Td>
                      <Td>{comma(item.sessions)}</Td>
                      <Td>{item.cvr}%</Td>
                      <Td>{roundNumbers ? Math.round(item.cv) : comma(item.cv)}</Td>
                      <Td>{yen(item.cost)}</Td>
                      <Td>{yen(item.cpa)}</Td>
                      <Td>{yen(item.revenue)}</Td>
                      <Td negative={item.profit < 0}>{yen(item.profit)}</Td>
                      <Td negative={item.roi < 0}>{item.roi.toFixed(1)}%</Td>
                      <Td>{item.roas.toFixed(1)}%</Td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p style={styles.note}>※ 表はROIが高い順に並びます。1行目が費用対効果の最も高い施策です。</p>
        </section>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, suffix = "" }) {
  const sanitizeNumber = (inputValue) => {
    const raw = String(inputValue).replace(/,/g, "");
    const cleaned = raw.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length <= 2) return cleaned;
    return parts[0] + "." + parts.slice(1).join("");
  };

  const handleFocus = () => {
    if (value === "0") onChange("");
  };

  const handleBlur = () => {
    if (value === "") onChange("0");
  };

  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      <div style={styles.inputRow}>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(sanitizeNumber(e.target.value))}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={styles.input}
        />
        <span style={styles.suffix}>{suffix}</span>
      </div>
    </label>
  );
}

function Summary({ title, value, negative = false }) {
  return (
    <div style={styles.summaryCard}>
      <p style={styles.summaryTitle}>{title}</p>
      <p style={{ ...styles.summaryValue, ...(negative ? styles.negativeText : {}) }}>{value}</p>
    </div>
  );
}

function InsightCard({ title, name, detail }) {
  return (
    <div style={styles.insightCard}>
      <p style={styles.summaryTitle}>{title}</p>
      <p style={styles.insightName}>{name}</p>
      <p style={styles.insightDetail}>{detail}</p>
    </div>
  );
}

function Th({ children }) {
  return <th style={styles.th}>{children}</th>;
}

function Td({ children, negative = false, strong = false }) {
  return (
    <td style={{ ...styles.td, ...(negative ? styles.negativeText : {}), fontWeight: strong ? 800 : undefined }}>
      {children}
    </td>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f6f7fb",
    color: "#0f172a",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans", Meiryo, sans-serif',
    padding: "32px 16px",
  },
  container: { maxWidth: "1200px", margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 24 },
  sub: { margin: 0, color: "#64748b", fontWeight: 700 },
  title: { margin: "8px 0", fontSize: "clamp(30px, 5vw, 42px)", lineHeight: 1.2 },
  text: { margin: 0, color: "#64748b", lineHeight: 1.7, maxWidth: 760 },
  actionArea: { display: "flex", gap: 10, flexWrap: "wrap" },
  button: { border: "1px solid #cbd5e1", background: "white", borderRadius: 12, padding: "12px 18px", cursor: "pointer", fontWeight: 700 },
  primaryButton: { border: "1px solid #0f172a", background: "#0f172a", color: "white", borderRadius: 12, padding: "12px 18px", cursor: "pointer", fontWeight: 700 },
  deleteButton: { border: "1px solid #fecaca", background: "#fff1f2", color: "#9f1239", borderRadius: 10, padding: "8px 12px", cursor: "pointer", fontWeight: 700 },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 18 },
  summaryCard: { background: "white", borderRadius: 20, padding: 22, boxShadow: "0 10px 30px rgba(15, 23, 42, 0.07)" },
  summaryTitle: { margin: 0, color: "#64748b", fontWeight: 700, fontSize: 14 },
  summaryValue: { margin: "10px 0 0", fontSize: "clamp(22px, 5vw, 28px)", fontWeight: 800 },
  insightGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 24 },
  insightCard: { background: "#0f172a", color: "white", borderRadius: 20, padding: 22, boxShadow: "0 10px 30px rgba(15, 23, 42, 0.1)" },
  insightName: { margin: "10px 0 6px", fontSize: 24, fontWeight: 900 },
  insightDetail: { margin: 0, color: "#cbd5e1", lineHeight: 1.6 },
  negativeText: { color: "#9f1239", fontWeight: 800 },
  card: { background: "white", borderRadius: 20, padding: 24, boxShadow: "0 10px 30px rgba(15, 23, 42, 0.07)", marginBottom: 24, overflowX: "auto" },
  cardHeader: { display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start", marginBottom: 18 },
  cardTitle: { margin: "0 0 8px", fontSize: 22 },
  smallText: { margin: 0, color: "#64748b", lineHeight: 1.6 },
  optionArea: { display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" },
  checkboxRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#475569", cursor: "pointer" },
  inputList: { display: "grid", gap: 16 },
  measureBox: { border: "1px solid #e2e8f0", borderRadius: 18, padding: 18, background: "#fbfdff" },
  measureHeader: { display: "flex", gap: 12, justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  measureNameInput: { width: "100%", border: "1px solid #cbd5e1", borderRadius: 12, padding: "12px 12px", fontSize: 18, fontWeight: 800, boxSizing: "border-box" },
  fieldGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 },
  field: { display: "grid", gap: 8 },
  label: { color: "#475569", fontSize: 14, fontWeight: 700 },
  inputRow: { display: "flex", gap: 8, alignItems: "center" },
  input: { width: "100%", border: "1px solid #cbd5e1", borderRadius: 12, padding: "12px 12px", fontSize: 16, boxSizing: "border-box" },
  suffix: { width: 36, color: "#64748b", fontSize: 14 },
  tableScroll: { width: "100%", overflowX: "auto" },
  table: { width: "100%", minWidth: 980, borderCollapse: "collapse", fontSize: 14 },
  th: { textAlign: "left", color: "#64748b", borderBottom: "1px solid #e2e8f0", padding: 12, whiteSpace: "nowrap" },
  td: { borderBottom: "1px solid #e2e8f0", padding: 12, whiteSpace: "nowrap" },
  bestRow: { background: "#f0fdf4" },
  note: { margin: "14px 0 0", color: "#64748b", fontSize: 13 },
};

const printAndResponsiveCss = `
  * {
    box-sizing: border-box;
  }

  @media (max-width: 768px) {
    main {
      padding: 20px 12px !important;
    }

    button {
      width: 100%;
    }
  }

  @media print {
    body {
      background: #ffffff !important;
    }

    main {
      background: #ffffff !important;
      padding: 0 !important;
    }

    .no-print {
      display: none !important;
    }

    div {
      box-shadow: none !important;
    }

    table {
      font-size: 10px !important;
    }
  }
`;
