import { useState } from "react";
import MarketingComparisonSimulator from "./MarketingComparisonSimulator";
import SeoRoiSimulator from "./SeoRoiSimulator";

export default function App() {
  const [activeSimulator, setActiveSimulator] = useState("marketing");

  return (
    <div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <button onClick={() => setActiveSimulator("marketing")}>
          Webマーケティング施策比較
        </button>

        <button onClick={() => setActiveSimulator("seo")}>
          SEO ROIシミュレーター
        </button>
      </div>

      {activeSimulator === "marketing" && <MarketingComparisonSimulator />}
      {activeSimulator === "seo" && <SeoRoiSimulator />}
    </div>
  );
}