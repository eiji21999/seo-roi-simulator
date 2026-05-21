import { useState } from "react";
import MarketingComparisonSimulator from "./MarketingComparisonSimulator";
import SeoRoiSimulator from "./SeoRoiSimulator";

export default function App() {
  const [activeSimulator, setActiveSimulator] = useState("marketing");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f6fb",
        padding: "24px",
      }}
    >
      {/* ヘッダー */}
      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#0f172a",
            marginBottom: "8px",
          }}
        >
          Marketing Dashboard
        </h1>

        <p
          style={{
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          ROIシミュレーションツール
        </p>
      </div>

      {/* タブUI */}
      <div
        style={{
          display: "inline-flex",
          background: "#ffffff",
          padding: "6px",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          marginBottom: "28px",
          gap: "6px",
        }}
      >
        <button
          onClick={() => setActiveSimulator("marketing")}
          style={{
            padding: "12px 22px",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "600",
            transition: "all 0.25s ease",
            background:
              activeSimulator === "marketing"
                ? "#1d4ed8"
                : "transparent",
            color:
              activeSimulator === "marketing"
                ? "#ffffff"
                : "#334155",
            boxShadow:
              activeSimulator === "marketing"
                ? "0 4px 12px rgba(29,78,216,0.35)"
                : "none",
          }}
        >
          Webマーケ比較
        </button>

        <button
          onClick={() => setActiveSimulator("seo")}
          style={{
            padding: "12px 22px",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "600",
            transition: "all 0.25s ease",
            background:
              activeSimulator === "seo"
                ? "#1d4ed8"
                : "transparent",
            color:
              activeSimulator === "seo"
                ? "#ffffff"
                : "#334155",
            boxShadow:
              activeSimulator === "seo"
                ? "0 4px 12px rgba(29,78,216,0.35)"
                : "none",
          }}
        >
          SEO ROI
        </button>
      </div>

      {/* コンテンツ */}
      <div>
        {activeSimulator === "marketing" && (
          <MarketingComparisonSimulator />
        )}

        {activeSimulator === "seo" && (
          <SeoRoiSimulator />
        )}
      </div>
    </div>
  );
}