"use client";
import { useState, useRef } from "react";

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConsentModal({
  isOpen,
  onClose,
  onConfirm,
}: ConsentModalProps) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [dataChecked, setDataChecked] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setScrolledToBottom(true);
      }
    }
  };

  const handleConfirm = () => {
    if (consentChecked && dataChecked) {
      onConfirm();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: 20,
          maxWidth: 600,
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "24px 24px 16px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#1e293b",
              margin: 0,
            }}
          >
            Важная информация
          </h2>
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            padding: "24px",
            overflowY: "auto",
            flex: 1,
            fontSize: 14,
            lineHeight: 1.7,
            color: "#334155",
          }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#dc2626",
              marginTop: 0,
              marginBottom: 12,
            }}
          >
            ⚠️ Медицинский дисклеймер
          </h3>
          <p style={{ marginBottom: 16 }}>
            Данная платформа является вспомогательным инструментом для
            реабилитации и <strong>не заменяет консультацию врача</strong>.
            ИИ-ассистент предоставляет информацию исключительно в
            образовательных целях и не ставит диагнозы.
          </p>
          <p style={{ marginBottom: 16 }}>
            Все рекомендации, полученные через платформу, должны быть
            согласованы с вашим лечащим врачом. Не принимайте медицинских
            решений на основании информации от ИИ-ассистента без предварительной
            консультации со специалистом.
          </p>
          <p style={{ marginBottom: 24 }}>
            В случае ухудшения самочувствия, появления новых симптомов или
            экстренной ситуации немедленно обратитесь к врачу или вызовите
            скорую помощь.
          </p>

          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#1e293b",
              marginBottom: 12,
            }}
          >
            🔒 Обработка персональных данных
          </h3>
          <p style={{ marginBottom: 16 }}>
            Используя данную платформу, вы соглашаетесь на обработку ваших
            персональных данных, включая:
          </p>
          <ul style={{ marginBottom: 16, paddingLeft: 24 }}>
            <li>Имя и контактную информацию</li>
            <li>Медицинские данные из опросника WHODAS 2.0</li>
            <li>Информацию о состоянии здоровья и прогрессе реабилитации</li>
            <li>Историю взаимодействия с ИИ-ассистентом</li>
          </ul>
          <p style={{ marginBottom: 16 }}>
            Ваши данные используются исключительно для предоставления услуг
            платформы и не передаются третьим лицам без вашего согласия. Данные
            хранятся в зашифрованном виде и защищены в соответствии с
            требованиями законодательства о защите персональных данных.
          </p>
          <p style={{ marginBottom: 16 }}>
            Вы имеете право запросить удаление ваших данных в любой момент,
            обратившись к администратору платформы.
          </p>
          <p style={{ marginBottom: 0, fontSize: 13, color: "#64748b" }}>
            Версия документа: 1.0 от 18.04.2026
          </p>
        </div>

        <div
          style={{
            padding: "20px 24px",
            borderTop: "1px solid #e2e8f0",
            background: "#f8fafc",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              marginBottom: 12,
              cursor: scrolledToBottom ? "pointer" : "not-allowed",
              opacity: scrolledToBottom ? 1 : 0.4,
            }}
          >
            <input
              type="checkbox"
              disabled={!scrolledToBottom}
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              style={{
                marginRight: 10,
                marginTop: 2,
                cursor: scrolledToBottom ? "pointer" : "not-allowed",
              }}
            />
            <span style={{ fontSize: 14, color: "#334155" }}>
              Я ознакомился с медицинским дисклеймером и понимаю, что платформа
              не заменяет консультацию врача
            </span>
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              marginBottom: 16,
              cursor: scrolledToBottom ? "pointer" : "not-allowed",
              opacity: scrolledToBottom ? 1 : 0.4,
            }}
          >
            <input
              type="checkbox"
              disabled={!scrolledToBottom}
              checked={dataChecked}
              onChange={(e) => setDataChecked(e.target.checked)}
              style={{
                marginRight: 10,
                marginTop: 2,
                cursor: scrolledToBottom ? "pointer" : "not-allowed",
              }}
            />
            <span style={{ fontSize: 14, color: "#334155" }}>
              Я даю согласие на обработку моих персональных данных в
              соответствии с условиями, изложенными выше
            </span>
          </label>

          {!scrolledToBottom && (
            <p
              style={{
                fontSize: 13,
                color: "#64748b",
                marginBottom: 12,
                fontStyle: "italic",
              }}
            >
              Прокрутите до конца, чтобы активировать чекбоксы
            </p>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "12px 20px",
                border: "2px solid #e2e8f0",
                borderRadius: 12,
                background: "white",
                color: "#64748b",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Отмена
            </button>
            <button
              onClick={handleConfirm}
              disabled={!consentChecked || !dataChecked}
              style={{
                flex: 1,
                padding: "12px 20px",
                border: "none",
                borderRadius: 12,
                background:
                  consentChecked && dataChecked ? "#2563eb" : "#cbd5e1",
                color: "white",
                fontSize: 15,
                fontWeight: 600,
                cursor:
                  consentChecked && dataChecked ? "pointer" : "not-allowed",
                transition: "all 0.2s",
              }}
            >
              Продолжить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
