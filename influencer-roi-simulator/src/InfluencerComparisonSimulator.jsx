import React, { useEffect, useMemo, useState } from "react";
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

const createInfluencer = (index = 1) => ({
  id: Date.now() + index,
  name: `インフルエンサー${index}`,
  sns: "Instagram",
  followers: 10000,
  views: 5000,
  engagementRate: 3,
  cost: 100000,
  cvr: 1,
  averageOrderValue: 30000,

  saveRate: 2,
  profileClickRate: 1,
  storyCtr: 1,

  watchRetentionRate: 40,
  shareRate: 2,
  viralScore: 50,

  averageWatchTime: 180,
  descriptionCtr: 1,
  subscribeRate: 0.5,

  impressions: 30000,
  repostRate: 1,
  linkCtr: 1,
});

const initialInfluencers = [
  {
    ...createInfluencer(1),
    id: 1,
    name: "旅行系Instagram",
    followers: 50000,
    views: 20000,
    cost: 150000,
    saveRate: 4,
    profileClickRate: 2,
    storyCtr: 1.2,
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

const toNumber = (value) => Number(value) || 0;

export default function InfluencerComparisonSimulator() {
  const [influencers, setInfluencers] = useState(initialInfluencers);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get("data");

    if (!data) return;

    try {
      const decoded = JSON.parse(decodeURIComponent(atob(data)));
      if (Array.isArray(decoded)) setInfluencers(decoded);
    } catch {
      console.log("URLデータの復元に失敗しました");
    }
  }, []);

  const calculated = useMemo(() => {
    return influencers.map((item) => {
      const baseReach = item.sns === "X" ? item.impressions : item.views;
      const conversions = baseReach * (item.cvr / 100);
      const sales = conversions * item.averageOrderValue;
      const profit = sales - item.cost;
      const roi = item.cost > 0 ? (profit / item.cost) * 100 : 0;
      const cpa = conversions > 0 ? item.cost / conversions : 0;

      let rawPlatformScore = 50;

      if (item.sns === "Instagram") {
        rawPlatformScore =
          item.saveRate * 10 +
          item.profileClickRate * 10 +
          item.storyCtr * 15 +
          item.engagementRate * 5;
      }

      if (item.sns === "TikTok") {
        rawPlatformScore =
          item.watchRetentionRate + item.shareRate * 15 + item.viralScore;
      }

      if (item.sns === "YouTube") {
        rawPlatformScore =
          item.averageWatchTime / 10 +
          item.descriptionCtr * 20 +
          item.subscribeRate * 25;
      }

      if (item.sns === "X") {
        rawPlatformScore =
          item.linkCtr * 20 + item.repostRate * 15 + item.engagementRate * 5;
      }

      const platformScore = Math.max(0, Math.min(100, rawPlatformScore));
      const totalScore = roi * 0.6 + platformScore * 0.4;

      let rank = "C";
      if (roi >= 100 && platformScore >= 75) rank = "A";
      else if (roi >= 0 && platformScore >= 50) rank = "B";

      return {
        ...item,
        baseReach,
        conversions,
        sales,
        profit,
        roi,
        cpa,
        platformScore,
        totalScore,
        rank,
      };
    });
  }, [influencers]);

  const summary = useMemo(() => {
    const totalSales = calculated.reduce((sum, item) => sum + item.sales, 0);
    const totalProfit = calculated.reduce((sum, item) => sum + item.profit, 0);

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

    return { totalSales, totalProfit, averageROI, averageCPA };
  }, [calculated]);

  const bestInfluencer = useMemo(() => {
    if (calculated.length === 0) return null;
    return [...calculated].sort((a, b) => b.totalScore - a.totalScore)[0];
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
              [key]: key === "name" || key === "sns" ? value : toNumber(value),
            }
          : item
      )
    );
  };

  const addInfluencer = () => {
    setInfluencers((prev) => [...prev, createInfluencer(prev.length + 1)]);
  };

  const deleteInfluencer = (id) => {
    setInfluencers((prev) => prev.filter((item) => item.id !== id));
  };

  const exportCSV = () => {
    const header = [
      "名前",
      "SNS",
      "フォロワー",
      "再生数",
      "インプレッション",
      "エンゲージメント率",
      "費用",
      "CVR",
      "客単価",
      "保存率",
      "プロフィール遷移率",
      "ストーリーCTR",
      "視聴維持率",
      "シェア率",
      "バズ期待度",
      "平均視聴時間",
      "概要欄CTR",
      "登録転換率",
      "リポスト率",
      "リンクCTR",
      "CV数",
      "売上",
      "利益",
      "CPA",
      "ROI",
      "SNS適性スコア",
      "判定",
    ];

    const rows = calculated.map((item) => [
      item.name,
      item.sns,
      item.followers,
      item.views,
      item.impressions,
      item.engagementRate,
      item.cost,
      item.cvr,
      item.averageOrderValue,
      item.saveRate,
      item.profileClickRate,
      item.storyCtr,
      item.watchRetentionRate,
      item.shareRate,
      item.viralScore,
      item.averageWatchTime,
      item.descriptionCtr,
      item.subscribeRate,
      item.repostRate,
      item.linkCtr,
      item.conversions.toFixed(1),
      Math.round(item.sales),
      Math.round(item.profit),
      Math.round(item.cpa),
      item.roi.toFixed(1),
      item.platformScore.toFixed(1),
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
          ...createInfluencer(index + 1),
          id: Date.now() + index,
          name: cols[0] || `インフルエンサー${index + 1}`,
          sns: cols[1] || "Instagram",
          followers: toNumber(cols[2]),
          views: toNumber(cols[3]),
          impressions: toNumber(cols[4]),
          engagementRate: toNumber(cols[5]),
          cost: toNumber(cols[6]),
          cvr: toNumber(cols[7]),
          averageOrderValue: toNumber(cols[8]),
          saveRate: toNumber(cols[9]),
          profileClickRate: toNumber(cols[10]),
          storyCtr: toNumber(cols[11]),
          watchRetentionRate: toNumber(cols[12]),
          shareRate: toNumber(cols[13]),
          viralScore: toNumber(cols[14]),
          averageWatchTime: toNumber(cols[15]),
          descriptionCtr: toNumber(cols[16]),
          subscribeRate: toNumber(cols[17]),
          repostRate: toNumber(cols[18]),
          linkCtr: toNumber(cols[19]),
        };
      });

      if (imported.length > 0) setInfluencers(imported);
    };

    reader.readAsText(file);
    event.target.value = "";
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

    return calculated.map((item) => {
      if (item.sns === "Instagram") {
        return `${item.name}：Instagramでは保存率・プロフィール遷移率・ストーリーCTRが重要です。ホテル、旅行、美容系では保存率が高い候補を優先すると相性が良いです。`;
      }

      if (item.sns === "TikTok") {
        return `${item.name}：TikTokでは視聴維持率とシェア率が重要です。認知拡大や話題化を狙う場合に向いています。`;
      }

      if (item.sns === "YouTube") {
        return `${item.name}：YouTubeでは平均視聴時間と概要欄CTRが重要です。高単価商材や比較検討型の訴求と相性が良いです。`;
      }

      return `${item.name}：Xではインプレッション、リポスト率、リンクCTRが重要です。拡散力や話題化を狙う施策に向いています。`;
    });
  }, [calculated, bestInfluencer]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Influencer ROI Simulator</h1>
          <p style={styles.subtitle}>
            SNS媒体ごとの適性も含めてインフルエンサー施策を比較できます。
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
        <KpiCard title="総売上" value={formatYen(summary.totalSales)} />
        <KpiCard
          title="総利益"
          value={formatYen(summary.totalProfit)}
          danger={summary.totalProfit < 0}
        />
        <KpiCard title="平均ROI" value={`${summary.averageROI.toFixed(1)}%`} />
        <KpiCard title="平均CPA" value={formatYen(summary.averageCPA)} />
      </div>

      {bestInfluencer && (
        <div style={styles.bestCard}>
          <div>
            <p style={styles.label}>おすすめ候補</p>
            <h2 style={styles.bestName}>{bestInfluencer.name}</h2>
            <p style={styles.bestText}>
              ROIとSNS適性スコアを総合すると、この候補が最も有力です。
            </p>
          </div>
          <div style={styles.rankBadge}>Rank {bestInfluencer.rank}</div>
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.sectionTitle}>インフルエンサー入力</h2>
          <button style={styles.primaryButton} onClick={addInfluencer}>
            ＋追加
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
                <NumberInput
                  value={item.followers}
                  onChange={(value) =>
                    updateInfluencer(item.id, "followers", value)
                  }
                />
              </Field>

              <Field label="平均再生数 / 表示回数">
                <NumberInput
                  value={item.views}
                  onChange={(value) => updateInfluencer(item.id, "views", value)}
                />
              </Field>

              <Field label="エンゲージメント率（%）">
                <NumberInput
                  value={item.engagementRate}
                  onChange={(value) =>
                    updateInfluencer(item.id, "engagementRate", value)
                  }
                />
              </Field>

              <Field label="投稿費用（円）">
                <NumberInput
                  value={item.cost}
                  onChange={(value) => updateInfluencer(item.id, "cost", value)}
                />
              </Field>

              <Field label="想定CVR（%）">
                <NumberInput
                  value={item.cvr}
                  onChange={(value) => updateInfluencer(item.id, "cvr", value)}
                />
              </Field>

              <Field label="客単価（円）">
                <NumberInput
                  value={item.averageOrderValue}
                  onChange={(value) =>
                    updateInfluencer(item.id, "averageOrderValue", value)
                  }
                />
              </Field>

              {item.sns === "Instagram" && (
                <>
                  <Field label="保存率（%）">
                    <NumberInput
                      value={item.saveRate}
                      onChange={(value) =>
                        updateInfluencer(item.id, "saveRate", value)
                      }
                    />
                  </Field>
                  <Field label="プロフィール遷移率（%）">
                    <NumberInput
                      value={item.profileClickRate}
                      onChange={(value) =>
                        updateInfluencer(item.id, "profileClickRate", value)
                      }
                    />
                  </Field>
                  <Field label="ストーリーCTR（%）">
                    <NumberInput
                      value={item.storyCtr}
                      onChange={(value) =>
                        updateInfluencer(item.id, "storyCtr", value)
                      }
                    />
                  </Field>
                </>
              )}

              {item.sns === "TikTok" && (
                <>
                  <Field label="視聴維持率（%）">
                    <NumberInput
                      value={item.watchRetentionRate}
                      onChange={(value) =>
                        updateInfluencer(item.id, "watchRetentionRate", value)
                      }
                    />
                  </Field>
                  <Field label="シェア率（%）">
                    <NumberInput
                      value={item.shareRate}
                      onChange={(value) =>
                        updateInfluencer(item.id, "shareRate", value)
                      }
                    />
                  </Field>
                  <Field label="バズ期待度（0〜100）">
                    <NumberInput
                      value={item.viralScore}
                      onChange={(value) =>
                        updateInfluencer(item.id, "viralScore", value)
                      }
                    />
                  </Field>
                </>
              )}

              {item.sns === "YouTube" && (
                <>
                  <Field label="平均視聴時間（秒）">
                    <NumberInput
                      value={item.averageWatchTime}
                      onChange={(value) =>
                        updateInfluencer(item.id, "averageWatchTime", value)
                      }
                    />
                  </Field>
                  <Field label="概要欄CTR（%）">
                    <NumberInput
                      value={item.descriptionCtr}
                      onChange={(value) =>
                        updateInfluencer(item.id, "descriptionCtr", value)
                      }
                    />
                  </Field>
                  <Field label="登録転換率（%）">
                    <NumberInput
                      value={item.subscribeRate}
                      onChange={(value) =>
                        updateInfluencer(item.id, "subscribeRate", value)
                      }
                    />
                  </Field>
                </>
              )}

              {item.sns === "X" && (
                <>
                  <Field label="インプレッション">
                    <NumberInput
                      value={item.impressions}
                      onChange={(value) =>
                        updateInfluencer(item.id, "impressions", value)
                      }
                    />
                  </Field>
                  <Field label="リポスト率（%）">
                    <NumberInput
                      value={item.repostRate}
                      onChange={(value) =>
                        updateInfluencer(item.id, "repostRate", value)
                      }
                    />
                  </Field>
                  <Field label="リンクCTR（%）">
                    <NumberInput
                      value={item.linkCtr}
                      onChange={(value) =>
                        updateInfluencer(item.id, "linkCtr", value)
                      }
                    />
                  </Field>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.twoColumn}>
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>ROI比較</h2>
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
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
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
                  "基準リーチ",
                  "CV数",
                  "売上",
                  "利益",
                  "CPA",
                  "ROI",
                  "SNS適性",
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
                  <td style={styles.td}>{formatNumber(item.baseReach)}</td>
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
                  <td style={styles.td}>{item.platformScore.toFixed(1)}</td>
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
        <p style={styles.comment}>
          総合おすすめは「{bestInfluencer?.name}」です。ROIだけでなく、SNS適性スコアも加味して判定しています。
        </p>
        <ul style={styles.commentList}>
          {aiComments.map((comment, index) => (
            <li key={index}>{comment}</li>
          ))}
        </ul>
      </div>
      <div style={styles.card}>
  <h2 style={styles.sectionTitle}>判定基準ヘルプ</h2>

  <div style={styles.helpBox}>
    <h3 style={styles.helpTitle}>SNS適性スコア</h3>
    <p style={styles.helpText}>
      SNSごとに重要な指標を点数化したものです。Instagramは保存率やプロフィール遷移率、TikTokは視聴維持率やシェア率、YouTubeは平均視聴時間や概要欄CTR、XはリンクCTRやリポスト率を重視しています。
    </p>
  </div>

  <div style={styles.helpBox}>
    <h3 style={styles.helpTitle}>Rank A</h3>
    <p style={styles.helpText}>
      ROIが100%以上、かつSNS適性スコアが75以上の候補です。費用対効果と媒体相性の両方が高い候補として判定されます。
    </p>
  </div>

  <div style={styles.helpBox}>
    <h3 style={styles.helpTitle}>Rank B</h3>
    <p style={styles.helpText}>
      ROIが0%以上、かつSNS適性スコアが50以上の候補です。最低限の利益が見込め、媒体相性も一定以上ある候補です。
    </p>
  </div>

  <div style={styles.helpBox}>
    <h3 style={styles.helpTitle}>Rank C</h3>
    <p style={styles.helpText}>
      ROIまたはSNS適性スコアが基準を下回る候補です。費用交渉、投稿内容の見直し、または見送りを検討する候補です。
    </p>
  </div>
</div>
    </div>
  );
}

function NumberInput({ value, onChange }) {
  return (
    <input
      style={styles.input}
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
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

function KpiCard({ title, value, danger }) {
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

const styles = {
helpBox: {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "16px",
  marginTop: "14px",
  color: "#0f172a",
},

helpTitle: {
  margin: "0 0 8px",
  fontSize: "16px",
  fontWeight: 800,
  color: "#1d4ed8",
},

helpText: {
  margin: 0,
  color: "#0f172a",
  lineHeight: 1.8,
  fontSize: "14px",
},

  page: {
    minHeight: "100vh",
    background: "#f3f6fb",
    padding: "28px",
    color: "#0f172a",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  title: {
    fontSize: "32px",
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
    background: "#fff",
    borderRadius: "20px",
    padding: "22px",
    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
  },
  kpiLabel: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
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
  },
  label: {
    margin: 0,
    fontSize: "13px",
  },
  bestName: {
    fontSize: "26px",
    margin: "8px 0",
  },
  bestText: {
    margin: 0,
  },
  rankBadge: {
    background: "#fff",
    color: BLUE,
    borderRadius: "999px",
    padding: "12px 18px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  card: {
    background: "#fff",
    borderRadius: "22px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
    color: "#0f172a",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },
  sectionTitle: {
    fontSize: "20px",
    margin: 0,
      color: "#0f172a",
  fontWeight: 800,
  },
  inputGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
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
    background: "#fee2e2",
    color: "#991b1b",
    border: "none",
    borderRadius: "10px",
    padding: "8px 10px",
    fontWeight: 700,
    cursor: "pointer",
  },
  field: {
    display: "block",
    marginBottom: "12px",
  },
  fieldLabel: {
    display: "block",
    marginBottom: "5px",
    fontSize: "13px",
    fontWeight: 700,
    color: "#475569",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
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
    minWidth: "900px",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "1px solid #e2e8f0",
    fontSize: "13px",
    color: "#475569",
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
  comment: {
    color: "#334155",
    lineHeight: 1.8,
  },
  commentList: {
    lineHeight: 1.9,
    color: "#334155",
    paddingLeft: "20px",
  },
};