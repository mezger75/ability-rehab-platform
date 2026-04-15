import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { patient_id, answers } = body;

  // Считаем total_score
  const total_score = Object.values(answers as Record<string, number>).reduce(
    (sum: number, val: number) => sum + val,
    0
  );

  // Считаем domain_scores
  const domain_scores = {
    cognition: (answers.D1_1 + answers.D1_2) / 2,
    mobility: (answers.D2_1 + answers.D2_2) / 2,
    self_care: (answers.D3_1 + answers.D3_2) / 2,
    interaction: (answers.D4_1 + answers.D4_2) / 2,
    life_activities: (answers.D5_1 + answers.D5_2) / 2,
    participation: (answers.D6_1 + answers.D6_2) / 2,
  };

  const { data, error } = await supabase
    .from("survey_responses")
    .insert({
      patient_id,
      answers,
      total_score,
      domain_scores,
    })
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const patient_id = searchParams.get("patient_id");

  const { data, error } = await supabase
    .from("survey_responses")
    .select("*")
    .eq("patient_id", patient_id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
