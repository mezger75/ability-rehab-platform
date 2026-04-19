"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Goal, GeneratedGoal, Submission, Patient } from "../types";
import { GOAL_COLORS } from "../mockData";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { OverviewTab } from "./OverviewTab";
import { ProgressTab } from "./ProgressTab";
import { GoalsTab } from "./GoalsTab";
import { ChatTab } from "./ChatTab";

// Wrapper component to apply font family
function DashboardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {children}
    </div>
  );
}

interface DoctorDashboardProps {
  onBack: () => void;
  submissions: Submission[];
}

interface SurveyResponse {
  id: string | number;
  patient_name: string;
  created_at: string;
  domain_scores: {
    cognition: number;
    mobility: number;
    self_care: number;
    interaction: number;
    life_activities: number;
    participation: number;
  };
}

function DoctorDashboard({ onBack, submissions }: DoctorDashboardProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<"overview" | "progress" | "goals" | "chat">(
    "overview"
  );
  const [gasLoading, setGasLoading] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [msgs, setMsgs] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const [loadingGoals, setLoadingGoals] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Сформулируй SMART-цель для мобильности",
    "Цель по когнитивной реабилитации",
    "Что приоритетнее для данного пациента?",
    "Цель для восстановления самообслуживания",
  ]);
  const chatEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (patient) {
      const domainScores = patient.domainScores;
      const initialMessage = domainScores
        ? `Добро пожаловать! Я AI-ассистент по реабилитации.\n\nПомогу сформулировать персонализированные SMART-цели для пациента ${patient.name}.\n\nТекущие индексы WHODAS 2.0:\nПознание и коммуникация ${domainScores.cognition.toFixed(1)} · Мобильность ${domainScores.mobility.toFixed(1)} · Самообслуживание ${domainScores.self_care.toFixed(1)} · Межличностные взаимодействия ${domainScores.interaction.toFixed(1)} · Повседневная деятельность ${domainScores.life_activities.toFixed(1)} · Жизнь в обществе ${domainScores.participation.toFixed(1)}\n\nС чего начнём?`
        : `Добро пожаловать! Я AI-ассистент по реабилитации.\n\nПомогу сформулировать персонализированные SMART-цели для пациента ${patient.name}.\n\nС чего начнём?`;
      setMsgs([{ role: "assistant", content: initialMessage }]);
    }
  }, [patient]);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/survey");
        const result = await res.json();
        if (result.data && result.data.length > 0) {
          const surveyPatients: Patient[] = result.data.map(
            (survey: SurveyResponse) => ({
              id: survey.id,
              name: survey.patient_name || "Пациент",
              age: 0,
              diagnosis: "Данные из опроса WHODAS",
              avatar: survey.patient_name?.[0]?.toUpperCase() || "П",
              weeks: 0,
              domainScores: survey.domain_scores,
            })
          );
          setPatients(surveyPatients);
          if (!patient && surveyPatients.length > 0) {
            setPatient(surveyPatients[0]);
            // Загружаем цели для первого пациента
            const goalsRes = await fetch(
              `/api/goals?patient_name=${encodeURIComponent(surveyPatients[0].name)}`
            );
            const goalsData = await goalsRes.json();
            if (goalsData.goals) {
              setGoals(goalsData.goals);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching surveys:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSurveys();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loadingGoals) return;
    const userText = input.trim();
    setInput("");
    const userMsg: { role: "user" | "assistant"; content: string } = {
      role: "user",
      content: userText,
    };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setLoadingGoals(true);

    try {
      const res = await fetch("/api/goals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient: {
            name: patient?.name,
            age: patient?.age,
            diagnosis: patient?.diagnosis,
            vas_rest: 2,
            vas_movement: 6,
            grip_strength_right: 25,
            grip_strength_left: 28,
            quick_dash_score: 35,
            recovery_phase: `Неделя ${patient?.weeks}`,
          },
          messages: [
            ...newMsgs.map((m) => ({ role: m.role, content: m.content })),
          ],
          role: "doctor",
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
        setMsgs((prev) => [
          ...prev,
          { role: "assistant" as const, content: reply },
        ]);
        data.goals.forEach((g: GeneratedGoal) => {
          const newGoal: Goal = {
            id: Date.now() + Math.random(),
            domain: g.domain || "Общая",
            color: GOAL_COLORS[goals.length % GOAL_COLORS.length],
            gasScore: 0,
            text: g.text || "",
            specific: g.specific || "",
            measurable: g.measurable || "",
            achievable: g.achievable || "",
            relevant: g.relevant || "",
            timeBound: g.timeBound || "",
          };
          setGoals((prev) => [...prev, newGoal]);
        });
      } else if (data.message) {
        setMsgs((prev) => [
          ...prev,
          { role: "assistant" as const, content: data.message },
        ]);
        // Update suggestions if provided
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
        }
      } else {
        setMsgs((prev) => [
          ...prev,
          {
            role: "assistant" as const,
            content: "Не удалось получить ответ. Попробуйте еще раз.",
          },
        ]);
      }
    } catch (error) {
      console.error("Error calling goals API:", error);
      setMsgs((prev) => [
        ...prev,
        { role: "assistant" as const, content: "Ошибка соединения с API." },
      ]);
    }
    setLoadingGoals(false);
    setTimeout(
      () => chatEnd.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  const updateGasStatus = async () => {
    setGasLoading(true);
    try {
      const res = await fetch("/api/goals/gas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goals, patient_name: patient?.name }),
      });
      const data = await res.json();
      if (data.gasResults) {
        setGoals((prev) =>
          prev.map((goal, index) => {
            const gasResult = data.gasResults.find(
              (r: { goalIndex: number; status: number }) =>
                r.goalIndex === index
            );
            return gasResult ? { ...goal, gasScore: gasResult.status } : goal;
          })
        );
      }
    } catch (error) {
      console.error("GAS error:", error);
    }
    setGasLoading(false);
  };

  const tabs = [
    { id: "overview", label: "Обзор" },
    { id: "progress", label: "Прогресс" },
    { id: "goals", label: `Цели (${goals.length})` },
    { id: "chat", label: "AI-чат" },
  ];

  return (
    <div
      style={{
        height: "100vh",
        background: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      className="dashboard-container"
    >
      <style>{`
        .desktop-sidebar {
          width: 220px;
          background: white;
          border-right: 1px solid #e2e8f0;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
        }
        .sidebar-overlay {
          display: none;
        }
        .sidebar-panel {
          display: none;
        }
        .mobile-menu-btn {
          display: none;
        }
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block;
          }
          .desktop-sidebar {
            display: none;
          }
          .dashboard-container .patient-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding: 12px 16px;
          }
          .dashboard-container .patient-info {
            width: 100%;
            margin-bottom: 8px;
            gap: 12px;
          }
          .dashboard-container .patient-info > div:first-child {
            display: flex;
            align-items: center;
            gap: 16px;
            width: 100%;
          }
          .dashboard-container .patient-stats {
            width: 100%;
            justify-content: space-between;
          }
          .dashboard-container .tabs-container {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .dashboard-container .tabs-container > div {
            min-width: max-content;
          }
          .dashboard-container main {
            overflow-y: auto;
          }
          .dashboard-container .tab-content {
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            padding: 16px;
            overflow-x: hidden;
          }
          .sidebar-overlay {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
          }
          .sidebar-overlay.open {
            opacity: 1;
            pointer-events: auto;
          }
          .sidebar-panel {
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            width: 280px;
            background: white;
            z-index: 1000;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            flex-direction: column;
            box-shadow: 2px 0 12px rgba(0, 0, 0, 0.1);
          }
          .sidebar-panel.open {
            transform: translateX(0);
          }
        }
      `}</style>
      <header
        style={{
          background: "white",
          borderBottom: "1px solid #e2e8f0",
          padding: "0 20px",
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              fontSize: 18,
              padding: "4px 8px",
            }}
            className="mobile-menu-btn"
            title="Выбрать пациента"
          >
            ☰
          </button>
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: 18,
              padding: "4px 8px",
            }}
          >
            ←
          </button>
          <div
            style={{
              width: 28,
              height: 28,
              background: "#2563eb",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>
              A
            </span>
          </div>
          <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 15 }}>
            Ability
          </span>
          <span
            style={{
              fontSize: 11,
              background: "#f1f5f9",
              color: "#64748b",
              padding: "2px 8px",
              borderRadius: 99,
            }}
          >
            Врач
          </span>
        </div>
        {submissions.length > 0 && (
          <div
            style={{
              fontSize: 12,
              color: "#16a34a",
              background: "#dcfce7",
              padding: "4px 12px",
              borderRadius: 99,
              fontWeight: 500,
            }}
          >
            +{submissions.length} новых опросов
          </div>
        )}
      </header>

      <div
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside className={`sidebar-panel ${sidebarOpen ? "open" : ""}`}>
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: 0,
            }}
          >
            Пациенты
          </p>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: 20,
              padding: "4px 8px",
            }}
          >
            ×
          </button>
        </div>
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {patients.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setPatient(p);
                  setSidebarOpen(false);
                }}
                style={{
                  width: "100%",
                  background: patient?.id === p.id ? "#eff6ff" : "none",
                  border:
                    patient?.id === p.id
                      ? "1px solid #bfdbfe"
                      : "1px solid transparent",
                  borderRadius: 10,
                  padding: "10px 12px",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: patient?.id === p.id ? "#dbeafe" : "#f1f5f9",
                      color: patient?.id === p.id ? "#1d4ed8" : "#64748b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {p.avatar}
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#1e293b",
                        margin: 0,
                      }}
                    >
                      {p.name}
                    </p>
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
                      {p.diagnosis}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <aside className="desktop-sidebar">
          <div style={{ padding: "16px 16px 12px" }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                margin: 0,
              }}
            >
              Пациенты
            </p>
          </div>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "0 16px 16px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {patients.map((p) => (
                <button
                  key={p.id}
                  onClick={async () => {
                    setPatient(p);
                    const goalsRes = await fetch(
                      `/api/goals?patient_name=${encodeURIComponent(p.name)}`
                    );
                    const goalsData = await goalsRes.json();
                    if (goalsData.goals) setGoals(goalsData.goals);
                  }}
                  style={{
                    width: "100%",
                    background: patient?.id === p.id ? "#eff6ff" : "none",
                    border:
                      patient?.id === p.id
                        ? "1px solid #bfdbfe"
                        : "1px solid transparent",
                    borderRadius: 10,
                    padding: "10px 12px",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background:
                          patient?.id === p.id ? "#dbeafe" : "#f1f5f9",
                        color: patient?.id === p.id ? "#1d4ed8" : "#64748b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {p.avatar}
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#1e293b",
                          margin: 0,
                        }}
                      >
                        {p.name}
                      </p>
                      <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
                        {p.diagnosis}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {!patient ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#94a3b8",
                fontSize: 16,
              }}
            >
              {loading ? (
                <DashboardSkeleton />
              ) : patients.length === 0 ? (
                "Нет данных пациентов"
              ) : (
                "Выберите пациента из списка"
              )}
            </div>
          ) : (
            <>
              <div
                className="patient-header"
                style={{
                  background: "white",
                  borderBottom: "1px solid #e2e8f0",
                  padding: "16px 24px",
                  flexShrink: 0,
                }}
              >
                <div
                  className="patient-info"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      background: "#dbeafe",
                      color: "#1d4ed8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      fontSize: 15,
                    }}
                  >
                    {patient.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#1e293b",
                        margin: 0,
                      }}
                    >
                      {patient.name}
                    </h2>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
                      {patient.diagnosis}
                    </p>
                  </div>
                  <div
                    className="patient-stats"
                    style={{ display: "flex", gap: 20 }}
                  >
                    {[
                      {
                        label: "Индекс WHODAS",
                        value: patient.domainScores
                          ? (
                              (patient.domainScores.cognition +
                                patient.domainScores.mobility +
                                patient.domainScores.self_care +
                                patient.domainScores.interaction +
                                patient.domainScores.life_activities +
                                patient.domainScores.participation) /
                              6
                            ).toFixed(1)
                          : "—",
                        sub: "из 5.0",
                        color: "#1e293b",
                      },
                      {
                        label: "Улучшение",
                        value: "—",
                        sub: "нет данных",
                        color: "#94a3b8",
                      },
                      {
                        label: "Опросов",
                        value: "1",
                        sub: "заполнено",
                        color: "#1e293b",
                      },
                    ].map((s2, i) => (
                      <div key={i} style={{ textAlign: "center" }}>
                        <p
                          style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}
                        >
                          {s2.label}
                        </p>
                        <p
                          style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: s2.color,
                            margin: "2px 0 0",
                          }}
                        >
                          {s2.value}
                        </p>
                        <p
                          style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}
                        >
                          {s2.sub}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  className="tabs-container"
                  style={{ display: "flex", gap: 4 }}
                >
                  {tabs.map((t) => (
                    <button
                      key={t.id}
                      onClick={() =>
                        setTab(
                          t.id as "overview" | "progress" | "goals" | "chat"
                        )
                      }
                      style={{
                        padding: "6px 16px",
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 500,
                        background: tab === t.id ? "#2563eb" : "none",
                        color: tab === t.id ? "white" : "#64748b",
                        transition: "all 0.15s",
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className="tab-content"
                style={{
                  paddingTop: 12,
                  paddingBottom: 12,
                  paddingLeft: 24,
                  paddingRight: 24,
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                }}
              >
                {tab === "overview" && (
                  <OverviewTab
                    goals={goals}
                    patient={patient}
                    onUpdateGas={updateGasStatus}
                    gasLoading={gasLoading}
                  />
                )}
                {tab === "progress" && <ProgressTab />}
                {tab === "goals" && (
                  <GoalsTab goals={goals} setGoals={setGoals} />
                )}
                {tab === "chat" && (
                  <ChatTab
                    msgs={msgs}
                    input={input}
                    setInput={setInput}
                    sendMessage={sendMessage}
                    loading={loadingGoals}
                    chatEnd={chatEnd as React.RefObject<HTMLDivElement>}
                    suggestions={suggestions}
                  />
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  return (
    <DashboardWrapper>
      <DoctorDashboard
        onBack={() => router.push("/")}
        submissions={submissions}
      />
    </DashboardWrapper>
  );
}
