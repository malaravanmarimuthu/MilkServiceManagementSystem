type LoaderProps = {
    text?: string;
};

function Loader({ text = "Loading..." }: LoaderProps) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "60px 20px",
                gap: "16px",
            }}
        >
            {/* Spinning ring */}
            <div style={{ position: "relative", width: "64px", height: "64px" }}>
                <div style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: "4px solid #e2e8f0",
                }} />
                <div style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: "4px solid transparent",
                    borderTopColor: "#3b82f6",
                    borderRightColor: "#8b5cf6",
                    animation: "spin 0.9s linear infinite",
                }} />
            </div>

            {/* Bouncing dots */}
            <div style={{ display: "flex", gap: "6px" }}>
                {[0, 1, 2].map((i) => (
                    <div key={i} style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        backgroundColor: "#3b82f6",
                        animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                ))}
            </div>

            {/* Text */}
            <div style={{ textAlign: "center" }}>
                <div style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#334155",
                }}>
                    {text}
                </div>
                <div style={{
                    fontSize: "12px",
                    color: "#94a3b8",
                    marginTop: "4px",
                }}>
                    Please wait...
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); opacity: 0.4; }
                    50% { transform: translateY(-6px); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

export default Loader;