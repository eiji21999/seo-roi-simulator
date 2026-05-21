import React, { useMemo, useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const BLUE = "#1d4ed8";
const COLORS = ["#1d4ed8", "#2563eb", "#38bdf8", "#0f172a", "#64748b"];

const initialInfluencers = [
  {
    id: 1,
    name: "インフルエンサーA",
    sns: "Instagram",
    followers: 50000,
    views: 20000,
    engagementRate: 3,
    cost: 150000,
    cvr: 1,
    averageOrderValue: 30000,
  },
  {
    id: 2,
    name: "インフルエンサーB",
    sns: "TikTok",
    followers: 120000,
    views: 50000,
    engagementRate: 5,
    cost: 250000,
    cvr: 0.8,
    averageOrderValue: 30000,
  },
];

const formatYen = (num) =>
  new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(num || 0);

const formatNumber = (num) =>
  new Intl.NumberFormat("ja-JP").format(Math.round(num || 0));

export default function InfluencerComparisonSimulator() {
  const [influencers, setInfluencers] = useState(initialInfluencers);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get("data");

    if (data) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(data)));
        if (Array.isArray(decoded)) setInfluencers(decoded);
      } catch {
        console.log("URLデータの復元に失敗しました");
      }
    }
  }, []);

  const calculated = useMemo(() => {
    return influencers.map((item) => {
      const conversions = item.views * (item.cvr / 100);
      const sales = conversions * item.averageOrderValue;
      const profit = sales - item.cost;
      const roi = item.cost > 0 ? (profit / item.cost) * 100 : 0;
      const cpa = conversions > 0 ? item.cost / conversions : 0;
      const engagement = item.views * (item.engagementRate / 100);

      let rank = "C";
      if (roi >= 100 && cpa <= item.averageOrderValue * 0.4) rank = "A";
      else if (roi >= 0) rank = "B";

      return {
        ...item,
        conversions,
        sales,
        profit,
        roi,
        cpa,
        engagement,
        rank,
      };
    });
  }, [influencers]);

  const summary = useMemo(() => {
    const totalSales = calculated.reduce((sum, item) => sum + item.sales, 0);
    const totalProfit = calculated.reduce((sum, item) => sum + item.profit, 0);
    const totalCost = calculated.reduce((sum, item) => sum + item.cost, 0);

    const averageROI =
      calculated.length > 0
        ? calculated.reduce((sum, item) => sum + item.roi, 0) /
          calculated.length
        : 0;

    const averageCPA =
      calculated.length > 0
        ? calculated.reduce((sum, item) => sum + item.cpa, 0) /
          calculated.length
        : 0;

    return { totalSales, totalProfit, totalCost, averageROI, averageCPA };
  }, [calculated]);

  const bestInfluencer = useMemo(() => {
    if (calculated.length === 0) return null;
    return [...calculated].sort((a, b) => b.roi - a.roi)[0];
  }, [calculated]);

  const pieData = calculated.map((item) => ({
    name: item.name,
    value: item.cost,
  }));

  const updateInfluencer = (id, key, value) => {
    setInfluencers((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [key]: key === "name" || key === "sns" ? value : Number(value),
            }
          : item
      )
    );
  };

  const addInfluencer = () => {
    setInfluencers((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: `インフルエンサー${prev.length + 1}`,
        sns: "Instagram",
        followers: 10000,
        views: 5000,
        engagementRate: 3,
        cost: 100000,
        cvr: 1,
        averageOrderValue: 30000,
      },
    ]);
  };

  const deleteInfluencer = (id) => {
    setInfluencers((prev) => prev.filter((item) => item.id !== id));
  };

  const exportCSV = () => {
    const header = [
      "名前",
      "SNS",
      "フォロワー数",
      "平均再生数",
      "エンゲージメント率",
      "費用",
      "CVR",
      "客単価",
      "CV数",
      "売上",
      "利益",
      "CPA",
      "ROI",
      "判定",
    ];

    const rows = calculated.map((item) => [
      item.name,
      item.sns,
      item.followers,
      item.views,
      item.engagementRate,
      item.cost,
      item.cvr,
      item.averageOrderValue,
      item.conversions.toFixed(1),
      Math.round(item.sales),
      Math.round(item.profit),
      Math.round(item.cpa),
      item.roi.toFixed(1),
      item.rank,
    ]);

    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "influencer-roi-simulation.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split(/\r?\n/).filter(Boolean);
      const body = lines.slice(1);

      const imported = body.map((line, index) => {
        const cols = line.split(",");

        return {
          id: Date.now() + index,
          name: cols[0] || `インフルエンサー${index + 1}`,
          sns: cols[1] || "Instagram",
          followers: Number(cols[2]) || 0,
          views: Number(cols[3]) || 0,
          engagementRate: Number(cols[4]) || 0,
          cost: Number(cols[5]) || 0,
          cvr: Number(cols[6]) || 0,
          averageOrderValue: Number(cols[7]) || 0,
        };
      });

      setInfluencers(imported);
    };

    reader.readAsText(file);
  };

  const shareURL = async () => {
    const encoded = btoa(encodeURIComponent(JSON.stringify(influencers)));
    const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const printPDF = () => {
    window.print();
  };

  const aiComments = useMemo(() => {
    if (!bestInfluencer) return [];

    const worstCpa = [...calculated].sort((a, b) => b.cpa - a.cpa)[0];
    const bestCpa = [...calculated].sort((a, b) => a.cpa - b.cpa)[0];
    const highCost = [...calculated].sort((a, b) => b.cost - a.cost)[0];

    return [
      `現時点では「${bestInfluencer.name}」が最もROIが高い候補です。`,
      `CPA効率では「${bestCpa.name}」が優秀です。`,
      `「${highCost.name}」は費用が最も高いため、実施前に想定CVRの妥当性確認がおすすめです。`,
      worstCpa?.roi < 0
        ? `「${worstCpa.name}」は利益がマイナスになる可能性があるため、費用交渉または見送り候補です。`
        : `全体として、費用・再生数・CVRのバランスを見ながら選定するのが安全です。`,
    ];
  }, [calculated, bestInfluencer]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Influencer ROI Simulator</h1>
          <p style={styles.subtitle}>
            SNSインフルエンサー施策の費用対効果を比較できます。
          </p>
        </div>

        <div style={styles.actions}>
          <label style={styles.secondaryButton}>
            CSV読込
            <input
              type="file"
              accept=".csv"
              onChange={importCSV}
              style={{ display: "none" }}
            />
          </label>
          <button style={styles.secondaryButton} onClick={exportCSV}>
            CSV出力
          </button>
          <button style={styles.secondaryButton} onClick={printPDF}>
            PDF保存
          </button>
          <button style={styles.primaryButton} onClick={shareURL}>
            {copied ? "コピー済み" : "URL共有"}
          </button>
        </div>
      </div>

      <div style={styles.kpiGrid}>
        <Kpi title="総売上" value={formatYen(summary.totalSales)} />
        <Kpi
          title="総利益"
          value={formatYen(summary.totalProfit)}
          danger={summary.totalProfit < 0}
        />
        <Kpi title="平均ROI" value={`${summary.averageROI.toFixed(1)}%`} />
        <Kpi title="平均CPA" value={formatYen(summary.averageCPA)} />
      </div>

      {bestInfluencer && (
        <div style={styles.bestCard}>
          <div>
            <p style={styles.label}>おすすめ候補</p>
            <h2 style={styles.bestName}>{bestInfluencer.name}</h2>
            <p style={styles.bestText}>
              ROIが最も高く、想定利益は {formatYen(bestInfluencer.profit)}{" "}
              です。
            </p>
          </div>
          <div style={styles.rankBadge}>Rank {bestInfluencer.rank}</div>
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.sectionTitle}>インフルエンサー入力</h2>
          <button style={styles.primaryButton} onClick={addInfluencer}>
            ＋ 追加
          </button>
        </div>

        <div style={styles.inputGrid}>
          {influencers.map((item) => (
            <div key={item.id} style={styles.inputCard}>
              <div style={styles.inputCardHeader}>
                <input
                  style={styles.nameInput}
                  value={item.name}
                  onChange={(e) =>
                    updateInfluencer(item.id, "name", e.target.value)
                  }
                />
                <button
                  style={styles.deleteButton}
                  onClick={() => deleteInfluencer(item.id)}
                >
                  削除
                </button>
              </div>

              <Field label="SNS">
                <select
                  style={styles.input}
                  value={item.sns}
                  onChange={(e) =>
                    updateInfluencer(item.id, "sns", e.target.value)
                  }
                >
                  <option>Instagram</option>
                  <option>TikTok</option>
                  <option>YouTube</option>
                  <option>X</option>
                </select>
              </Field>

              <Field label="フォロワー数">
                <input
                  style={styles.input}
                  type="number"
                  value={item.followers}
                  onChange={(e) =>
                    updateInfluencer(item.id, "followers", e.target.value)
                  }
                />
              </Field>

              <Field label="平均再生数 / 表示回数">
                <input
                  style={styles.input}
                  type="number"
                  value={item.views}
                  onChange={(e) =>
                    updateInfluencer(item.id, "views", e.target.value)
                  }
                />
              </Field>

              <Field label="エンゲージメント率（%）">
                <input
                  style={styles.input}
                  type="number"
                  value={item.engagementRate}
                  onChange={(e) =>
                    updateInfluencer(
                      item.id,
                      "engagementRate",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="投稿費用（円）">
                <input
                  style={styles.input}
                  type="number"
                  value={item.cost}
                  onChange={(e) =>
                    updateInfluencer(item.id, "cost", e.target.value)
                  }
                />
              </Field>

              <Field label="想定CVR（%）">
                <input
                  style={styles.input}
                  type="number"
                  value={item.cvr}
                  onChange={(e) =>
                    updateInfluencer(item.id, "cvr", e.target.value)
                  }
                />
              </Field>

              <Field label="客単価（円）">
                <input
                  style={styles.input}
                  type="number"
                  value={item.averageOrderValue}
                  onChange={(e) =>
                    updateInfluencer(
                      item.id,
                      "averageOrderValue",
                      e.target.value
                    )
                  }
                />
              </Field>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.twoColumn}>
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>ROI比較グラフ</h2>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={calculated}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="roi" fill={BLUE} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>費用割合</h2>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={105}
                  label
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatYen(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>比較表</h2>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {[
                  "名前",
                  "SNS",
                  "再生数",
                  "費用",
                  "CV数",
                  "売上",
                  "利益",
                  "CPA",
                  "ROI",
                  "判定",
                ].map((head) => (
                  <th key={head} style={styles.th}>
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {calculated.map((item) => (
                <tr key={item.id}>
                  <td style={styles.td}>{item.name}</td>
                  <td style={styles.td}>{item.sns}</td>
                  <td style={styles.td}>{formatNumber(item.views)}</td>
                  <td style={styles.td}>{formatYen(item.cost)}</td>
                  <td style={styles.td}>{formatNumber(item.conversions)}</td>
                  <td style={styles.td}>{formatYen(item.sales)}</td>
                  <td
                    style={{
                      ...styles.td,
                      color: item.profit < 0 ? "#991b1b" : "#0f172a",
                      fontWeight: 700,
                    }}
                  >
                    {formatYen(item.profit)}
                  </td>
                  <td style={styles.td}>{formatYen(item.cpa)}</td>
                  <td style={styles.td}>{item.roi.toFixed(1)}%</td>
                  <td style={styles.td}>
                    <span style={styles.smallBadge}>Rank {item.rank}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>AI分析コメント</h2>
        <ul style={styles.commentList}>
          {aiComments.map((comment, index) => (
            <li key={index}>{comment}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Kpi({ title, value, danger }) {
  return (
    <div style={styles.kpiCard}>
      <p style={styles.kpiLabel}>{title}</p>
      <h2
        style={{
          ...styles.kpiValue,
          color: danger ? "#991b1b" : "#0f172a",
        }}
      >
        {value}
      </h2>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f6fb",
    padding: "28px",
    color: "#0f172a",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  header: {
    marginBottom: "24px",
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  title: {
    fontSize: "30px",
    fontWeight: 800,
    margin: 0,
  },
  subtitle: {
    color: "#64748b",
    marginTop: "8px",
  },
  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  primaryButton: {
    background: BLUE,
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "10px 16px",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryButton: {
    background: "#fff",
    color: "#0f172a",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    padding: "10px 16px",
    fontWeight: 700,
    cursor: "pointer",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  },
  kpiCard: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "22px",
    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
    border: "1px solid #e2e8f0",
  },
  kpiLabel: {
    margin: 0,
    fontSize: "13px",
    color: "#64748b",
    fontWeight: 700,
  },
  kpiValue: {
    margin: "10px 0 0",
    fontSize: "30px",
    fontWeight: 800,
  },
  bestCard: {
    background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
    color: "#fff",
    borderRadius: "22px",
    padding: "24px",
    marginBottom: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 12px 28px rgba(29,78,216,0.25)",
  },
  label: {
    margin: 0,
    opacity: 0.85,
    fontSize: "13px",
  },
  bestName: {
    margin: "6px 0",
    fontSize: "26px",
  },
  bestText: {
    margin: 0,
  },
  rankBadge: {
    background: "#fff",
    color: BLUE,
    padding: "12px 18px",
    borderRadius: "999px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  card: {
    background: "#fff",
    borderRadius: "22px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "20px",
    margin: "0 0 18px",
  },
  inputGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "18px",
  },
  inputCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "18px",
    background: "#f8fafc",
  },
  inputCardHeader: {
    display: "flex",
    gap: "8px",
    marginBottom: "14px",
  },
  nameInput: {
    flex: 1,
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontWeight: 700,
  },
  deleteButton: {
    border: "none",
    borderRadius: "10px",
    background: "#fee2e2",
    color: "#991b1b",
    padding: "8px 10px",
    cursor: "pointer",
    fontWeight: 700,
  },
  field: {
    display: "block",
    marginBottom: "12px",
  },
  fieldLabel: {
    display: "block",
    fontSize: "13px",
    color: "#475569",
    marginBottom: "5px",
    fontWeight: 700,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    background: "#fff",
  },
  twoColumn: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
    minWidth: "900px",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "1px solid #e2e8f0",
    color: "#475569",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  },
  smallBadge: {
    background: "#dbeafe",
    color: BLUE,
    padding: "6px 10px",
    borderRadius: "999px",
    fontWeight: 800,
  },
  commentList: {
    lineHeight: 1.9,
    color: "#334155",
    paddingLeft: "20px",
  },
};