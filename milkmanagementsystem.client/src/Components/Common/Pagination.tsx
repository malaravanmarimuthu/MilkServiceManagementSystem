import React, { useState } from "react";

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
}) => {
    const [inputPage, setInputPage] = useState("");

    const getPages = (): (number | string)[] => {
        const pages: (number | string)[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("...-left");
            for (
                let i = Math.max(2, currentPage - 1);
                i <= Math.min(totalPages - 1, currentPage + 1);
                i++
            ) {
                pages.push(i);
            }
            if (currentPage < totalPages - 2) pages.push("...-right");
            pages.push(totalPages);
        }
        return pages;
    };

    const handleJump = () => {
        const page = parseInt(inputPage);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
            onPageChange(page);
            setInputPage("");
        }
    };

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: "8px",
                marginTop: "20px",
                padding: "12px",
                background: "#f8fafc",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
            }}
        >
            {/* First */}
            <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                style={btnStyle(currentPage === 1)}
                title="First"
            >
                {"<<"}
            </button>

            {/* Prev */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={btnStyle(currentPage === 1)}
                title="Previous"
            >
                {"<"}
            </button>

            {/* Page numbers */}
            {getPages().map((page) =>
                typeof page === "string" ? (
                    <span
                        key={page}
                        style={{
                            padding: "0 4px",
                            color: "#94a3b8",
                            fontSize: "14px",
                        }}
                    >
                        ...
                    </span>
                ) : (
                    <button
                        key={`page-${page}`}
                        onClick={() => onPageChange(page)}
                        style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "8px",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: "14px",
                            transition: "all 0.2s",
                            background:
                                currentPage === page
                                    ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                                    : "#ffffff",
                            color: currentPage === page ? "#fff" : "#475569",
                            boxShadow:
                                currentPage === page
                                    ? "0 4px 12px rgba(99,102,241,0.4)"
                                    : "0 1px 3px rgba(0,0,0,0.1)",
                        }}
                    >
                        {page}
                    </button>
                )
            )}

            {/* Next */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={btnStyle(currentPage === totalPages)}
                title="Next"
            >
                {">"}
            </button>

            {/* Last */}
            <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                style={btnStyle(currentPage === totalPages)}
                title="Last"
            >
                {">>"}
            </button>

            {/* Divider */}
            <div
                style={{
                    width: "1px",
                    height: "28px",
                    background: "#e2e8f0",
                    margin: "0 4px",
                }}
            />

            {/* Page info */}
            <span
                style={{
                    fontSize: "13px",
                    color: "#64748b",
                    whiteSpace: "nowrap",
                }}
            >
                Page <strong>{currentPage}</strong> of{" "}
                <strong>{totalPages}</strong>
            </span>

            {/* Jump to page */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={inputPage}
                    onChange={(e) => setInputPage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleJump()}
                    placeholder="Go"
                    style={{
                        width: "52px",
                        height: "32px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        textAlign: "center",
                        fontSize: "13px",
                        outline: "none",
                        color: "#334155",
                    }}
                />
                <button
                    onClick={handleJump}
                    style={{
                        height: "32px",
                        padding: "0 10px",
                        borderRadius: "8px",
                        border: "none",
                        background: "#3b82f6",
                        color: "#fff",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    Go
                </button>
            </div>
        </div>
    );
};

const btnStyle = (disabled: boolean): React.CSSProperties => ({
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    background: disabled ? "#f1f5f9" : "#ffffff",
    color: disabled ? "#cbd5e1" : "#475569",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "14px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: disabled ? "none" : "0 1px 3px rgba(0,0,0,0.08)",
});

export default Pagination;