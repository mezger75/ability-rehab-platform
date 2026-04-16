"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

// ─── Exercises Page ──────────────────────────────────────────────────────────

interface Exercise {
  id: number;
  name: string;
  emoji: string;
  description: string;
  duration: string;
  difficulty: "Лёгкое" | "Среднее" | "Сложное";
}

const EXERCISES: Exercise[] = [
  {
    id: 1,
    name: "Растяжка шеи",
    emoji: "🧘",
    description:
      "Медленные круговые движения головой для расслабления мышц шеи и плеч",
    duration: "5 мин",
    difficulty: "Лёгкое",
  },
  {
    id: 2,
    name: "Упражнения на равновесие",
    emoji: "⚖️",
    description:
      "Стояние на одной ноге для улучшения проприоцепции и координации",
    duration: "10 мин",
    difficulty: "Среднее",
  },
  {
    id: 3,
    name: "Приседания",
    emoji: "🏋️",
    description: "Контролируемые приседания для укрепления мышц ног и спины",
    duration: "8 мин",
    difficulty: "Среднее",
  },
  {
    id: 4,
    name: "Ходьба на месте",
    emoji: "🚶",
    description: "Спокойная ходьба на месте с высоким подниманием колен",
    duration: "10 мин",
    difficulty: "Лёгкое",
  },
  {
    id: 5,
    name: "Отжимания от стены",
    emoji: "💪",
    description: "Упражнение для укрепления грудных мышц и мышц рук",
    duration: "7 мин",
    difficulty: "Среднее",
  },
  {
    id: 6,
    name: "Дыхательная гимнастика",
    emoji: "🫁",
    description:
      "Глубокое дыхание и релаксация для улучшения дыхательной функции",
    duration: "5 мин",
    difficulty: "Лёгкое",
  },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  Лёгкое: "#10b981",
  Среднее: "#f59e0b",
  Сложное: "#ef4444",
};

export default function ExercisesPage() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          display: "flex",
          flexDirection: "column" as const,
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "white",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: "1px solid #059669",
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              borderRadius: 8,
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 18,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.3)")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.2)")
            }
          >
            ←
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, opacity: 0.9 }}>Ваши упражнения</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              💪 ЛФК программа
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "16px", overflowY: "auto" }}>
          {/* Info Card */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              border: "1px solid #e2e8f0",
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <div style={{ fontSize: 32 }}>📌</div>
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1e293b",
                  marginBottom: 4,
                }}
              >
                Важная информация
              </div>
              <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
                Выполняйте упражнения ежедневно в одно и то же время. Начните с
                лёгких упражнений и постепенно переходите к более сложным.
              </div>
            </div>
          </div>

          {/* Exercises List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {EXERCISES.map((exercise) => (
              <div
                key={exercise.id}
                style={{
                  background: "white",
                  borderRadius: 14,
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                  transition: "all 0.2s",
                  boxShadow:
                    expandedId === exercise.id
                      ? "0 4px 12px rgba(0,0,0,0.1)"
                      : "none",
                }}
              >
                {/* Exercise Header - Clickable */}
                <div
                  onClick={() =>
                    setExpandedId(
                      expandedId === exercise.id ? null : exercise.id
                    )
                  }
                  style={{
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                    background:
                      expandedId === exercise.id ? "#f8fafc" : "white",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (expandedId !== exercise.id) {
                      (e.currentTarget as HTMLElement).style.background =
                        "#f8fafc";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (expandedId !== exercise.id) {
                      (e.currentTarget as HTMLElement).style.background =
                        "white";
                    }
                  }}
                >
                  <div style={{ fontSize: 28 }}>{exercise.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#1e293b",
                      }}
                    >
                      {exercise.name}
                    </div>
                    <div
                      style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}
                    >
                      {exercise.duration} • {exercise.difficulty}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      color: "#cbd5e1",
                      transform:
                        expandedId === exercise.id
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  >
                    ▼
                  </div>
                </div>

                {/* Exercise Details - Expandable */}
                {expandedId === exercise.id && (
                  <div
                    style={{
                      padding: "12px 16px 16px",
                      borderTop: "1px solid #e2e8f0",
                      background: "#f8fafc",
                      animation: "slideDown 0.2s ease-out",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        color: "#475569",
                        lineHeight: 1.6,
                        margin: "0 0 12px 0",
                      }}
                    >
                      {exercise.description}
                    </p>

                    {/* Difficulty Badge */}
                    <div
                      style={{
                        display: "inline-block",
                        background:
                          DIFFICULTY_COLORS[exercise.difficulty] + "20",
                        color: DIFFICULTY_COLORS[exercise.difficulty],
                        padding: "4px 12px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {exercise.difficulty}
                    </div>

                    {/* Action Buttons */}
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 12,
                      }}
                    >
                      <button
                        style={{
                          flex: 1,
                          background: "#3b82f6",
                          color: "white",
                          border: "none",
                          borderRadius: 10,
                          padding: "8px 12px",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          ((e.target as HTMLButtonElement).style.background =
                            "#2563eb")
                        }
                        onMouseLeave={(e) =>
                          ((e.target as HTMLButtonElement).style.background =
                            "#3b82f6")
                        }
                      >
                        ▶️ Начать
                      </button>
                      <button
                        style={{
                          flex: 1,
                          background: "white",
                          color: "#3b82f6",
                          border: "2px solid #3b82f6",
                          borderRadius: 10,
                          padding: "8px 12px",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLButtonElement).style.background =
                            "#eff6ff";
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLButtonElement).style.background =
                            "white";
                        }}
                      >
                        📝 Подробнее
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer Spacing */}
          <div style={{ height: 20 }} />
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
