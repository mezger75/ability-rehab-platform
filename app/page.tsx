"use client";
import { useState, useRef } from "react";
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

// ─── WHODAS 2.0 Questions (12-item version) ───────────────────────────────────

const QUESTIONS = [
  {
    id: "D1_1",
    domain: "Когниция",
    text: "Насколько трудно было сосредоточиться на задаче дольше 10 минут?",
  },
  {
    id: "D1_2",
    domain: "Когниция",
    text: "Насколько трудно было запомнить и выполнить новое задание или инструкцию?",
  },
  {
    id: "D2_1",
    domain: "Мобильность",
    text: "Насколько трудно было стоять в течение длительного времени (около 30 минут)?",
  },
  {
    id: "D2_2",
    domain: "Мобильность",
    text: "Насколько трудно было встать со стула или пройти длинное расстояние?",
  },
  {
    id: "D3_1",
    domain: "Самообслуживание",
    text: "Насколько трудно было помыться (вымыть всё тело)?",
  },
  {
    id: "D3_2",
    domain: "Самообслуживание",
    text: "Насколько трудно было самостоятельно одеться?",
  },
  {
    id: "D4_1",
    domain: "Взаимодействие",
    text: "Насколько трудно было общаться с незнакомыми людьми?",
  },
  {
    id: "D4_2",
    domain: "Взаимодействие",
    text: "Насколько трудно было поддерживать дружеские или близкие отношения?",
  },
  {
    id: "D5_1",
    domain: "Жизнедеятельность",
    text: "Насколько трудно было справляться с повседневными домашними обязанностями?",
  },
  {
    id: "D5_2",
    domain: "Жизнедеятельность",
    text: "Насколько трудно было выполнять работу или учёбу?",
  },
  {
    id: "D6_1",
    domain: "Участие",
    text: "Насколько сильно проблемы со здоровьем влияли на вашу повседневную жизнь?",
  },
  {
    id: "D6_2",
    domain: "Участие",
    text: "Насколько ограничения здоровья вас расстраивали или тревожили?",
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

// ─── Mock Data ────────────────────────────────────────────────────────────────

const PATIENTS = [
  {
    id: "P001",
    name: "Алексей Волков",
    age: 45,
    diagnosis: "Ишемический инсульт",
    weeks: 6,
    avatar: "АВ",
    color: "#3b82f6",
  },
  {
    id: "P002",
    name: "Мария Соколова",
    age: 62,
    diagnosis: "Перелом шейки бедра",
    weeks: 4,
    avatar: "МС",
    color: "#8b5cf6",
  },
  {
    id: "P003",
    name: "Сергей Новиков",
    age: 38,
    diagnosis: "ЧМТ лёгкой степени",
    weeks: 8,
    avatar: "СН",
    color: "#10b981",
  },
];

const PROGRESS_DATA = [
  {
    week: "Нед 1",
    Когниция: 4.2,
    Мобильность: 4.5,
    Самообслуж: 3.8,
    Участие: 4.1,
  },
  {
    week: "Нед 2",
    Когниция: 3.8,
    Мобильность: 4.1,
    Самообслуж: 3.5,
    Участие: 3.9,
  },
  {
    week: "Нед 3",
    Когниция: 3.5,
    Мобильность: 3.8,
    Самообслуж: 3.2,
    Участие: 3.5,
  },
  {
    week: "Нед 4",
    Когниция: 3.0,
    Мобильность: 3.3,
    Самообслуж: 2.8,
    Участие: 3.1,
  },
  {
    week: "Нед 5",
    Когниция: 2.7,
    Мобильность: 2.9,
    Самообслуж: 2.5,
    Участие: 2.8,
  },
  {
    week: "Нед 6",
    Когниция: 2.3,
    Мобильность: 2.5,
    Самообслуж: 2.1,
    Участие: 2.5,
  },
];

const RADAR_DATA = [
  { domain: "Когниция", current: 2.3, start: 4.2 },
  { domain: "Мобильность", current: 2.5, start: 4.5 },
  { domain: "Самообслуж.", current: 2.1, start: 3.8 },
  { domain: "Взаимодейств.", current: 2.0, start: 3.2 },
  { domain: "Жизнедеят.", current: 2.4, start: 4.0 },
  { domain: "Участие", current: 2.5, start: 4.1 },
];

const COMPARE_DATA = [
  { name: "Волков А.", value: 2.3 },
  { name: "Соколова М.", value: 3.1 },
  { name: "Новиков С.", value: 1.9 },
];

const INITIAL_GOALS: Goal[] = [
  {
    id: 1,
    domain: "Мобильность",
    color: "#3b82f6",
    progress: 60,
    text: "Пройти без остановки 500 м к концу 8-й недели реабилитации",
    specific: "Самостоятельная ходьба без вспомогательных средств",
    measurable: "500 м за одну сессию без отдыха",
    achievable: "Текущий результат 150 м; плановый прирост 50 м/нед",
    relevant: "Необходимо для самостоятельного выхода из дома",
    timeBound: "8 недель (к 14-й неделе от начала реабилитации)",
  },
  {
    id: 2,
    domain: "Самообслуживание",
    color: "#8b5cf6",
    progress: 35,
    text: "Одеваться полностью самостоятельно за ≤10 мин через 4 недели",
    specific: "Полное одевание без посторонней помощи",
    measurable: "Время выполнения ≤10 минут",
    achievable: "Сейчас занимает 25 мин с частичной помощью",
    relevant: "Восстановление бытовой независимости",
    timeBound: "4 недели",
  },
  {
    id: 3,
    domain: "Когниция",
    color: "#f59e0b",
    progress: 45,
    text: "Удерживать внимание на задаче ≥20 мин через 6 недель",
    specific: "Выполнение когнитивных упражнений без перерыва",
    measurable: "20 минут непрерывной концентрации",
    achievable: "Текущий ресурс внимания 5–7 мин",
    relevant: "Необходимо для возврата к профессиональной деятельности",
    timeBound: "6 недель",
  },
];

const INIT_MESSAGES: Array<{ role: "user" | "assistant"; content: string }> = [
  {
    role: "assistant",
    content:
      "Добро пожаловать! Я ИИ-ассистент по реабилитации.\n\nПомогу сформулировать персонализированные SMART-цели для пациента Алексея Волкова (инсульт, 6-я неделя реабилитации).\n\nТекущие индексы WHODAS 2.0: Когниция 2.3 · Мобильность 2.5 · Самообслуживание 2.1 · Взаимодействие 2.0\n\nС чего начнём?",
  },
];

const GOAL_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#f97316",
  "#ec4899",
  "#06b6d4",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Goal {
  id: number;
  domain: string;
  color: string;
  progress: number;
  text: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
}

interface Submission {
  name: string;
  answers: Record<string, number>;
  scores: Array<{ domain: string; score: number }>;
  total: number;
  date: Date;
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

interface LandingPageProps {
  setView: (view: "landing" | "patient" | "doctor") => void;
}

function LandingPage({ setView }: LandingPageProps) {
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
          onClick={() => setView("patient")}
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

// ─── Patient Questionnaire ────────────────────────────────────────────────────

interface PatientQuestionnaireProps {
  onBack: () => void;
  onSubmit: (data: {
    name: string;
    answers: Record<string, number>;
    scores: Array<{ domain: string; score: number }>;
    total: number;
    date: Date;
  }) => void;
}

function PatientQuestionnaire({ onBack, onSubmit }: PatientQuestionnaireProps) {
  const [phase, setPhase] = useState<"intro" | "questions" | "done">("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  const progress = Math.round((step / QUESTIONS.length) * 100);
  const q = QUESTIONS[step];

  const handleAnswer = (value: number) => {
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);
    setSelected(value);
    setTimeout(() => {
      setSelected(null);
      if (step < QUESTIONS.length - 1) {
        setStep(step + 1);
      } else {
        const domainMap: Record<string, number[]> = {};
        QUESTIONS.forEach((q) => {
          if (!domainMap[q.domain]) domainMap[q.domain] = [];
          domainMap[q.domain].push(newAnswers[q.id] || 1);
        });
        const scores = Object.entries(domainMap).map(([domain, vals]) => ({
          domain,
          score:
            Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) /
            10,
        }));
        const total =
          Math.round(
            (scores.reduce((a, b) => a + b.score, 0) / scores.length) * 10
          ) / 10;
        onSubmit({
          name: name || "Пациент",
          answers: newAnswers,
          scores,
          total,
          date: new Date(),
        });
        setPhase("done");
      }
    }, 280);
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
      <div style={s.screen}>
        <div style={{ ...s.header, background: "#2563eb" }}>
          <button
            onClick={onBack}
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
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 4px" }}>
                Итоговый индекс ограничений
              </p>
              <div style={{ fontSize: 36, fontWeight: 700, color: "#1e293b" }}>
                {total}{" "}
                <span
                  style={{ fontSize: 16, fontWeight: 400, color: "#94a3b8" }}
                >
                  / 5
                </span>
              </div>
              <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>
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
          <button
            onClick={onBack}
            style={{
              width: "100%",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: 12,
              padding: 14,
              fontSize: 15,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  return (
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

    const systemPrompt = `Ты — опытный врач-реабилитолог, ИИ-ассистент. Помогаешь составлять SMART-цели реабилитации.

Пациент: ${patient.name}, ${patient.age} лет, диагноз: ${patient.diagnosis}, неделя реабилитации: ${patient.weeks}.
Текущие индексы WHODAS 2.0 (шкала 1–5, где 5 = полная неспособность):
Когниция: 2.3 · Мобильность: 2.5 · Самообслуживание: 2.1 · Взаимодействие: 2.0 · Жизнедеятельность: 2.4 · Участие: 2.5

При формулировании SMART-цели используй СТРОГО этот формат (каждый тег с новой строки):
SMART_GOAL: [формулировка цели]
SPECIFIC: [конкретность]
MEASURABLE: [измеримость]
ACHIEVABLE: [достижимость]
RELEVANT: [значимость для пациента]
TIME_BOUND: [срок]
DOMAIN: [один из: Мобильность / Когниция / Самообслуживание / Взаимодействие / Жизнедеятельность / Участие]

Отвечай по-русски, профессионально и лаконично. Если пользователь просто общается — общайся, без шаблона.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || "",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: newMsgs.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Ошибка ответа.";
      setMsgs((prev) => [
        ...prev,
        { role: "assistant" as const, content: reply },
      ]);

      if (reply.includes("SMART_GOAL:")) {
        const lines = reply.split("\n");
        const g: Partial<Goal> = {
          id: Date.now(),
          progress: 0,
          color: GOAL_COLORS[goals.length % GOAL_COLORS.length],
        };
        lines.forEach((l: string) => {
          const kv = (prefix: string) => {
            if (l.trim().startsWith(prefix))
              return l.replace(prefix, "").trim();
            return null;
          };
          const smartGoal = kv("SMART_GOAL:");
          const specific = kv("SPECIFIC:");
          const measurable = kv("MEASURABLE:");
          const achievable = kv("ACHIEVABLE:");
          const relevant = kv("RELEVANT:");
          const timeBound = kv("TIME_BOUND:");
          const domain = kv("DOMAIN:");

          if (smartGoal) g.text = smartGoal;
          if (specific) g.specific = specific;
          if (measurable) g.measurable = measurable;
          if (achievable) g.achievable = achievable;
          if (relevant) g.relevant = relevant;
          if (timeBound) g.timeBound = timeBound;
          if (domain) g.domain = domain;
        });
        if (
          g.text &&
          g.specific &&
          g.measurable &&
          g.achievable &&
          g.relevant &&
          g.timeBound &&
          g.domain
        ) {
          setGoals((prev) => [...prev, g as Goal]);
        }
      }
    } catch {
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
  const [view, setView] = useState<"landing" | "patient" | "doctor">("landing");
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {view === "landing" && <LandingPage setView={setView} />}
      {view === "patient" && (
        <PatientQuestionnaire
          onBack={() => setView("landing")}
          onSubmit={(data) => {
            setSubmissions((prev) => [data, ...prev]);
          }}
        />
      )}
      {view === "doctor" && (
        <DoctorDashboard
          onBack={() => setView("landing")}
          submissions={submissions}
        />
      )}
    </div>
  );
}
