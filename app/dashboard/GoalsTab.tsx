import type { Goal } from "../types";

interface GoalsTabProps {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
}

export function GoalsTab({ goals, setGoals }: GoalsTabProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        height: "100%",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h3
          style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}
        >
          SMART-цели реабилитации
        </h3>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>
          {goals.length}{" "}
          {goals.length === 1 ? "цель" : goals.length < 5 ? "цели" : "целей"}
        </span>
      </div>
      {goals.length === 0 && (
        <div
          style={{
            background: "white",
            borderRadius: 14,
            padding: 40,
            border: "1px solid #e2e8f0",
            textAlign: "center",
            color: "#94a3b8",
          }}
        >
          <p style={{ fontSize: 24, margin: "0 0 8px" }}>🎯</p>
          <p style={{ margin: 0 }}>
            Перейдите на вкладку «ИИ-чат» для формулирования целей
          </p>
        </div>
      )}
      {goals.map((g) => (
        <div
          key={g.id}
          style={{
            background: "white",
            borderRadius: 14,
            padding: 20,
            border: "1px solid #e2e8f0",
            borderLeft: `4px solid ${g.color}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div style={{ flex: 1 }}>
              <span
                style={{
                  display: "inline-block",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 99,
                  color: "white",
                  background: g.color,
                  marginBottom: 8,
                }}
              >
                {g.domain || "Общая"}
              </span>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: "#1e293b",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {g.text}
              </p>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
                Достижение цели (GAS)
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 6,
              }}
            >
              {[-2, -1, 0, 1, 2].map((score) => (
                <button
                  key={score}
                  onClick={() =>
                    setGoals((prev) =>
                      prev.map((x) =>
                        x.id === g.id ? { ...x, gasScore: score } : x
                      )
                    )
                  }
                  style={{
                    padding: "10px 8px",
                    borderRadius: 8,
                    border:
                      g.gasScore === score
                        ? `2px solid ${g.color}`
                        : "1px solid #e2e8f0",
                    background: g.gasScore === score ? `${g.color}15` : "white",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: g.gasScore === score ? 600 : 500,
                    color: g.gasScore === score ? g.color : "#64748b",
                    transition: "all 0.15s",
                  }}
                >
                  {score >= 0 ? "+" : ""}
                  {score}
                </button>
              ))}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 6,
                marginTop: 6,
                fontSize: 10,
                color: "#94a3b8",
                textAlign: "center",
              }}
            >
              <span>Исходн.</span>
              <span>Лучше</span>
              <span>Цель</span>
              <span>Выше</span>
              <span>Идеал</span>
            </div>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            {[
              ["S — Конкретно", g.specific],
              ["M — Измеримо", g.measurable],
              ["A — Достижимо", g.achievable],
              ["R — Значимо", g.relevant],
              ["T — Срок", g.timeBound],
            ]
              .filter(([, v]) => v)
              .map(([label, val]) => (
                <div
                  key={label}
                  style={{
                    background: "#f8fafc",
                    borderRadius: 8,
                    padding: "8px 10px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#94a3b8",
                      margin: "0 0 2px",
                      textTransform: "uppercase",
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#374151",
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    {val}
                  </p>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
