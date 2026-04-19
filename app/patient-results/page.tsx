"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// ─── Patient Results Page ──────────────────────────────────────────────────────

interface Goal {
  id: number;
  domain: string;
  color: string;
  progress: number;
  text: string;
  description?: string;
  specific?: string;
  measurable?: string;
  achievable?: string;
  relevant?: string;
  timeBound?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Mock SMART goals for patient
const PATIENT_GOALS: Goal[] = [
  {
    id: 1,
    domain: "Мобильность",
    color: "#3b82f6",
    progress: 0,
    text: "Пройти 500 м без остановки",
    description: "Восстановление двигательной активности и выносливости",
    specific: "Самостоятельная ходьба без вспомогательных средств",
    measurable: "500 м за одну сессию без отдыха",
    achievable: "Текущий результат 300 м; плановый прирост 50 м/нед",
    relevant: "Необходимо для самостоятельного выхода из дома",
    timeBound: "8 недель (к 14-й неделе от начала реабилитации)",
  },
  {
    id: 2,
    domain: "Самообслуживание",
    color: "#8b5cf6",
    progress: 0,
    text: "Одеваться самостоятельно за 10 мин",
    description: "Восстановление навыков самообслуживания и независимости",
    specific: "Полное одевание без посторонней помощи",
    measurable: "Время выполнения ≤10 минут",
    achievable: "Сейчас занимает 25 мин с частичной помощью",
    relevant: "Восстановление бытовой независимости",
    timeBound: "4 недели",
  },
  {
    id: 3,
    domain: "Познание и коммуникация",
    color: "#f59e0b",
    progress: 0,
    text: "Концентрация внимания ≥20 мин",
    description: "Улучшение когнитивных функций для возврата к работе",
    specific: "Выполнение когнитивных упражнений без перерыва",
    measurable: "20 минут непрерывной концентрации",
    achievable: "Текущий ресурс внимания 5–7 мин, прирост 2-3 мин/нед",
    relevant: "Необходимо для возврата к профессиональной деятельности",
    timeBound: "6 недель",
  },
];

// Mock initial AI messages
const INITIAL_MESSAGES: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Привет! 👋 Я твой персональный AI-ассистент по реабилитации.\n\nМою работу вижу в том, чтобы помочь тебе:\n✓ Отслеживать прогресс по целям\n✓ Добавлять новые SMART-цели\n✓ Получать рекомендации\n\nКак у тебя дела? Хочешь добавить новую цель?",
  },
];

interface GeneratedGoal {
  text: string;
  domain: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
}

function PatientResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientName = searchParams.get("name") || "Пациент";

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [goals, setGoals] = useState<Goal[]>(PATIENT_GOALS);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const [suggestions, setSuggestions] = useState<string[]>([
    "Как улучшить мобильность?",
    "Упражнения для восстановления",
    "Когда ожидать результаты?",
    "Что делать при боли?",
  ]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    const userMessage = inputValue.trim();
    setInputValue("");
    const newMessages = [
      ...messages,
      { role: "user" as const, content: userMessage },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/goals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient: {
            name: patientName,
            age: 0,
            diagnosis: "Данные из опроса WHODAS",
            vas_rest: 2,
            vas_movement: 6,
            grip_strength_right: 25,
            grip_strength_left: 28,
            quick_dash_score: 35,
            recovery_phase: "Неделя 1",
          },
          messages: [
            ...newMessages.map((m) => ({ role: m.role, content: m.content })),
          ],
          role: "patient",
        }),
      });

      const data = await res.json();

      if (data.goals && data.goals.length > 0) {
        const reply =
          data.message ||
          `Сформулированы SMART-цели:\n\n${data.goals
            .map(
              (g: GeneratedGoal, i: number) =>
                `${i + 1}. ${g.text}\n\n   S: ${g.specific}\n   M: ${g.measurable}\n   A: ${g.achievable}\n   R: ${g.relevant}\n   T: ${g.timeBound}`
            )
            .join("\n\n")}`;
        setMessages((prev) => [
          ...prev,
          { role: "assistant" as const, content: reply },
        ]);

        // Add generated goals to the goals list
        data.goals.forEach((g: GeneratedGoal) => {
          const newGoal: Goal = {
            id: Date.now() + Math.random(),
            domain: g.domain || "Общая",
            color: "#3b82f6",
            progress: 0,
            text: g.text || "",
            description: g.relevant || "",
            specific: g.specific || "",
            measurable: g.measurable || "",
            achievable: g.achievable || "",
            relevant: g.relevant || "",
            timeBound: g.timeBound || "",
          };
          setGoals((prev) => [...prev, newGoal]);
        });
      } else if (data.message) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant" as const, content: data.message },
        ]);

        // Update suggestions if provided
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant" as const,
            content: "Не удалось получить ответ. Попробуйте еще раз.",
          },
        ]);
      }
    } catch (error) {
      console.error("Error calling goals API:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant" as const, content: "Ошибка соединения с API." },
      ]);
    }
    setIsLoading(false);
  };

  const handleBack = () => {
    router.push("/");
  };

  const renderGoalDiagram = (goal: Goal) => {
    const data = [
      { name: "Progress", value: goal.progress },
      { name: "Remaining", value: 100 - goal.progress },
    ];

    return (
      <div
        key={goal.id}
        onClick={() => setSelectedGoal(goal)}
        style={{
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          padding: 8,
          borderRadius: 12,
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "#f8fafc";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
      >
        <div style={{ position: "relative", width: "100%", height: 120 }}>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={28}
                outerRadius={45}
                fill="#8884d8"
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                <Cell fill={goal.color} />
                <Cell fill="#f0f4f8" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1e293b" }}>
              {goal.progress}%
            </div>
            <div style={{ fontSize: 8, color: "#94a3b8" }}>прогресс</div>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#1e293b",
              marginBottom: 2,
            }}
          >
            {goal.domain}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#64748b",
              lineHeight: 1.4,
              width: "100%",
              textAlign: "center",
              whiteSpace: "normal",
              overflow: "hidden",
            }}
          >
            {goal.text}
          </div>
          {goal.timeBound && (
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
              🕐 {goal.timeBound}
            </div>
          )}
        </div>
      </div>
    );
  };

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
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            color: "white",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: "1px solid #2563eb",
          }}
        >
          <button
            onClick={handleBack}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              borderRadius: 8,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ←
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, opacity: 0.9 }}>Ваш прогресс</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              📊 Мой путь реабилитации
            </div>
          </div>
        </div>

        {/* Main Content - Mobile First with Desktop Adaptations */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column" as const,
            overflow: "hidden",
            maxWidth: "100%",
          }}
          className="desktop-layout"
        >
          {/* Goals Section - Full Screen */}
          <div
            style={{
              flex: 1,
              padding: "16px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column" as const,
            }}
            className="goals-section"
          >
            {/* Summary Card */}
            <div
              style={{
                background: "white",
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                border: "1px solid #e2e8f0",
                flex: "0 0 auto",
              }}
            >
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                📋 Активные цели реабилитации
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}>
                {goals.length} целей в разработке
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#94a3b8",
                  marginTop: 4,
                  lineHeight: 1.6,
                }}
              >
                Средний прогресс:{" "}
                <span style={{ color: "#3b82f6", fontWeight: 600 }}>
                  {Math.round(
                    goals.reduce((a, b) => a + b.progress, 0) / goals.length
                  )}
                  %
                </span>
              </div>
            </div>

            {/* Goals Diagrams - Responsive Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
                marginBottom: 16,
              }}
              className="goals-grid"
            >
              {goals.map((goal) => renderGoalDiagram(goal))}
            </div>

            {/* Exercises Button */}
            <button
              onClick={() => router.push("/exercises")}
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
                border: "none",
                borderRadius: 14,
                padding: "14px 16px",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseDown={(e) => {
                (e.target as HTMLButtonElement).style.transform = "scale(0.98)";
              }}
              onMouseUp={(e) => {
                (e.target as HTMLButtonElement).style.transform = "scale(1)";
              }}
            >
              💪 Упражнения ЛФК
            </button>
          </div>
        </div>
      </div>

      {/* Floating AI Chat Button */}
      <button
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          justifyContent: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: "pointer",
          zIndex: 999,
          background: "none",
          border: "none",
          padding: 0,
        }}
        onClick={() => setIsChatOpen(true)}
      >
        <div
          className="ai-chat-button"
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            border: "none",
            color: "white",
            borderRadius: 16,
            width: 64,
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 28,
            transition: "transform 0.2s, box-shadow 0.2s",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.transform = "scale(1.1)";
            (e.target as HTMLElement).style.boxShadow =
              "0 6px 20px rgba(59, 130, 246, 0.5)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.transform = "scale(1)";
            (e.target as HTMLElement).style.boxShadow =
              "0 4px 12px rgba(59, 130, 246, 0.4)";
          }}
        >
          💬
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#3b82f6",
            marginTop: 4,
            textShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          AI-чат
        </div>
      </button>

      {/* Goal Details Modal */}
      {selectedGoal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column" as const,
            animation: "fadeIn 0.2s ease-out",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setSelectedGoal(null)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: "24px",
              maxWidth: 500,
              maxHeight: "85vh",
              overflowY: "auto",
              animation: "slideUp 0.3s ease-out",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  background: selectedGoal.color + "20",
                  padding: "6px 12px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  color: selectedGoal.color,
                }}
              >
                {selectedGoal.domain}
              </div>
              <button
                onClick={() => setSelectedGoal(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                  color: "#94a3b8",
                }}
              >
                ✕
              </button>
            </div>

            {/* Progress */}
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: selectedGoal.color,
                  }}
                >
                  {selectedGoal.progress}%
                </div>
                <div style={{ fontSize: 14, color: "#94a3b8" }}>завершено</div>
              </div>
              <div
                style={{
                  width: "100%",
                  height: 8,
                  background: "#f1f5f9",
                  borderRadius: 99,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${selectedGoal.progress}%`,
                    height: "100%",
                    background: selectedGoal.color,
                    borderRadius: 99,
                  }}
                />
              </div>
            </div>

            {/* Goal Text */}
            <h2
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#1e293b",
                marginBottom: 16,
              }}
            >
              {selectedGoal.text}
            </h2>

            <p
              style={{
                fontSize: 14,
                color: "#64748b",
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
              {selectedGoal.description}
            </p>

            {/* SMART Criteria */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                {
                  label: "Specific (Конкретная)",
                  value: selectedGoal.specific,
                },
                {
                  label: "Measurable (Измеримая)",
                  value: selectedGoal.measurable,
                },
                {
                  label: "Achievable (Достижимая)",
                  value: selectedGoal.achievable,
                },
                {
                  label: "Relevant (Актуальная)",
                  value: selectedGoal.relevant,
                },
                {
                  label: "Time-bound (Ограниченная сроком)",
                  value: selectedGoal.timeBound,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: "#f8fafc",
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#3b82f6",
                      marginBottom: 4,
                    }}
                  >
                    ✓ {item.label}
                  </div>
                  <div
                    style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedGoal(null)}
              style={{
                width: "100%",
                marginTop: 24,
                background: selectedGoal.color,
                color: "white",
                border: "none",
                borderRadius: 12,
                padding: "12px 16px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {isChatOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column" as const,
            animation: "fadeIn 0.2s ease-out",
          }}
          onClick={() => setIsChatOpen(false)}
        >
          {/* Chat Modal Content */}
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              background: "white",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              display: "flex",
              flexDirection: "column" as const,
              maxHeight: "85vh",
              minHeight: "60vh",
              zIndex: 1001,
              boxShadow: "0 -10px 40px rgba(0,0,0,0.1)",
              animation: "slideUp 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "16px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flex: "0 0 auto",
              }}
            >
              <div>
                <div style={{ fontSize: 13, color: "#64748b" }}>
                  AI Ассистент
                </div>
                <div
                  style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}
                >
                  🤖 Помощник по реабилитации
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: "4px 8px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Messages Container */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px",
                display: "flex",
                flexDirection: "column" as const,
                gap: 12,
              }}
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent:
                      msg.role === "user" ? "flex-end" : "flex-start",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      maxWidth: "80%",
                      padding: "10px 14px",
                      borderRadius: 14,
                      background: msg.role === "user" ? "#3b82f6" : "#f1f5f9",
                      color: msg.role === "user" ? "white" : "#1e293b",
                      fontSize: 14,
                      lineHeight: 1.5,
                    }}
                  >
                    <div
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: msg.content
                          .replace(
                            /### (.*?)(\n|$)/g,
                            "<strong>$1</strong><br/>"
                          )
                          .replace(
                            /## (.*?)(\n|$)/g,
                            "<strong>$1</strong><br/>"
                          )
                          .replace(/# (.*?)(\n|$)/g, "<strong>$1</strong><br/>")
                          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                          .replace(/\*(.*?)\*/g, "<em>$1</em>")
                          .replace(/\n/g, "<br/>"),
                      }}
                    />
                  </div>
                </div>
              ))}
              {isLoading && (
                <div style={{ display: "flex", gap: 4 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#cbd5e1",
                      animation: "pulse 1.4s ease-in-out infinite",
                    }}
                  />
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#cbd5e1",
                      animation: "pulse 1.4s ease-in-out 0.2s infinite",
                    }}
                  />
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#cbd5e1",
                      animation: "pulse 1.4s ease-in-out 0.4s infinite",
                    }}
                  />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div
              style={{
                flex: "0 0 auto",
                padding: "12px 16px 24px",
                borderTop: "1px solid #e2e8f0",
                background: "white",
              }}
            >
              {/* Suggestions */}
              <div className="patient-suggestions">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setInputValue(s)}
                    style={{
                      fontSize: 12,
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      border: "none",
                      padding: "5px 12px",
                      borderRadius: 99,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Напиши сообщение..."
                  autoFocus
                  style={{
                    flex: 1,
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: "10px 14px",
                    fontSize: 14,
                    outline: "none",
                    background: "#f8fafc",
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  style={{
                    background:
                      inputValue.trim() && !isLoading ? "#3b82f6" : "#cbd5e1",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    width: 44,
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor:
                      inputValue.trim() && !isLoading ? "pointer" : "default",
                    fontSize: 18,
                    transition: "background 0.2s",
                  }}
                >
                  ↗️
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles for animations and responsive design */}
      <style>{`
        @keyframes pulse {
          0%, 60%, 100% {
            opacity: 0.3;
          }
          30% {
            opacity: 1;
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

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-150%) rotate(45deg);
          }
          100% {
            transform: translateX(250%) rotate(45deg);
          }
        }

        .ai-chat-button::before {
          content: '';
          position: absolute;
          top: -100%;
          left: -100%;
          width: 80%;
          height: 300%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.6),
            transparent
          );
          animation: shimmer 2.4s ease-in-out infinite;
        }

        /* Desktop layout: side-by-side */
        @media (min-width: 768px) {
          .desktop-layout {
            flex-direction: row !important;
            overflow: visible !important;
          }

          .goals-section {
            flex: "0 0 45%" !important;
            max-height: 100% !important;
            border-right: 1px solid #e2e8f0;
            padding: 24px !important;
            overflow-y: auto;
          }

          .chat-section {
            flex: 1 !important;
            min-height: auto !important;
            border-top: none !important;
          }

          .goals-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }

          .input-area {
            padding: 16px 24px 24px !important;
          }
        }

        /* Mobile: horizontal scroll for suggestions */
        .patient-suggestions {
          display: flex;
          gap: 6px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }
        @media (max-width: 767px) {
          .patient-suggestions {
            flex-wrap: nowrap;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .patient-suggestions::-webkit-scrollbar {
            display: none;
          }
        }

        /* Large desktop */
        @media (min-width: 1024px) {
          .goals-section {
            flex: "0 0 40%" !important;
          }

          .goals-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function PatientResults() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PatientResultsContent />
    </Suspense>
  );
}
