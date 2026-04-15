import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { patient } = body;

  const prompt = `Ты — ИИ-ассистент врача-реабилитолога. На основе данных пациента сформулируй 2-3 персонализированные SMART-цели реабилитации.

Данные пациента:
- Имя: ${patient.name}
- Возраст: ${patient.age}
- Диагноз: ${patient.diagnosis}
- Боль в покое (ВАШ): ${patient.vas_rest}/10
- Боль при движении (ВАШ): ${patient.vas_movement}/10
- Сила хвата правая: ${patient.grip_strength_right} кг
- Сила хвата левая: ${patient.grip_strength_left} кг
- QuickDASH балл: ${patient.quick_dash_score}
- Этап восстановления: ${patient.recovery_phase}

Для каждой цели укажи:
- text: формулировка цели
- specific: конкретность
- measurable: измеримость
- achievable: достижимость
- relevant: значимость
- timeBound: срок
- domain: область (Мобильность / Самообслуживание / Боль / Сила)

Отвечай строго в формате JSON массива без дополнительного текста.`;

  const response = await fetch(process.env.NEXT_PUBLIC_OPENROUTER_API_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY_1!}`,
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Ability Rehab Platform",
    },
    body: JSON.stringify({
      model: "openrouter/free",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    }),
  });

  const data = await response.json();
  const text = data.choices[0].message.content;
  const clean = text.replace(/```json|```/g, "").trim();
  const goals = JSON.parse(clean);

  return NextResponse.json({ goals });
}
