import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PROGRESS_DATA } from "../mockData";

export function ProgressTab() {
  const DOMAIN_COLORS = {
    "Познание и коммуникация": "#2563eb",
    Мобильность: "#7c3aed",
    Самообслуж: "#d97706",
    "Межличностные взаимодействия": "#ec4899",
    "Повседневная деятельность": "#10b981",
    "Жизнь в обществе": "#059669",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          background: "white",
          borderRadius: 14,
          padding: 20,
          border: "1px solid #e2e8f0",
        }}
      >
        <h3
          style={{ fontSize: 14, fontWeight: 500, color: "#374151", margin: 0 }}
        >
          Динамика функциональных ограничений (ежемесячно)
        </h3>
        <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 16px" }}>
          Снижение значений = улучшение состояния (шкала 1–5)
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={PROGRESS_DATA}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
          >
            <defs>
              {Object.entries(DOMAIN_COLORS).map(([k, c]) => (
                <linearGradient
                  key={k}
                  id={`grad_${k}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={c} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={c} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis
              domain={[1, 5]}
              reversed
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickCount={5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
              }}
              formatter={(v, name) => {
                if (v === undefined || v === null) return ["", ""];
                const val = typeof v === "number" ? v.toFixed(1) : String(v);
                return [val, String(name)];
              }}
            />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
            {Object.entries(DOMAIN_COLORS).map(([key, color]) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                fill={`url(#grad_${key})`}
                strokeWidth={2.5}
                dot={{ r: 3, fill: color }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
