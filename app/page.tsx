"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ConsentModal from "./ConsentModal";

// ─── Landing Page ─────────────────────────────────────────────────────────────

function LandingPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
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
        Ability
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
          onClick={() => setShowModal(true)}
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
          onClick={() => router.push("/dashboard")}
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

      <ConsentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => router.push("/survey")}
      />
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <LandingPage />
    </div>
  );
}
