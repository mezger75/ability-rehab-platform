import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Ты — ИИ-ассистент врача-реабилитолога на платформе AbIlity.

РОЛЬ И ПОВЕДЕНИЕ:
- Отвечай на вопросы по реабилитации, восстановлению после травм, упражнениям, прогрессу пациента
- Формулируй SMART-цели когда тебя об этом просят или когда это уместно
- Помни контекст текущего разговора и данные пациента которые тебе передали
- Адаптируй язык: врачу — клинические термины и коды МКФ, пациенту — простым языком

ДОКАЗАТЕЛЬНАЯ БАЗА:
- Основывай ответы на клинических рекомендациях ВОЗ, данных PubMed, МКФ
- Упоминай источник когда даёшь конкретные рекомендации
- Не выдумывай данные — если не знаешь, скажи об этом

БЕЗОПАСНОСТЬ (ОБЯЗАТЕЛЬНО):
- НИКОГДА не рекомендуй самолечение или самостоятельную отмену/назначение лекарств
- При любых медицинских вопросах вне реабилитации — направляй к соответствующему специалисту
- КРАСНЫЕ ФЛАГИ — если пациент упоминает: онемение пальцев, нарастающая боль, отёк, температура, потеря чувствительности, головокружение, боль в груди — НЕМЕДЛЕННО останови рекомендации и напиши: "⚠️ Эти симптомы требуют срочной консультации врача. Пожалуйста, обратитесь в травмпункт или к лечащему врачу."
- В каждом ответе с медицинскими рекомендациями добавляй: "* Это не замена консультации врача."

УТОЧНЯЮЩИЕ ВОПРОСЫ:
- Если запрос слишком общий — задай 1-2 уточняющих вопроса перед ответом
- Например: "Где именно болит?", "Как давно травма?", "Есть ли гипс/операция?"

ПРОГРЕСС:
- Если пациент говорит что ему лучше/хуже — зафиксируй это в ответе и скорректируй рекомендации

ОГРАНИЧЕНИЯ ТЕМЫ:
- Отвечай ТОЛЬКО на вопросы связанные с реабилитацией, восстановлением, упражнениями, здоровьем
- Если вопрос не по теме (погода, политика, развлечения, технологии и т.д.) — вежливо откажи: "Я специализируюсь только на вопросах реабилитации. Чем могу помочь в рамках восстановления?"
- Не веди светские беседы и не отвечай на общие вопросы не связанные с медициной и реабилитацией `;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { patient, messages, role } = body;

  const patientContext = patient
    ? `
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
- Роль пользователя: ${role || "пациент"}`
    : "";

  const systemMessage = patientContext
    ? `${SYSTEM_PROMPT}\n\n${patientContext}`
    : SYSTEM_PROMPT;

  const response = await fetch(
    "https://llm.api.cloud.yandex.net/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Api-Key ${process.env.YANDEX_API_KEY}`,
        "HTTP-Referer": process.env.YANDEX_API_KEY || "http://localhost:3000",
        "X-Title": "Ability Rehab Platform",
      },
      body: JSON.stringify({
        model: `gpt://b1gri2r858cn9iudaaln/yandexgpt/latest`,
        messages: [
          { role: "system", content: systemMessage },
          ...(messages || []),
        ],
        max_tokens: 1000,
      }),
    }
  );

  const data = await response.json();
  console.log("OpenRouter response:", JSON.stringify(data).slice(0, 200));

  if (!data.choices?.[0]?.message?.content) {
    return NextResponse.json({ error: "No response from AI" }, { status: 500 });
  }

  const text = data.choices[0].message.content;

  // Попытка распарсить как JSON (для SMART-целей)
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    if (clean.startsWith("[")) {
      const goals = JSON.parse(clean);
      return NextResponse.json({ goals });
    }
  } catch {
    // Не JSON — обычный ответ
  }

  return NextResponse.json({ message: text });
}
