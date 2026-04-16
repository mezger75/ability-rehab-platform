import type { Goal, Patient } from "../types";
import { WHODASProfileChart } from "./WHODASProfileChart";
import { GoalAchievementStatus } from "./GoalAchievementStatus";

interface OverviewTabProps {
  goals: Goal[];
  patient: Patient | null;
}

export function OverviewTab({ goals, patient }: OverviewTabProps) {
  if (!patient) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "#94a3b8",
          fontSize: 16,
        }}
      >
        Выберите пациента
      </div>
    );
  }
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
            sub: "шкала 1–5",
            color: "#2563eb",
          },
          {
            label: "Динамика",
            value: "—",
            sub: "нет данных",
            color: "#94a3b8",
          },
          {
            label: "Опросников",
            value: "1",
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
        <WHODASProfileChart patient={patient} />
        <GoalAchievementStatus goals={goals} />
      </div>
    </div>
  );
}
