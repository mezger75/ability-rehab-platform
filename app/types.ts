// ─── Types ────────────────────────────────────────────────────────────────────

export interface Goal {
  id: number;
  domain: string;
  color: string;
  gasScore: number; // -2 to +2
  text: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
}

export interface GeneratedGoal {
  text: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
  domain: string;
}

export interface Submission {
  name: string;
  answers: Record<string, number>;
  scores: Array<{ domain: string; score: number }>;
  total: number;
  date: Date;
}

export interface Patient {
  id: string | number;
  name: string;
  age: number;
  diagnosis: string;
  weeks: number;
  avatar: string;
  color?: string;
  domainScores?: {
    cognition: number;
    mobility: number;
    self_care: number;
    interaction: number;
    life_activities: number;
    participation: number;
  };
}
