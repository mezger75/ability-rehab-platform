"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Wrapper component to apply font family
function SurveyWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {children}
    </div>
  );
}

// ─── WHODAS 2.0 Questions (12-item version) ───────────────────────────────────

const QUESTIONS = [
  {
    id: "D1_1",
    domain: "Когниция",
    text: "Насколько трудно Вам было сосредоточиться на каком-либо занятии в течение 10 минут?",
  },
  {
    id: "D1_2",
    domain: "Когниция",
    text: "Насколько трудно Вам было освоить новую задачу, например, запомнить дорогу в незнакомое место?",
  },
  {
    id: "D2_1",
    domain: "Мобильность",
    text: "Насколько трудно Вам было стоять в течение длительного времени, например, 30 минут?",
  },
  {
    id: "D2_2",
    domain: "Мобильность",
    text: "Насколько трудно Вам было пройти пешком большое расстояние, например, 1 километр (или полмили)?",
  },
  {
    id: "D3_1",
    domain: "Самообслуживание",
    text: "Насколько трудно Вам было вымыть всё своё тело целиком?",
  },
  {
    id: "D3_2",
    domain: "Самообслуживание",
    text: "Насколько трудно Вам было одеться?",
  },
  {
    id: "D4_1",
    domain: "Взаимодействие",
    text: "Насколько трудно Вам было взаимодействовать с незнакомыми людьми?",
  },
  {
    id: "D4_2",
    domain: "Взаимодействие",
    text: "Насколько трудно Вам было поддерживать дружеские отношения?",
  },
  {
    id: "D5_1",
    domain: "Жизнедеятельность",
    text: "Насколько трудно Вам было справляться с Вашими домашними делами и обязанностями?",
  },
  {
    id: "D5_2",
    domain: "Жизнедеятельность",
    text: "Насколько трудно Вам было выполнять Вашу основную работу или учёбу (повседневные дела)?",
  },
  {
    id: "D6_1",
    domain: "Участие",
    text: "Насколько проблематично для Вас было участвовать в общественных мероприятиях (например, праздниках, встречах) наравне с другими людьми?",
  },
  {
    id: "D6_2",
    domain: "Участие",
    text: "Насколько сильно Ваши проблемы со здоровьем выбивали Вас из колеи или угнетали эмоционально?",
  },
];

const SCALE = [
  { value: 1, label: "Нет", desc: "Никаких затруднений", color: "#22c55e" },
  { value: 2, label: "Легко", desc: "Небольшие затруднения", color: "#84cc16" },
  {
    value: 3,
    label: "Умеренно",
    desc: "Умеренные затруднения",
    color: "#eab308",
  },
  {
    value: 4,
    label: "Тяжело",
    desc: "Выраженные затруднения",
    color: "#f97316",
  },
  { value: 5, label: "Не могу", desc: "Не могу выполнить", color: "#ef4444" },
];

// ─── Patient Questionnaire ────────────────────────────────────────────────────

export default function PatientQuestionnaire() {
  const router = useRouter();
  const [phase, setPhase] = useState<"intro" | "questions" | "done">("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  const progress = Math.round((step / QUESTIONS.length) * 100);
  const q = QUESTIONS[step];

  const handleAnswer = async (value: number) => {
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);
    setSelected(value);
    setTimeout(async () => {
      setSelected(null);
      if (step < QUESTIONS.length - 1) {
        setStep(step + 1);
      } else {
        const domainMap: Record<string, number[]> = {};
        QUESTIONS.forEach((q) => {
          if (!domainMap[q.domain]) domainMap[q.domain] = [];
          domainMap[q.domain].push(newAnswers[q.id] || 1);
        });

        // Send data to API
        try {
          const response = await fetch("/api/survey", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              patient_name: name || "Пациент",
              answers: newAnswers,
            }),
          });

          if (!response.ok) {
            console.error("Failed to save survey data");
          }
        } catch (error) {
          console.error("Error saving survey data:", error);
        }

        setPhase("done");

        // Redirect to patient results after 2 seconds
        setTimeout(() => {
          router.push("/patient-results");
        }, 2000);
      }
    }, 280);
  };

  const handleBack = () => {
    router.push("/");
  };

  const s: Record<string, React.CSSProperties> = {
    screen: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column" as const,
      background: "#f8fafc",
    },
    header: {
      background: "white",
      borderBottom: "1px solid #e2e8f0",
      padding: "14px 16px",
      display: "flex",
      alignItems: "center",
      gap: 12,
    },
    back: {
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#94a3b8",
      fontSize: 18,
      padding: 4,
    },
    card: {
      background: "white",
      borderRadius: 16,
      padding: 20,
      border: "1px solid #e2e8f0",
      marginBottom: 12,
    },
    body: {
      flex: 1,
      padding: 16,
      maxWidth: 480,
      margin: "0 auto",
      width: "100%",
    },
  };

  if (phase === "intro")
    return (
      <SurveyWrapper>
        <div style={s.screen}>
          <div style={{ ...s.header, background: "#2563eb" }}>
            <button
              onClick={handleBack}
              style={{ ...s.back, color: "rgba(255,255,255,0.7)" }}
            >
              ←
            </button>
            <span style={{ color: "white", fontWeight: 500 }}>
              Опросник WHODAS 2.0
            </span>
          </div>
          <div style={s.body}>
            <div style={s.card}>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: "#1e293b",
                    margin: "0 0 8px",
                  }}
                >
                  Оценка состояния здоровья
                </h2>
                <p
                  style={{
                    color: "#64748b",
                    fontSize: 14,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  ВОЗ Опросник Оценки Нарушений (WHODAS 2.0) — стандартный
                  инструмент оценки функциональных ограничений
                </p>
              </div>
              <div
                style={{
                  background: "#eff6ff",
                  borderRadius: 12,
                  padding: "12px 16px",
                  marginBottom: 16,
                }}
              >
                <p
                  style={{
                    color: "#1d4ed8",
                    fontSize: 13,
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  📌 12 вопросов · ~5 минут · За последние 30 дней
                </p>
              </div>
              <div style={{ marginBottom: 16 }}>
                {[
                  "Когнитивные функции",
                  "Мобильность",
                  "Самообслуживание",
                  "Взаимодействие",
                  "Жизнедеятельность",
                  "Участие в жизни общества",
                ].map((d, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "6px 0",
                      borderBottom: i < 5 ? "1px solid #f1f5f9" : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "#dbeafe",
                        color: "#2563eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {i + 1}
                    </div>
                    <span style={{ fontSize: 14, color: "#475569" }}>{d}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    color: "#64748b",
                    marginBottom: 6,
                  }}
                >
                  Ваше имя
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Введите имя"
                  style={{
                    width: "100%",
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: 15,
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>
              <button
                onClick={() => setPhase("questions")}
                style={{
                  width: "100%",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  padding: "14px",
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Начать опрос →
              </button>
            </div>
          </div>
        </div>
      </SurveyWrapper>
    );

  if (phase === "done") {
    const domainMap: Record<string, number[]> = {};
    QUESTIONS.forEach((q2) => {
      if (!domainMap[q2.domain]) domainMap[q2.domain] = [];
      domainMap[q2.domain].push(answers[q2.id] || 1);
    });
    const scores = Object.entries(domainMap).map(([domain, vals]) => ({
      domain,
      score:
        Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10,
    }));
    const total =
      Math.round(
        (scores.reduce((a, b) => a + b.score, 0) / scores.length) * 10
      ) / 10;
    const getColor = (v: number) =>
      v <= 2 ? "#22c55e" : v <= 3.5 ? "#eab308" : "#ef4444";

    return (
      <SurveyWrapper>
        <div style={s.screen}>
          <div style={{ ...s.header, background: "#16a34a" }}>
            <span style={{ color: "white", fontWeight: 500 }}>
              ✓ Опрос завершён
            </span>
          </div>
          <div style={s.body}>
            <div style={s.card}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: "#1e293b",
                    margin: "0 0 4px",
                  }}
                >
                  Спасибо, {name || "пациент"}!
                </h2>
                <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
                  Ответы отправлены вашему врачу
                </p>
              </div>
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                <p
                  style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 4px" }}
                >
                  Итоговый индекс ограничений
                </p>
                <div
                  style={{ fontSize: 36, fontWeight: 700, color: "#1e293b" }}
                >
                  {total}{" "}
                  <span
                    style={{ fontSize: 16, fontWeight: 400, color: "#94a3b8" }}
                  >
                    / 5
                  </span>
                </div>
                <p
                  style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}
                >
                  {total <= 2
                    ? "Лёгкие ограничения"
                    : total <= 3.5
                      ? "Умеренные ограничения"
                      : "Выраженные ограничения"}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column" as const,
                  gap: 8,
                }}
              >
                {scores.map(({ domain, score }) => (
                  <div
                    key={domain}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        color: "#64748b",
                        width: 130,
                        flexShrink: 0,
                      }}
                    >
                      {domain}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        background: "#f1f5f9",
                        borderRadius: 99,
                        height: 8,
                      }}
                    >
                      <div
                        style={{
                          width: `${(score / 5) * 100}%`,
                          height: 8,
                          borderRadius: 99,
                          background: getColor(score),
                          transition: "width 0.5s",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#334155",
                        width: 28,
                        textAlign: "right",
                      }}
                    >
                      {score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 12,
                flexDirection: "column" as const,
              }}
            >
              <button
                onClick={() => router.push("/patient-results")}
                style={{
                  width: "100%",
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  padding: 14,
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLButtonElement).style.background = "#2563eb")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLButtonElement).style.background = "#3b82f6")
                }
              >
                Посмотреть результаты и цели →
              </button>
              <button
                onClick={handleBack}
                style={{
                  width: "100%",
                  background: "white",
                  color: "#3b82f6",
                  border: "2px solid #3b82f6",
                  borderRadius: 12,
                  padding: 14,
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background = "#eff6ff";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background = "white";
                }}
              >
                На главную
              </button>
            </div>
          </div>
        </div>
      </SurveyWrapper>
    );
  }

  return (
    <SurveyWrapper>
      <div style={s.screen}>
        <div
          style={{
            background: "white",
            borderBottom: "1px solid #e2e8f0",
            padding: "12px 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <button
              onClick={() =>
                step > 0 ? setStep((s2) => s2 - 1) : setPhase("intro")
              }
              style={s.back}
            >
              ←
            </button>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>
              {step + 1} из {QUESTIONS.length}
            </span>
            <div
              style={{
                flex: 1,
                background: "#e2e8f0",
                borderRadius: 99,
                height: 6,
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: 6,
                  borderRadius: 99,
                  background: "#2563eb",
                  transition: "width 0.3s",
                }}
              />
            </div>
            <span style={{ fontSize: 12, color: "#2563eb", fontWeight: 500 }}>
              {progress}%
            </span>
          </div>
          <span
            style={{
              fontSize: 12,
              background: "#dbeafe",
              color: "#1d4ed8",
              padding: "3px 10px",
              borderRadius: 99,
              fontWeight: 500,
            }}
          >
            {q.domain}
          </span>
        </div>
        <div
          style={{
            flex: 1,
            padding: "24px 16px",
            maxWidth: 480,
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>
            За последние 30 дней...
          </p>
          <h3
            style={{
              fontSize: 19,
              fontWeight: 500,
              color: "#1e293b",
              marginBottom: 28,
              lineHeight: 1.5,
            }}
          >
            {q.text}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SCALE.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleAnswer(opt.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 14,
                  border:
                    selected === opt.value
                      ? `2px solid ${opt.color}`
                      : answers[q.id] === opt.value
                        ? `2px solid ${opt.color}`
                        : "2px solid #e2e8f0",
                  background:
                    selected === opt.value
                      ? `${opt.color}15`
                      : answers[q.id] === opt.value
                        ? `${opt.color}10`
                        : "white",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    border: `2px solid ${opt.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {(selected === opt.value || answers[q.id] === opt.value) && (
                    <div
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: opt.color,
                      }}
                    />
                  )}
                </div>
                <div>
                  <div
                    style={{ fontSize: 15, fontWeight: 500, color: "#1e293b" }}
                  >
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>
                    {opt.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </SurveyWrapper>
  );
}
