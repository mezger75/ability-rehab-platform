import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const patient_name = request.nextUrl.searchParams.get("patient_name");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("patient_name", patient_name)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error }, { status: 500 });

  const goals = (data || []).map((g) => ({
    id: g.id,
    domain: g.domain || "Общая",
    color: g.color || "#3b82f6",
    gasScore: g.gas_score || 0,
    text: g.text || "",
    specific: g.specific || "",
    measurable: g.measurable || "",
    achievable: g.achievable || "",
    relevant: g.relevant || "",
    timeBound: g.time_bound || "",
  }));

  return NextResponse.json({ goals });
}
