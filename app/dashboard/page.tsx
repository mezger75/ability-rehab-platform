"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { Goal, GeneratedGoal, Submission, Patient } from "../types";
import { INITIAL_GOALS, INIT_MESSAGES, GOAL_COLORS } from "../mockData";
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

// ─── Doctor Dashboard ─────────────────────────────────────────────────────────

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
  const [tab, setTab] = useState<"overview" | "progress" | "goals" | "chat">(
    "overview"
  );
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [msgs, setMsgs] =
    useState<Array<{ role: "user" | "assistant"; content: string }>>(
      INIT_MESSAGES
    );
  const [input, setInput] = useState("");
  const [loadingGoals, setLoadingGoals] = useState(false);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/survey");
        const result = await res.json();

        if (result.data && result.data.length > 0) {
          // Transform survey responses into Patient objects
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
          // Set first patient as selected if none selected
          if (!patient && surveyPatients.length > 0) {
            setPatient(surveyPatients[0]);
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

  const chatEnd = useRef<HTMLDivElement>(null);

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
        const reply = `Сформулированы SMART-цели:\n\n${data.goals
          .map(
            (g: GeneratedGoal, i: number) =>
              `${i + 1}. ${g.text}\n   Домен: ${g.domain}\n   Срок: ${g.timeBound}`
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

  const tabs = [
    { id: "overview", label: "Обзор" },
    { id: "progress", label: "Прогресс" },
    { id: "goals", label: `Цели (${goals.length})` },
    { id: "chat", label: "ИИ-чат" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top bar */}
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
              R
            </span>
          </div>
          <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 15 }}>
            RehabPlatform
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

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <aside
          style={{
            width: 220,
            background: "white",
            borderRight: "1px solid #e2e8f0",
            flexShrink: 0,
            overflowY: "auto",
          }}
        >
          <div style={{ padding: 16 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 10,
              }}
            >
              Пациенты
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {patients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPatient(p)}
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
            {submissions.length > 0 && (
              <>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    margin: "16px 0 8px",
                  }}
                >
                  Новые опросы
                </p>
                {submissions.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: 8,
                      padding: "8px 10px",
                      marginBottom: 4,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#166534",
                        margin: 0,
                      }}
                    >
                      {s.name}
                    </p>
                    <p style={{ fontSize: 11, color: "#16a34a", margin: 0 }}>
                      Индекс: {s.total}/5
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>
        </aside>

        {/* Main */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
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
              {/* Patient header */}
              <div
                style={{
                  background: "white",
                  borderBottom: "1px solid #e2e8f0",
                  padding: "16px 24px",
                  flexShrink: 0,
                }}
              >
                <div
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
                      {patient.diagnosis} · {patient.age} лет · Неделя{" "}
                      {patient.weeks}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 20 }}>
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
                <div style={{ display: "flex", gap: 4 }}>
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

              <div style={{ padding: 24, flex: 1 }}>
                {tab === "overview" && (
                  <OverviewTab goals={goals} patient={patient} />
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

// ─── Default Export ───────────────────────────────────────────────────────────

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
