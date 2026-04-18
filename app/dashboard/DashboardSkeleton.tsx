export function DashboardSkeleton() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 24,
      }}
      className="skeleton-container"
    >
      {/* Stats cards skeleton */}
      <div className="skeleton-stats">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: "white",
              borderRadius: 12,
              padding: "14px 16px",
              border: "1px solid #e2e8f0",
              height: 80,
            }}
          >
            <div
              style={{
                width: "60%",
                height: 12,
                background: "#f1f5f9",
                borderRadius: 4,
                marginBottom: 8,
              }}
            />
            <div
              style={{
                width: "40%",
                height: 24,
                background: "#f1f5f9",
                borderRadius: 4,
                marginBottom: 4,
              }}
            />
            <div
              style={{
                width: "50%",
                height: 10,
                background: "#f1f5f9",
                borderRadius: 4,
              }}
            />
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="skeleton-charts">
        {[1, 2].map((i) => (
          <div
            key={i}
            style={{
              background: "white",
              borderRadius: 14,
              padding: 20,
              border: "1px solid #e2e8f0",
              height: 340,
            }}
          >
            <div
              style={{
                width: "50%",
                height: 16,
                background: "#f1f5f9",
                borderRadius: 4,
                marginBottom: 16,
              }}
            />
            <div
              style={{
                width: "100%",
                height: 280,
                background: "#f8fafc",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  border: "4px solid #e2e8f0",
                  borderTopColor: "#3b82f6",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .skeleton-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        .skeleton-charts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 768px) {
          .skeleton-container {
            padding: 16px;
            gap: 12px;
          }
          .skeleton-stats {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .skeleton-charts {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}
