"use client";
import { useState, useRef } from "react";
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
import type { Goal, GeneratedGoal, Submission, Patient } from "./types";
import {
  PATIENTS,
  PROGRESS_DATA,
  RADAR_DATA,
  COMPARE_DATA,
  INITIAL_GOALS,
  INIT_MESSAGES,
  GOAL_COLORS,
} from "./mockData";

// ─── Landing Page ─────────────────────────────────────────────────────────────
// ─── Landing Page ─────────────────────────────────────────────────────────────

interface LandingPageProps {
  setView: (view: "landing" | "doctor") => void;
}

function LandingPage({ setView }: LandingPageProps) {
  const router = useRouter();
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          background: "#2563eb",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path
            d="M16 4C9.4 4 4 9.4 4 16s5.4 12 12 12 12-5.4 12-12S22.6 4 16 4z"
            fill="white"
            fillOpacity="0.2"
          />
          <path
            d="M16 8v8l5 3"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle
            cx="16"
            cy="16"
            r="7"
            stroke="white"
            strokeWidth="2.5"
            fill="none"
          />
          <path
            d="M11 24.5c-1.5-1-2.5-2.5-3-4.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#1e293b",
          margin: "0 0 8px",
          textAlign: "center",
        }}
      >
        RehabPlatform
      </h1>
      <p
        style={{
          color: "#64748b",
          textAlign: "center",
          marginBottom: 32,
          maxWidth: 300,
          lineHeight: 1.6,
          fontSize: 14,
        }}
      >
        Реабилитационная платформа на основе WHODAS 2.0 и персонализированных
        SMART-целей
      </p>
      <div
        style={{
          width: "100%",
          maxWidth: 340,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <button
          onClick={() => router.push("/survey")}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 16,
            padding: "20px 24px",
            textAlign: "left",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLButtonElement).style.background = "#1d4ed8")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLButtonElement).style.background = "#2563eb")
          }
        >
          <div style={{ fontSize: 24, marginBottom: 6 }}>👤</div>
          <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>
            Я — пациент
          </div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>
            Заполнить опросник WHODAS 2.0
          </div>
        </button>
        <button
          onClick={() => setView("doctor")}
          style={{
            background: "white",
            color: "#1e293b",
            border: "2px solid #e2e8f0",
            borderRadius: 16,
            padding: "20px 24px",
            textAlign: "left",
            cursor: "pointer",
            transition: "border-color 0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLButtonElement).style.borderColor = "#93c5fd")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLButtonElement).style.borderColor = "#e2e8f0")
          }
        >
          <div style={{ fontSize: 24, marginBottom: 6 }}>🩺</div>
          <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>
            Я — врач
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>
            Панель управления и SMART-цели
          </div>
        </button>
      </div>
      <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 32 }}>
        MVP · Демонстрационная версия
      </p>
    </div>
  );
}

// ─── Doctor Dashboard ─────────────────────────────────────────────────────────

interface DoctorDashboardProps {
  onBack: () => void;
  submissions: Submission[];
}

function DoctorDashboard({ onBack, submissions }: DoctorDashboardProps) {
  const [patient, setPatient] = useState(PATIENTS[0]);
  const [tab, setTab] = useState<"overview" | "progress" | "goals" | "chat">(
    "overview"
  );
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [msgs, setMsgs] =
    useState<Array<{ role: "user" | "assistant"; content: string }>>(
      INIT_MESSAGES
    );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");
    const userMsg: { role: "user" | "assistant"; content: string } = {
      role: "user",
      content: userText,
    };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setLoading(true);

    try {
      const res = await fetch("/api/goals/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient: {
            name: patient.name,
            age: patient.age,
            diagnosis: patient.diagnosis,
            vas_rest: 2,
            vas_movement: 6,
            grip_strength_right: 25,
            grip_strength_left: 28,
            quick_dash_score: 35,
            recovery_phase: `Неделя ${patient.weeks}`,
          },
        }),
      });

      const data = await res.json();
      const generatedGoals: GeneratedGoal[] = data.goals || [];

      if (generatedGoals.length > 0) {
        const reply = `Сформулированы SMART-цели:\n\n${generatedGoals
          .map(
            (g, i) =>
              `${i + 1}. ${g.text}\n   Домен: ${g.domain}\n   Срок: ${g.timeBound}`
          )
          .join("\n\n")}`;

        setMsgs((prev) => [
          ...prev,
          { role: "assistant" as const, content: reply },
        ]);

        // Add goals to the goals list
        generatedGoals.forEach((g) => {
          const newGoal: Goal = {
            id: Date.now() + Math.random(),
            domain: g.domain || "Общая",
            color: GOAL_COLORS[goals.length % GOAL_COLORS.length],
            progress: 0,
            text: g.text || "",
            specific: g.specific || "",
            measurable: g.measurable || "",
            achievable: g.achievable || "",
            relevant: g.relevant || "",
            timeBound: g.timeBound || "",
          };
          setGoals((prev) => [...prev, newGoal]);
        });
      } else {
        setMsgs((prev) => [
          ...prev,
          {
            role: "assistant" as const,
            content: "Не удалось сформулировать цели. Попробуйте еще раз.",
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
    setLoading(false);
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
              {PATIENTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPatient(p)}
                  style={{
                    width: "100%",
                    background: patient.id === p.id ? "#eff6ff" : "none",
                    border:
                      patient.id === p.id
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
                        background: patient.id === p.id ? "#dbeafe" : "#f1f5f9",
                        color: patient.id === p.id ? "#1d4ed8" : "#64748b",
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
                    value: "2.3",
                    sub: "из 5.0",
                    color: "#1e293b",
                  },
                  {
                    label: "Улучшение",
                    value: "↓43%",
                    sub: "за 6 нед",
                    color: "#16a34a",
                  },
                  {
                    label: "Опросов",
                    value: "6",
                    sub: "заполнено",
                    color: "#1e293b",
                  },
                ].map((s2, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
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
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
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
                    setTab(t.id as "overview" | "progress" | "goals" | "chat")
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
            {tab === "overview" && <OverviewTab goals={goals} />}
            {tab === "progress" && <ProgressTab />}
            {tab === "goals" && <GoalsTab goals={goals} setGoals={setGoals} />}
            {tab === "chat" && (
              <ChatTab
                msgs={msgs}
                input={input}
                setInput={setInput}
                sendMessage={sendMessage}
                loading={loading}
                chatEnd={chatEnd as React.RefObject<HTMLDivElement>}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

interface OverviewTabProps {
  goals: Goal[];
}

function OverviewTab({ goals }: OverviewTabProps) {
  const goalsData = goals.map((g) => ({
    name: g.domain || "Цель",
    прогресс: g.progress,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 14,
        }}
      >
        {[
          {
            label: "Общий индекс",
            value: "2.3",
            sub: "шкала 1–5",
            color: "#2563eb",
          },
          {
            label: "Динамика",
            value: "↓43%",
            sub: "за период",
            color: "#16a34a",
          },
          {
            label: "Опросников",
            value: "6",
            sub: "заполнено",
            color: "#475569",
          },
          {
            label: "SMART-целей",
            value: goals.length,
            sub: "активных",
            color: "#7c3aed",
          },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              background: "white",
              borderRadius: 12,
              padding: "14px 16px",
              border: "1px solid #e2e8f0",
            }}
          >
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 4px" }}>
              {s.label}
            </p>
            <p
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: s.color,
                margin: "0 0 2px",
              }}
            >
              {s.value}
            </p>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{s.sub}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div
          style={{
            background: "white",
            borderRadius: 14,
            padding: 20,
            border: "1px solid #e2e8f0",
          }}
        >
          <h3
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "#374151",
              margin: "0 0 16px",
            }}
          >
            Профиль по доменам WHODAS 2.0
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart
              data={RADAR_DATA}
              margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
            >
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="domain"
                tick={{ fontSize: 11, fill: "#6b7280" }}
              />
              <PolarRadiusAxis
                domain={[0, 5]}
                tick={{ fontSize: 9, fill: "#9ca3af" }}
                tickCount={4}
              />
              <Radar
                name="Начало реабилитации"
                dataKey="start"
                stroke="#cbd5e1"
                fill="#cbd5e1"
                fillOpacity={0.35}
              />
              <Radar
                name="Текущее состояние"
                dataKey="current"
                stroke="#2563eb"
                fill="#2563eb"
                fillOpacity={0.45}
              />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Tooltip
                formatter={(v) => {
                  if (v === undefined || v === null) return ["", ""];
                  const val = typeof v === "number" ? v.toFixed(1) : String(v);
                  return [val, "Индекс"];
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div
          style={{
            background: "white",
            borderRadius: 14,
            padding: 20,
            border: "1px solid #e2e8f0",
          }}
        >
          <h3
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "#374151",
              margin: "0 0 16px",
            }}
          >
            Прогресс SMART-целей (%)
          </h3>
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
                <p style={{ fontSize: 12 }}>
                  Перейдите в «ИИ-чат» для создания
                </p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={Math.max(goals.length * 56 + 40, 200)}
            >
              <BarChart
                data={goalsData}
                layout="vertical"
                margin={{ left: 100, right: 30, top: 5, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  width={95}
                />
                <Tooltip
                  formatter={(v) => {
                    if (v === undefined || v === null) return ["", ""];
                    const val = typeof v === "number" ? `${v}%` : String(v);
                    return [val, "Прогресс"];
                  }}
                />
                <Bar dataKey="прогресс" radius={[0, 4, 4, 0]} maxBarSize={28}>
                  {goals.map((g, i) => (
                    <Cell key={i} fill={g.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Progress Tab ─────────────────────────────────────────────────────────────

function ProgressTab() {
  const DOMAIN_COLORS = {
    Когниция: "#2563eb",
    Мобильность: "#7c3aed",
    Самообслуж: "#d97706",
    Участие: "#059669",
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
          Динамика функциональных ограничений по неделям
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
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis
              domain={[1, 5]}
              reversed
              tick={{ fontSize: 12 }}
              tickCount={5}
            />
            <Tooltip
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
      <div
        style={{
          background: "white",
          borderRadius: 14,
          padding: 20,
          border: "1px solid #e2e8f0",
        }}
      >
        <h3
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#374151",
            margin: "0 0 16px",
          }}
        >
          Сравнение пациентов — текущий индекс WHODAS 2.0
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={COMPARE_DATA}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis dataKey="name" tick={{ fontSize: 13 }} />
            <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} tickCount={6} />
            <Tooltip
              formatter={(v) => {
                if (v === undefined || v === null) return ["", ""];
                const val = typeof v === "number" ? v.toFixed(1) : String(v);
                return [val, "Индекс WHODAS"];
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
              {PATIENTS.map((p, i) => (
                <Cell key={i} fill={p.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
          {PATIENTS.map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "#64748b",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: p.color,
                }}
              />
              {p.name.split(" ")[0]} {p.name.split(" ")[1]?.[0]}.
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Goals Tab ────────────────────────────────────────────────────────────────

interface GoalsTabProps {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
}

function GoalsTab({ goals, setGoals }: GoalsTabProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 12, color: "#94a3b8" }}>
                Прогресс выполнения
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: g.color }}>
                {g.progress}%
              </span>
            </div>
            <div style={{ background: "#f1f5f9", borderRadius: 99, height: 8 }}>
              <div
                style={{
                  width: `${g.progress}%`,
                  height: 8,
                  borderRadius: 99,
                  background: g.color,
                  transition: "width 0.4s",
                }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={g.progress}
              onChange={(e) =>
                setGoals((prev) =>
                  prev.map((x) =>
                    x.id === g.id
                      ? { ...x, progress: Number(e.target.value) }
                      : x
                  )
                )
              }
              style={{ width: "100%", marginTop: 6, accentColor: g.color }}
            />
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
      {goals.length > 0 && (
        <div
          style={{
            background: "white",
            borderRadius: 14,
            padding: 20,
            border: "1px solid #e2e8f0",
          }}
        >
          <h3
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "#374151",
              margin: "0 0 16px",
            }}
          >
            Сводный прогресс целей
          </h3>
          <ResponsiveContainer
            width="100%"
            height={Math.max(goals.length * 52 + 40, 160)}
          >
            <BarChart
              data={goals.map((g) => ({
                name: g.domain || "Цель",
                прогресс: g.progress,
              }))}
              layout="vertical"
              margin={{ left: 110, right: 40, top: 5, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#f1f5f9"
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                width={105}
              />
              <Tooltip
                formatter={(v) => {
                  if (v === undefined || v === null) return ["", ""];
                  const val = typeof v === "number" ? `${v}%` : String(v);
                  return [val, "Прогресс"];
                }}
              />
              <Bar dataKey="прогресс" radius={[0, 4, 4, 0]} maxBarSize={28}>
                {goals.map((g, i) => (
                  <Cell key={i} fill={g.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─── Chat Tab ─────────────────────────────────────────────────────────────────

interface ChatTabProps {
  msgs: Array<{ role: "user" | "assistant"; content: string }>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: () => void;
  loading: boolean;
  chatEnd: React.RefObject<HTMLDivElement>;
}

function ChatTab({
  msgs,
  input,
  setInput,
  sendMessage,
  loading,
  chatEnd,
}: ChatTabProps) {
  const SUGGESTIONS = [
    "Сформулируй SMART-цель для мобильности",
    "Цель по когнитивной реабилитации",
    "Что приоритетнее для данного пациента?",
    "Цель для восстановления самообслуживания",
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        height: "calc(100vh - 280px)",
        minHeight: 480,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "14px 14px 0 0",
          border: "1px solid #e2e8f0",
          borderBottom: "none",
          padding: "12px 16px",
          flexShrink: 0,
        }}
      >
        <p
          style={{ fontSize: 14, fontWeight: 500, color: "#1e293b", margin: 0 }}
        >
          ИИ-ассистент: формулирование SMART-целей
        </p>
        <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>
          Цели автоматически сохраняются на вкладке «Цели»
        </p>
      </div>
      <div
        style={{
          flex: 1,
          background: "white",
          border: "1px solid #e2e8f0",
          overflowY: "auto",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {msgs.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            {m.role === "assistant" && (
              <div
                style={{
                  width: 28,
                  height: 28,
                  background: "#2563eb",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                AI
              </div>
            )}
            <div
              style={{
                maxWidth: "78%",
                borderRadius:
                  m.role === "user"
                    ? "16px 16px 4px 16px"
                    : "16px 16px 16px 4px",
                padding: "10px 14px",
                fontSize: 13,
                lineHeight: 1.6,
                background: m.role === "user" ? "#2563eb" : "#f1f5f9",
                color: m.role === "user" ? "white" : "#1e293b",
              }}
            >
              <pre
                style={{
                  fontFamily: "inherit",
                  whiteSpace: "pre-wrap",
                  margin: 0,
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                {m.content}
              </pre>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                background: "#2563eb",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              AI
            </div>
            <div
              style={{
                background: "#f1f5f9",
                borderRadius: 16,
                padding: "10px 14px",
                display: "flex",
                gap: 5,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#94a3b8",
                    animation: "bounce 1.2s infinite",
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={chatEnd} />
      </div>
      <div
        style={{
          background: "white",
          borderRadius: "0 0 14px 14px",
          border: "1px solid #e2e8f0",
          borderTop: "none",
          padding: 12,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 10,
            flexWrap: "wrap",
          }}
        >
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => setInput(s)}
              style={{
                fontSize: 12,
                background: "#eff6ff",
                color: "#1d4ed8",
                border: "none",
                padding: "5px 12px",
                borderRadius: 99,
                cursor: "pointer",
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Введите запрос..."
            style={{
              flex: 1,
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              background: loading || !input.trim() ? "#e2e8f0" : "#2563eb",
              color: loading || !input.trim() ? "#94a3b8" : "white",
              border: "none",
              borderRadius: 10,
              padding: "10px 18px",
              cursor: loading || !input.trim() ? "default" : "pointer",
              fontSize: 15,
              transition: "background 0.2s",
            }}
          >
            →
          </button>
        </div>
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<"landing" | "doctor">("landing");
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {view === "landing" && <LandingPage setView={setView} />}
      {view === "doctor" && (
        <DoctorDashboard
          onBack={() => setView("landing")}
          submissions={submissions}
        />
      )}
    </div>
  );
}
