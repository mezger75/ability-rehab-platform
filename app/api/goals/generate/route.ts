import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { patient } = body

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

Отвечай строго в формате JSON массива без дополнительного текста.`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  )

  const data = await response.json()
  const text = data.candidates[0].content.parts[0].text
  const clean = text.replace(/```json|```/g, '').trim()
  const goals = JSON.parse(clean)

  return NextResponse.json({ goals })
}