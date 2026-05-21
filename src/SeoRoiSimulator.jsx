import React, { useMemo, useState } from "react";

export default function App() {
  const [monthlyPv, setMonthlyPv] = useState("0");
  const [monthlyPvIncrease, setMonthlyPvIncrease] = useState("0");
  const [inquiryRate, setInquiryRate] = useState("0");
  const [closeRate, setCloseRate] = useState("0");
  const [monthlyRevenuePerContract, setMonthlyRevenuePerContract] = useState("0");
  const [initialCost, setInitialCost] = useState("0");
  const [monthlyContentCost, setMonthlyContentCost] = useState("0");
  const [months, setMonths] = useState(12);
  const [roundNumbers, setRoundNumbers] = useState(false);

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

  const toNumber = (value) => Number(String(value).replace(/,/g, "")) || 0;

  const sanitizeNumber = (value) => {
    const raw = String(value).replace(/,/g, "");
    const cleaned = raw.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length <= 2) return cleaned;
    return parts[0] + "." + parts.slice(1).join("");
  };

  const formatNumberText = (value) => {
    const raw = sanitizeNumber(value);
    if (raw === "") return "0";
    if (raw === ".") return "0";

    const parts = raw.split(".");
    const integerPart = parts[0] || "0";
    const decimalPart = parts[1];
    const formattedInteger = new Intl.NumberFormat("ja-JP").format(Number(integerPart) || 0);

    return decimalPart !== undefined ? formattedInteger + "." + decimalPart : formattedInteger;
  };

  const displayCount = (value) => {
    return roundNumbers ? Math.round(Number(value) || 0) : comma(value);
  };

  const data = useMemo(() => {
    let cumulativeCost = toNumber(initialCost);
    let cumulativeRevenue = 0;
    let activeContractsRaw = 0;

    return Array.from({ length: months }, (_, i) => {
      const month = i + 1;
      const pv = toNumber(monthlyPv) + toNumber(monthlyPvIncrease) * month;

      const inquiriesRaw = pv * (toNumber(inquiryRate) / 100);
      const inquiriesForDisplay = roundNumbers
        ? Math.round(inquiriesRaw)
        : Number(inquiriesRaw.toFixed(1));

      const newContractsRaw = inquiriesRaw * (toNumber(closeRate) / 100);
      activeContractsRaw += newContractsRaw;

      const newContractsForDisplay = roundNumbers
        ? Math.round(newContractsRaw)
        : Number(newContractsRaw.toFixed(2));

      const activeContractsForDisplay = roundNumbers
        ? Math.round(activeContractsRaw)
        : Number(activeContractsRaw.toFixed(2));

      const contractBaseForRevenue = roundNumbers
        ? Math.round(activeContractsRaw)
        : activeContractsRaw;

      const monthlyRevenue = contractBaseForRevenue * toNumber(monthlyRevenuePerContract);
      cumulativeRevenue += monthlyRevenue;
      cumulativeCost += toNumber(monthlyContentCost);
      const cumulativeProfit = cumulativeRevenue - cumulativeCost;

      return {
        month: month + "月目",
        pv: Math.round(pv),
        inquiries: inquiriesForDisplay,
        newContracts: newContractsForDisplay,
        activeContracts: activeContractsForDisplay,
        monthlyRevenue: Math.round(monthlyRevenue),
        cumulativeCost: Math.round(cumulativeCost),
        cumulativeRevenue: Math.round(cumulativeRevenue),
        cumulativeProfit: Math.round(cumulativeProfit),
      };
    });
  }, [
    monthlyPv,
    monthlyPvIncrease,
    inquiryRate,
    closeRate,
    monthlyRevenuePerContract,
    initialCost,
    monthlyContentCost,
    months,
    roundNumbers,
  ]);

  const last = data[data.length - 1];
  const paybackMonth = data.find((item) => item.cumulativeProfit >= 0)?.month || "未回収";
  const roi = last && last.cumulativeCost !== 0
    ? ((last.cumulativeRevenue - last.cumulativeCost) / last.cumulativeCost) * 100
    : 0;

  const reset = () => {
    setMonthlyPv("0");
    setMonthlyPvIncrease("0");
    setInquiryRate("0");
    setCloseRate("0");
    setMonthlyRevenuePerContract("0");
    setInitialCost("0");
    setMonthlyContentCost("0");
    setMonths(12);
    setRoundNumbers(false);
  };

  const downloadPdf = () => {
    window.print();
  };

  return (
    <main style={styles.page}>
      <style>{printAndResponsiveCss}</style>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <p style={styles.sub}>Business Improvement Tool</p>
            <h1 style={styles.title}>SEO ROI シミュレーター</h1>
            <p style={styles.text}>PV・問い合わせ率・契約率・費用を入力して、投資回収の見込みを試算します。</p>
          </div>
          <div style={styles.actionArea} className="no-print">
            <button onClick={downloadPdf} style={styles.primaryButton}>PDF出力</button>
            <button onClick={reset} style={styles.button}>初期値に戻す</button>
          </div>
        </header>

        <section style={styles.summaryGrid}>
          <Summary title="累計利益" value={yen(last?.cumulativeProfit)} negative={last?.cumulativeProfit < 0} />
          <Summary title="ROI" value={roi.toFixed(1) + "%"} negative={roi < 0} />
          <Summary title="回収月" value={paybackMonth} />
          <Summary title="累計契約数" value={displayCount(last?.activeContracts) + "件"} />
        </section>

        <section style={styles.layout} className="main-layout">
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>入力条件</h2>
            <Field label="現在の月間PV" value={monthlyPv} onChange={setMonthlyPv} suffix="PV" sanitizeNumber={sanitizeNumber} formatNumberText={formatNumberText} />
            <Field label="毎月のPV増加見込み" value={monthlyPvIncrease} onChange={setMonthlyPvIncrease} suffix="PV" sanitizeNumber={sanitizeNumber} formatNumberText={formatNumberText} />
            <Field label="問い合わせ率" value={inquiryRate} onChange={setInquiryRate} suffix="%" sanitizeNumber={sanitizeNumber} formatNumberText={formatNumberText} />
            <Field label="契約率" value={closeRate} onChange={setCloseRate} suffix="%" sanitizeNumber={sanitizeNumber} formatNumberText={formatNumberText} />
            <Field label="1契約あたり月額売上" value={monthlyRevenuePerContract} onChange={setMonthlyRevenuePerContract} suffix="円" sanitizeNumber={sanitizeNumber} formatNumberText={formatNumberText} />
            <Field label="初期制作費" value={initialCost} onChange={setInitialCost} suffix="円" sanitizeNumber={sanitizeNumber} formatNumberText={formatNumberText} />
            <Field label="月額運用・記事費用" value={monthlyContentCost} onChange={setMonthlyContentCost} suffix="円" sanitizeNumber={sanitizeNumber} formatNumberText={formatNumberText} />

            <label style={styles.field}>
              <span style={styles.label}>試算期間：{months}ヶ月</span>
              <input type="range" min="3" max="36" value={months} onChange={(e) => setMonths(Number(e.target.value))} style={styles.range} />
            </label>

            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={roundNumbers}
                onChange={(e) => setRoundNumbers(e.target.checked)}
              />
              <span>問い合わせ数・契約件数を四捨五入表示し、売上・利益にも反映</span>
            </label>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>試算結果</h2>
            <p style={styles.resultLead}>
              {months}ヶ月後の累計利益は <strong style={last?.cumulativeProfit < 0 ? styles.negativeText : undefined}>{yen(last?.cumulativeProfit)}</strong>、ROIは <strong style={roi < 0 ? styles.negativeText : undefined}>{roi.toFixed(1)}%</strong>、回収月は <strong>{paybackMonth}</strong> です。
            </p>
            <div style={styles.tableScroll}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <Th>月</Th>
                    <Th>PV</Th>
                    <Th>問い合わせ</Th>
                    <Th>新規契約</Th>
                    <Th>累計契約</Th>
                    <Th>月間売上</Th>
                    <Th>累計費用</Th>
                    <Th>累計利益</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.month}>
                      <Td>{item.month}</Td>
                      <Td>{comma(item.pv)}</Td>
                      <Td>{displayCount(item.inquiries)}</Td>
                      <Td>{displayCount(item.newContracts)}</Td>
                      <Td>{displayCount(item.activeContracts)}</Td>
                      <Td>{yen(item.monthlyRevenue)}</Td>
                      <Td>{yen(item.cumulativeCost)}</Td>
                      <Td negative={item.cumulativeProfit < 0}>{yen(item.cumulativeProfit)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, suffix = "", sanitizeNumber, formatNumberText }) {
  const handleChange = (event) => {
    onChange(sanitizeNumber(event.target.value));
  };

  const handleFocus = () => {
    const raw = sanitizeNumber(value);
    onChange(raw === "0" ? "" : raw);
  };

  const handleBlur = () => {
    onChange(formatNumberText(value));
  };

  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      <div style={styles.inputRow}>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
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

function Th({ children }) {
  return <th style={styles.th}>{children}</th>;
}

function Td({ children, negative = false }) {
  return <td style={{ ...styles.td, ...(negative ? styles.negativeText : {}) }}>{children}</td>;
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f6f7fb",
    color: "#0f172a",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans", Meiryo, sans-serif',
    padding: "32px 16px",
  },
  container: { maxWidth: "1180px", margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 24 },
  sub: { margin: 0, color: "#64748b", fontWeight: 700 },
  title: { margin: "8px 0", fontSize: "clamp(30px, 5vw, 40px)", lineHeight: 1.2 },
  text: { margin: 0, color: "#64748b", lineHeight: 1.7 },
  actionArea: { display: "flex", gap: 10, flexWrap: "wrap" },
  button: { border: "1px solid #cbd5e1", background: "white", borderRadius: 12, padding: "12px 18px", cursor: "pointer", fontWeight: 700 },
  primaryButton: { border: "1px solid #0f172a", background: "#0f172a", color: "white", borderRadius: 12, padding: "12px 18px", cursor: "pointer", fontWeight: 700 },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 },
  summaryCard: { background: "white", borderRadius: 20, padding: 22, boxShadow: "0 10px 30px rgba(15, 23, 42, 0.07)" },
  summaryTitle: { margin: 0, color: "#64748b", fontWeight: 700 },
  summaryValue: { margin: "10px 0 0", fontSize: "clamp(22px, 5vw, 28px)", fontWeight: 800 },
  negativeText: { color: "#9f1239", fontWeight: 800 },
  layout: { display: "grid", gridTemplateColumns: "340px 1fr", gap: 24, alignItems: "start" },
  card: { background: "white", borderRadius: 20, padding: 24, boxShadow: "0 10px 30px rgba(15, 23, 42, 0.07)", overflowX: "auto" },
  cardTitle: { margin: "0 0 18px", fontSize: 22 },
  resultLead: { margin: "0 0 18px", lineHeight: 1.8, color: "#334155" },
  field: { display: "grid", gap: 8, marginBottom: 14 },
  label: { color: "#475569", fontSize: 14, fontWeight: 700 },
  inputRow: { display: "flex", gap: 8, alignItems: "center" },
  input: { width: "100%", border: "1px solid #cbd5e1", borderRadius: 12, padding: "12px 12px", fontSize: 16, boxSizing: "border-box" },
  suffix: { width: 36, color: "#64748b", fontSize: 14 },
  range: { width: "100%" },
  checkboxRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 14, color: "#475569", cursor: "pointer" },
  tableScroll: { width: "100%", overflowX: "auto" },
  table: { width: "100%", minWidth: 760, borderCollapse: "collapse", fontSize: 14 },
  th: { textAlign: "left", color: "#64748b", borderBottom: "1px solid #e2e8f0", padding: 12, whiteSpace: "nowrap" },
  td: { borderBottom: "1px solid #e2e8f0", padding: 12, whiteSpace: "nowrap" },
};

const printAndResponsiveCss = `
  * {
    box-sizing: border-box;
  }

  @media (max-width: 768px) {
    main {
      padding: 20px 12px !important;
    }

    .main-layout {
      grid-template-columns: 1fr !important;
    }

    header {
      align-items: flex-start !important;
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
      font-size: 11px !important;
    }
  }
`;
