import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { goals, patient_name } = body;

  // Берём историю опросников из Supabase
  const { data: surveys } = await supabase
    .from("survey_responses")
    .select("*")
    .eq("patient_name", patient_name)
    .order("created_at", { ascending: true });

  const surveyHistory = surveys || [];

  const prompt = `Ты — AI-ассистент врача-реабилитолога. Проанализируй динамику восстановления пациента и определи GAS статус для каждой цели.

Пациент: ${patient_name}

История опросников WHODAS (от старого к новому):
${surveyHistory
  .map(
    (s, i) => `
Визит ${i + 1} (${new Date(s.created_at).toLocaleDateString("ru-RU")}):
- Общий балл: ${s.total_score}/60
- Когниция: ${s.domain_scores?.cognition}
- Мобильность: ${s.domain_scores?.mobility}
- Самообслуживание: ${s.domain_scores?.self_care}
- Взаимодействие: ${s.domain_scores?.interaction}
- Жизнедеятельность: ${s.domain_scores?.life_activities}
- Участие: ${s.domain_scores?.participation}
`
  )
  .join("")}

SMART-цели пациента:
${goals.map((g: { domain: string; text: string; timeBound: string }, i: number) => `${i + 1}. [${g.domain}] ${g.text} (срок: ${g.timeBound})`).join("\n")}

Для каждой цели определи GAS статус:
-2: нет прогресса
-1: прогресс есть но цель не достигнута
0: цель достигнута как ожидалось
+1: результат превзошёл ожидания
+2: значительно превзошёл ожидания

Отвечай строго в формате JSON массива без дополнительного текста:
[{"goalIndex": 0, "status": 0, "label": "Цель", "explanation": "краткое объяснение"}]`;

  const response = await fetch(
    "https://llm.api.cloud.yandex.net/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Api-Key ${process.env.YANDEX_API_KEY}`,
      },
      body: JSON.stringify({
        model: `gpt://b1gri2r858cn9iudaaln/yandexgpt/latest`,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
      }),
    }
  );

  const data = await response.json();
  const text = data.choices[0].message.content;
  console.log("GAS raw:", text?.substring(0, 300));
  const clean = text.replace(/```json|```/g, "").trim();
  console.log("GAS clean:", clean?.substring(0, 300));
  const gasResults = JSON.parse(clean);
  console.log("GAS results:", gasResults);
  return NextResponse.json({ gasResults });
}
