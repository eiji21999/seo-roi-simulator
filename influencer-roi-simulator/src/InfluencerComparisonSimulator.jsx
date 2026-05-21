import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const BLUE = "#1d4ed8";

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

  const calculated = useMemo(() => {
    const summary = useMemo(() => {
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

  const bestInfluencer = useMemo(() => {
    if (calculated.length === 0) return null;
    return [...calculated].sort((a, b) => b.roi - a.roi)[0];
  }, [calculated]);

  const updateInfluencer = (id, key, value) => {
    setInfluencers((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [key]:
                key === "name" || key === "sns" ? value : Number(value),
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

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Influencer ROI Simulator</h1>
        <p style={styles.subtitle}>
          複数のSNSインフルエンサーを比較し、費用対効果をシミュレーションできます。
        </p>
      </div>

      {bestInfluencer && (
        <div style={styles.bestCard}>
          <div>
            <p style={styles.label}>おすすめ候補</p>
            <h2 style={styles.bestName}>{bestInfluencer.name}</h2>
            <p style={styles.bestText}>
              ROIが最も高く、想定利益は {formatYen(bestInfluencer.profit)} です。
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
        <h2 style={styles.sectionTitle}>比較表</h2>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>名前</th>
                <th>SNS</th>
                <th>再生数</th>
                <th>費用</th>
                <th>CV数</th>
                <th>売上</th>
                <th>利益</th>
                <th>CPA</th>
                <th>ROI</th>
                <th>判定</th>
              </tr>
            </thead>
            <tbody>
              {calculated.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.sns}</td>
                  <td>{formatNumber(item.views)}</td>
                  <td>{formatYen(item.cost)}</td>
                  <td>{formatNumber(item.conversions)}</td>
                  <td>{formatYen(item.sales)}</td>
                  <td
                    style={{
                      color: item.profit < 0 ? "#991b1b" : "#0f172a",
                      fontWeight: 700,
                    }}
                  >
                    {formatYen(item.profit)}
                  </td>
                  <td>{formatYen(item.cpa)}</td>
                  <td>{item.roi.toFixed(1)}%</td>
                  <td>
                    <span style={styles.smallBadge}>Rank {item.rank}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>自動コメント</h2>
        {bestInfluencer ? (
          <p style={styles.comment}>
            現時点では「{bestInfluencer.name}」が最もROIが高い候補です。
            ただし、フォロワー数よりも平均再生数・エンゲージメント率・投稿費用のバランスを重視して判断するのがおすすめです。
          </p>
        ) : (
          <p style={styles.comment}>比較対象を追加してください。</p>
        )}
      </div>
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
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  header: {
    marginBottom: "24px",
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
  bestCard: {
    background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
    color: "#fff",
    borderRadius: "22px",
    padding: "24px",
    marginBottom: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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
    margin: 0,
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
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  smallBadge: {
    background: "#dbeafe",
    color: BLUE,
    padding: "6px 10px",
    borderRadius: "999px",
    fontWeight: 800,
  },
  comment: {
    lineHeight: 1.8,
    color: "#334155",
  },
};