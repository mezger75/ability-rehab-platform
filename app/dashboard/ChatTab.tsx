interface ChatTabProps {
  msgs: Array<{ role: "user" | "assistant"; content: string }>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: () => void;
  loading: boolean;
  chatEnd: React.RefObject<HTMLDivElement>;
  suggestions: string[];
}

export function ChatTab({
  msgs,
  input,
  setInput,
  sendMessage,
  loading,
  chatEnd,
  suggestions,
}: ChatTabProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        height: "calc(100vh - 280px)",
        minHeight: 480,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "14px 14px 0 0",
          border: "1px solid #e2e8f0",
          borderBottom: "none",
          padding: "12px 16px",
          flexShrink: 0,
        }}
      >
        <p
          style={{ fontSize: 14, fontWeight: 500, color: "#1e293b", margin: 0 }}
        >
          ИИ-ассистент: формулирование SMART-целей
        </p>
        <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>
          Цели автоматически сохраняются на вкладке «Цели»
        </p>
      </div>
      <div
        style={{
          flex: 1,
          background: "white",
          border: "1px solid #e2e8f0",
          overflowY: "auto",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {msgs.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            {m.role === "assistant" && (
              <div
                style={{
                  width: 28,
                  height: 28,
                  background: "#2563eb",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                AI
              </div>
            )}
            <div
              style={{
                maxWidth: "78%",
                borderRadius:
                  m.role === "user"
                    ? "16px 16px 4px 16px"
                    : "16px 16px 16px 4px",
                padding: "10px 14px",
                fontSize: 13,
                lineHeight: 1.6,
                background: m.role === "user" ? "#2563eb" : "#f1f5f9",
                color: m.role === "user" ? "white" : "#1e293b",
              }}
            >
              <pre
                style={{
                  fontFamily: "inherit",
                  whiteSpace: "pre-wrap",
                  margin: 0,
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                {m.content}
              </pre>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                background: "#2563eb",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              AI
            </div>
            <div
              style={{
                background: "#f1f5f9",
                borderRadius: 16,
                padding: "10px 14px",
                display: "flex",
                gap: 5,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#94a3b8",
                    animation: "bounce 1.2s infinite",
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={chatEnd} />
      </div>
      <div
        style={{
          background: "white",
          borderRadius: "0 0 14px 14px",
          border: "1px solid #e2e8f0",
          borderTop: "none",
          padding: 12,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 10,
            flexWrap: "wrap",
          }}
        >
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => setInput(s)}
              style={{
                fontSize: 12,
                background: "#eff6ff",
                color: "#1d4ed8",
                border: "none",
                padding: "5px 12px",
                borderRadius: 99,
                cursor: "pointer",
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Введите запрос..."
            style={{
              flex: 1,
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              background: loading || !input.trim() ? "#e2e8f0" : "#2563eb",
              color: loading || !input.trim() ? "#94a3b8" : "white",
              border: "none",
              borderRadius: 10,
              padding: "10px 18px",
              cursor: loading || !input.trim() ? "default" : "pointer",
              fontSize: 15,
              transition: "background 0.2s",
            }}
          >
            →
          </button>
        </div>
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}
