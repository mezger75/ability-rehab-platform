import type { Goal } from "../types";

interface GoalAchievementStatusProps {
  goals: Goal[];
  onUpdateGas?: () => void;
  gasLoading?: boolean;
}

export function GoalAchievementStatus({
  goals,
  onUpdateGas,
  gasLoading,
}: GoalAchievementStatusProps) {
  const gasLabels = {
    "-2": "Исходный",
    "-1": "Лучше",
    "0": "Цель",
    "1": "Выше",
    "2": "Идеал",
  };

  const gasColors = {
    "-2": "#ef4444",
    "-1": "#f97316",
    "0": "#3b82f6",
    "1": "#10b981",
    "2": "#8b5cf6",
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: 14,
        padding: 20,
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h3
          style={{ fontSize: 14, fontWeight: 500, color: "#374151", margin: 0 }}
        >
          Статус достижения целей (GAS)
        </h3>
        {onUpdateGas && (
          <button
            onClick={onUpdateGas}
            disabled={gasLoading}
            style={{
              background: gasLoading ? "#e2e8f0" : "#2563eb",
              color: gasLoading ? "#94a3b8" : "white",
              border: "none",
              borderRadius: 8,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 500,
              cursor: gasLoading ? "default" : "pointer",
            }}
          >
            {gasLoading ? "Анализирую..." : "Обновить GAS"}
          </button>
        )}
      </div>
      {goals.length === 0 ? (
        <div
          style={{
            height: 280,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
            fontSize: 14,
            textAlign: "center",
          }}
        >
          <div>
            <p>Нет активных целей</p>
            <p style={{ fontSize: 12 }}>Перейдите в «ИИ-чат» для создания</p>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {goals.map((g) => {
            return (
              <div
                key={g.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  background: "#f8fafc",
                  borderRadius: 8,
                  borderLeft: `3px solid ${g.color}`,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#1e293b",
                      marginBottom: 2,
                    }}
                  >
                    {g.domain || "Цель"}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#94a3b8",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {g.text}
                  </div>
                </div>
                <div
                  style={{
                    background:
                      gasColors[String(g.gasScore) as keyof typeof gasColors] ||
                      "#cbd5e1",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    textAlign: "center",
                    minWidth: 60,
                  }}
                >
                  {g.gasScore >= 0 ? "+" : ""}
                  {g.gasScore}
                  <br />
                  <span style={{ fontSize: 10, fontWeight: 500, opacity: 0.9 }}>
                    {gasLabels[String(g.gasScore) as keyof typeof gasLabels] ||
                      ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
