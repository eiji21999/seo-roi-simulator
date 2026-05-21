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

const COLORS = [
  "#1d4ed8",
  "#2563eb",
  "#38bdf8",
  "#0f172a",
  "#64748b",
];

const initialInfluencers = [
  {
    id: 1,
    name: "旅行系Instagram",
    sns: "Instagram",
    followers: 50000,
    views: 20000,
    engagementRate: 3,
    cost: 150000,
    cvr: 1,
    averageOrderValue: 30000,

    saveRate: 4,
    profileClickRate: 2,
    storyCtr: 1.2,

    watchRetentionRate: 0,
    shareRate: 0,
    viralScore: 0,

    averageWatchTime: 0,
    descriptionCtr: 0,
    subscribeRate: 0,

    impressions: 0,
    repostRate: 0,
    linkCtr: 0,
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
        const decoded = JSON.parse(
          decodeURIComponent(atob(data))
        );

        if (Array.isArray(decoded)) {
          setInfluencers(decoded);
        }
      } catch {
        console.log("restore error");
      }
    }
  }, []);

  const calculated = useMemo(() => {
    return influencers.map((item) => {
      const conversions = item.views * (item.cvr / 100);

      const sales =
        conversions * item.averageOrderValue;

      const profit = sales - item.cost;

      const roi =
        item.cost > 0
          ? (profit / item.cost) * 100
          : 0;

      const cpa =
        conversions > 0
          ? item.cost / conversions
          : 0;

      let platformScore = 50;

      if (item.sns === "Instagram") {
        platformScore =
          item.saveRate * 10 +
          item.profileClickRate * 10 +
          item.storyCtr * 15 +
          item.engagementRate * 5;
      }

      if (item.sns === "TikTok") {
        platformScore =
          item.watchRetentionRate +
          item.shareRate * 15 +
          item.viralScore;
      }

      if (item.sns === "YouTube") {
        platformScore =
          item.averageWatchTime / 10 +
          item.descriptionCtr * 20 +
          item.subscribeRate * 25;
      }

      if (item.sns === "X") {
        platformScore =
          item.linkCtr * 20 +
          item.repostRate * 15 +
          item.engagementRate * 5;
      }

      let rank = "C";

      if (
        roi >= 100 &&
        platformScore >= 80
      ) {
        rank = "A";
      } else if (roi >= 0) {
        rank = "B";
      }

      return {
        ...item,
        conversions,
        sales,
        profit,
        roi,
        cpa,
        platformScore,
        rank,
      };
    });
  }, [influencers]);

  const summary = useMemo(() => {
    const totalSales = calculated.reduce(
      (sum, item) => sum + item.sales,
      0
    );

    const totalProfit = calculated.reduce(
      (sum, item) => sum + item.profit,
      0
    );

    const averageROI =
      calculated.length > 0
        ? calculated.reduce(
            (sum, item) => sum + item.roi,
            0
          ) / calculated.length
        : 0;

    const averageCPA =
      calculated.length > 0
        ? calculated.reduce(
            (sum, item) => sum + item.cpa,
            0
          ) / calculated.length
        : 0;

    return {
      totalSales,
      totalProfit,
      averageROI,
      averageCPA,
    };
  }, [calculated]);

  const bestInfluencer = useMemo(() => {
    if (calculated.length === 0) return null;

    return [...calculated].sort(
      (a, b) => b.roi - a.roi
    )[0];
  }, [calculated]);

  const pieData = calculated.map((item) => ({
    name: item.name,
    value: item.cost,
  }));

  const updateInfluencer = (
    id,
    key,
    value
  ) => {
    setInfluencers((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [key]:
                key === "name" ||
                key === "sns"
                  ? value
                  : Number(value),
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
      },
    ]);
  };

  const deleteInfluencer = (id) => {
    setInfluencers((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const exportCSV = () => {
    const header = [
      "名前",
      "SNS",
      "フォロワー",
      "再生数",
      "費用",
      "CVR",
      "客単価",
    ];

    const rows = influencers.map((item) => [
      item.name,
      item.sns,
      item.followers,
      item.views,
      item.cost,
      item.cvr,
      item.averageOrderValue,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(
      ["\uFEFF" + csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;

    a.download =
      "influencer-analysis.csv";

    a.click();

    URL.revokeObjectURL(url);
  };

  const shareURL = async () => {
    const encoded = btoa(
      encodeURIComponent(
        JSON.stringify(influencers)
      )
    );

    const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;

    await navigator.clipboard.writeText(
      url
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Influencer ROI Simulator
          </h1>

          <p style={styles.subtitle}>
            SNS媒体ごとの適性も含めて
            インフルエンサー施策を比較
          </p>
        </div>

        <div style={styles.actions}>
          <button
            style={styles.secondaryButton}
            onClick={exportCSV}
          >
            CSV出力
          </button>

          <button
            style={styles.primaryButton}
            onClick={shareURL}
          >
            {copied
              ? "コピー済み"
              : "URL共有"}
          </button>
        </div>
      </div>

      <div style={styles.kpiGrid}>
        <KpiCard
          title="総売上"
          value={formatYen(
            summary.totalSales
          )}
        />

        <KpiCard
          title="総利益"
          value={formatYen(
            summary.totalProfit
          )}
          danger={
            summary.totalProfit < 0
          }
        />

        <KpiCard
          title="平均ROI"
          value={`${summary.averageROI.toFixed(
            1
          )}%`}
        />

        <KpiCard
          title="平均CPA"
          value={formatYen(
            summary.averageCPA
          )}
        />
      </div>

      {bestInfluencer && (
        <div style={styles.bestCard}>
          <div>
            <p style={styles.label}>
              おすすめ候補
            </p>

            <h2 style={styles.bestName}>
              {bestInfluencer.name}
            </h2>

            <p style={styles.bestText}>
              ROIとSNS適性スコアが
              最も高い候補です。
            </p>
          </div>

          <div style={styles.rankBadge}>
            Rank {bestInfluencer.rank}
          </div>
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.sectionTitle}>
            インフルエンサー入力
          </h2>

          <button
            style={styles.primaryButton}
            onClick={addInfluencer}
          >
            ＋追加
          </button>
        </div>

        <div style={styles.inputGrid}>
          {influencers.map((item) => (
            <div
              key={item.id}
              style={styles.inputCard}
            >
              <div
                style={
                  styles.inputCardHeader
                }
              >
                <input
                  style={styles.nameInput}
                  value={item.name}
                  onChange={(e) =>
                    updateInfluencer(
                      item.id,
                      "name",
                      e.target.value
                    )
                  }
                />

                <button
                  style={
                    styles.deleteButton
                  }
                  onClick={() =>
                    deleteInfluencer(
                      item.id
                    )
                  }
                >
                  削除
                </button>
              </div>

              <Field label="SNS">
                <select
                  style={styles.input}
                  value={item.sns}
                  onChange={(e) =>
                    updateInfluencer(
                      item.id,
                      "sns",
                      e.target.value
                    )
                  }
                >
                  <option>
                    Instagram
                  </option>
                  <option>
                    TikTok
                  </option>
                  <option>
                    YouTube
                  </option>
                  <option>X</option>
                </select>
              </Field>

              <Field label="フォロワー数">
                <input
                  style={styles.input}
                  type="number"
                  value={item.followers}
                  onChange={(e) =>
                    updateInfluencer(
                      item.id,
                      "followers",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="平均再生数">
                <input
                  style={styles.input}
                  type="number"
                  value={item.views}
                  onChange={(e) =>
                    updateInfluencer(
                      item.id,
                      "views",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="エンゲージメント率">
                <input
                  style={styles.input}
                  type="number"
                  value={
                    item.engagementRate
                  }
                  onChange={(e) =>
                    updateInfluencer(
                      item.id,
                      "engagementRate",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="投稿費用">
                <input
                  style={styles.input}
                  type="number"
                  value={item.cost}
                  onChange={(e) =>
                    updateInfluencer(
                      item.id,
                      "cost",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="CVR">
                <input
                  style={styles.input}
                  type="number"
                  value={item.cvr}
                  onChange={(e) =>
                    updateInfluencer(
                      item.id,
                      "cvr",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="客単価">
                <input
                  style={styles.input}
                  type="number"
                  value={
                    item.averageOrderValue
                  }
                  onChange={(e) =>
                    updateInfluencer(
                      item.id,
                      "averageOrderValue",
                      e.target.value
                    )
                  }
                />
              </Field>

              {item.sns ===
                "Instagram" && (
                <>
                  <Field label="保存率">
                    <input
                      style={
                        styles.input
                      }
                      type="number"
                      value={
                        item.saveRate
                      }
                      onChange={(e) =>
                        updateInfluencer(
                          item.id,
                          "saveRate",
                          e.target
                            .value
                        )
                      }
                    />
                  </Field>

                  <Field label="プロフィール遷移率">
                    <input
                      style={
                        styles.input
                      }
                      type="number"
                      value={
                        item.profileClickRate
                      }
                      onChange={(e) =>
                        updateInfluencer(
                          item.id,
                          "profileClickRate",
                          e.target
                            .value
                        )
                      }
                    />
                  </Field>

                  <Field label="ストーリーCTR">
                    <input
                      style={
                        styles.input
                      }
                      type="number"
                      value={
                        item.storyCtr
                      }
                      onChange={(e) =>
                        updateInfluencer(
                          item.id,
                          "storyCtr",
                          e.target
                            .value
                        )
                      }
                    />
                  </Field>
                </>
              )}

              {item.sns ===
                "TikTok" && (
                <>
                  <Field label="視聴維持率">
                    <input
                      style={
                        styles.input
                      }
                      type="number"
                      value={
                        item.watchRetentionRate
                      }
                      onChange={(e) =>
                        updateInfluencer(
                          item.id,
                          "watchRetentionRate",
                          e.target
                            .value
                        )
                      }
                    />
                  </Field>

                  <Field label="シェア率">
                    <input
                      style={
                        styles.input
                      }
                      type="number"
                      value={
                        item.shareRate
                      }
                      onChange={(e) =>
                        updateInfluencer(
                          item.id,
                          "shareRate",
                          e.target
                            .value
                        )
                      }
                    />
                  </Field>

                  <Field label="バズ期待度">
                    <input
                      style={
                        styles.input
                      }
                      type="number"
                      value={
                        item.viralScore
                      }
                      onChange={(e) =>
                        updateInfluencer(
                          item.id,
                          "viralScore",
                          e.target
                            .value
                        )
                      }
                    />
                  </Field>
                </>
              )}

              {item.sns ===
                "YouTube" && (
                <>
                  <Field label="平均視聴時間">
                    <input
                      style={
                        styles.input
                      }
                      type="number"
                      value={
                        item.averageWatchTime
                      }
                      onChange={(e) =>
                        updateInfluencer(
                          item.id,
                          "averageWatchTime",
                          e.target
                            .value
                        )
                      }
                    />
                  </Field>

                  <Field label="概要欄CTR">
                    <input
                      style={
                        styles.input
                      }
                      type="number"
                      value={
                        item.descriptionCtr
                      }
                      onChange={(e) =>
                        updateInfluencer(
                          item.id,
                          "descriptionCtr",
                          e.target
                            .value
                        )
                      }
                    />
                  </Field>

                  <Field label="登録転換率">
                    <input
                      style={
                        styles.input
                      }
                      type="number"
                      value={
                        item.subscribeRate
                      }
                      onChange={(e) =>
                        updateInfluencer(
                          item.id,
                          "subscribeRate",
                          e.target
                            .value
                        )
                      }
                    />
                  </Field>
                </>
              )}

              {item.sns === "X" && (
                <>
                  <Field label="インプレッション">
                    <input
                      style={
                        styles.input
                      }
                      type="number"
                      value={
                        item.impressions
                      }
                      onChange={(e) =>
                        updateInfluencer(
                          item.id,
                          "impressions",
                          e.target
                            .value
                        )
                      }
                    />
                  </Field>

                  <Field label="リポスト率">
                    <input
                      style={
                        styles.input
                      }
                      type="number"
                      value={
                        item.repostRate
                      }
                      onChange={(e) =>
                        updateInfluencer(
                          item.id,
                          "repostRate",
                          e.target
                            .value
                        )
                      }
                    />
                  </Field>

                  <Field label="リンクCTR">
                    <input
                      style={
                        styles.input
                      }
                      type="number"
                      value={
                        item.linkCtr
                      }
                      onChange={(e) =>
                        updateInfluencer(
                          item.id,
                          "linkCtr",
                          e.target
                            .value
                        )
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
          <h2 style={styles.sectionTitle}>
            ROI比較
          </h2>

          <div
            style={{
              width: "100%",
              height: 320,
            }}
          >
            <ResponsiveContainer>
              <BarChart
                data={calculated}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="roi"
                  fill={BLUE}
                  radius={[
                    8,
                    8,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>
            費用割合
          </h2>

          <div
            style={{
              width: "100%",
              height: 320,
            }}
          >
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {pieData.map(
                    (_, index) => (
                      <Cell
                        key={index}
                        fill={
                          COLORS[
                            index %
                              COLORS.length
                          ]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>
          比較表
        </h2>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {[
                  "名前",
                  "SNS",
                  "ROI",
                  "CPA",
                  "利益",
                  "SNS適性",
                  "判定",
                ].map((head) => (
                  <th
                    key={head}
                    style={styles.th}
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {calculated.map((item) => (
                <tr key={item.id}>
                  <td style={styles.td}>
                    {item.name}
                  </td>

                  <td style={styles.td}>
                    {item.sns}
                  </td>

                  <td style={styles.td}>
                    {item.roi.toFixed(
                      1
                    )}
                    %
                  </td>

                  <td style={styles.td}>
                    {formatYen(
                      item.cpa
                    )}
                  </td>

                  <td
                    style={{
                      ...styles.td,
                      color:
                        item.profit < 0
                          ? "#991b1b"
                          : "#0f172a",
                    }}
                  >
                    {formatYen(
                      item.profit
                    )}
                  </td>

                  <td style={styles.td}>
                    {item.platformScore.toFixed(
                      1
                    )}
                  </td>

                  <td style={styles.td}>
                    <span
                      style={
                        styles.smallBadge
                      }
                    >
                      Rank{" "}
                      {item.rank}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>
          AI分析コメント
        </h2>

        <ul
          style={styles.commentList}
        >
          {calculated.map((item) => (
            <li key={item.id}>
              {item.sns ===
                "Instagram" &&
                `${item.name} はInstagramとして保存率・プロフィール遷移率が高い場合、旅行・美容・ホテル系商材と相性が良い可能性があります。`}

              {item.sns ===
                "TikTok" &&
                `${item.name} はTikTokとして視聴維持率が高い場合、認知拡大型キャンペーンに向いています。`}

              {item.sns ===
                "YouTube" &&
                `${item.name} はYouTubeとして比較検討型・高単価商品の訴求に向いています。`}

              {item.sns ===
                "X" &&
                `${item.name} はXとして拡散力重視のキャンペーンに向いています。`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}) {
  return (
    <label style={styles.field}>
      <span
        style={styles.fieldLabel}
      >
        {label}
      </span>

      {children}
    </label>
  );
}

function KpiCard({
  title,
  value,
  danger,
}) {
  return (
    <div style={styles.kpiCard}>
      <p style={styles.kpiLabel}>
        {title}
      </p>

      <h2
        style={{
          ...styles.kpiValue,
          color: danger
            ? "#991b1b"
            : "#0f172a",
        }}
      >
        {value}
      </h2>
    </div>
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
    display: "flex",
    justifyContent:
      "space-between",
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
    border:
      "1px solid #cbd5e1",
    borderRadius: "12px",
    padding: "10px 16px",
    fontWeight: 700,
    cursor: "pointer",
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  },

  kpiCard: {
    background: "#fff",
    borderRadius: "20px",
    padding: "22px",
    boxShadow:
      "0 8px 24px rgba(15,23,42,0.06)",
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
    background:
      "linear-gradient(135deg, #1d4ed8, #2563eb)",
    color: "#fff",
    borderRadius: "22px",
    padding: "24px",
    marginBottom: "24px",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
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
  },

  card: {
    background: "#fff",
    borderRadius: "22px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow:
      "0 8px 24px rgba(15,23,42,0.06)",
  },

  cardHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },

  sectionTitle: {
    fontSize: "20px",
    margin: 0,
  },

  inputGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "18px",
  },

  inputCard: {
    border:
      "1px solid #e2e8f0",
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
    border:
      "1px solid #cbd5e1",
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
    border:
      "1px solid #cbd5e1",
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
  },

  tableWrap: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse:
      "collapse",
    minWidth: "700px",
  },

  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom:
      "1px solid #e2e8f0",
    fontSize: "13px",
    color: "#475569",
  },

  td: {
    padding: "12px",
    borderBottom:
      "1px solid #e2e8f0",
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