import React, { useState } from "react";

type SortOrder = "asc" | "desc";

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;

    // Sort dropdown (ascending / descending)
    sortOrder?: SortOrder;
    onSortChange?: (order: SortOrder) => void;

    // Page size dropdown + Go button
    pageSize?: number;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];

    hideNav?: boolean;
};

const BRAND = "#1B4332";
const BRAND_LIGHT = "#e8f3ec";
const BRAND_BORDER = "#bfe0cc";

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    searchTerm = "",
    onSearchChange,
    searchPlaceholder = "Search...",
    sortOrder,
    onSortChange,
    pageSize,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 30, 50, 100],
    hideNav = false,
}) => {
    const [inputPage, setInputPage] = useState("");
    const [pendingPageSize, setPendingPageSize] = useState<number | undefined>(pageSize);

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

    const handlePageSizeGo = () => {
        if (pendingPageSize && onPageSizeChange) {
            onPageSizeChange(pendingPageSize);
            onPageChange(1);
        }
    };

    const showToolbar = !!onSearchChange || !!onSortChange || !!onPageSizeChange;

    return (
        <div>
            {showToolbar && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "10px",
                        marginBottom: "12px",
                    }}
                >
                    {onSearchChange && (
                        <input
                            type="text"
                            className="form-control"
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => {
                                onSearchChange(e.target.value);
                                onPageChange(1);
                            }}
                            style={{
                                maxWidth: "300px",
                                borderRadius: "8px",
                                border: `1px solid ${BRAND_BORDER}`,
                            }}
                        />
                    )}

                    {onSortChange && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "13px", color: "#475569" }}>Sort</span>
                            <select
                                value={sortOrder ?? "asc"}
                                onChange={(e) => onSortChange(e.target.value as SortOrder)}
                                style={{
                                    height: "38px",
                                    borderRadius: "8px",
                                    border: `1px solid ${BRAND_BORDER}`,
                                    background: BRAND_LIGHT,
                                    color: BRAND,
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    padding: "0 10px",
                                    cursor: "pointer",
                                }}
                            >
                                <option value="asc">▲ Ascending</option>
                                <option value="desc">▼ Descending</option>
                            </select>
                        </div>
                    )}

                    {onPageSizeChange && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "13px", color: "#475569" }}>Show</span>
                            <select
                                value={pendingPageSize ?? pageSize}
                                onChange={(e) => setPendingPageSize(Number(e.target.value))}
                                style={{
                                    height: "38px",
                                    borderRadius: "8px",
                                    border: `1px solid ${BRAND_BORDER}`,
                                    background: "#fff",
                                    color: "#334155",
                                    fontSize: "13px",
                                    padding: "0 8px",
                                    cursor: "pointer",
                                }}
                            >
                                {pageSizeOptions.map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                            <span style={{ fontSize: "13px", color: "#475569" }}>records</span>
                            <button
                                type="button"
                                onClick={handlePageSizeGo}
                                style={{
                                    height: "38px",
                                    padding: "0 14px",
                                    borderRadius: "8px",
                                    border: "none",
                                    background: BRAND,
                                    color: "#fff",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                Go
                            </button>
                        </div>
                    )}
                </div>
            )}

            {!hideNav && totalPages > 1 && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexWrap: "wrap",
                        gap: "8px",
                        marginTop: "12px",
                        padding: "12px",
                        background: BRAND_LIGHT,
                        borderRadius: "12px",
                        border: `1px solid ${BRAND_BORDER}`,
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
                                        currentPage === page ? BRAND : "#ffffff",
                                    color:
                                        currentPage === page ? "#fff" : "#475569",
                                    boxShadow:
                                        currentPage === page
                                            ? "0 4px 12px rgba(27,67,50,0.35)"
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
                            background: BRAND_BORDER,
                            margin: "0 4px",
                        }}
                    />

                    {/* Page info */}
                    <span
                        style={{
                            fontSize: "13px",
                            color: "#334155",
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
                                border: `1px solid ${BRAND_BORDER}`,
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
                                background: BRAND,
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
            )}
        </div>
    );
};

const btnStyle = (disabled: boolean): React.CSSProperties => ({
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    border: `1px solid ${BRAND_BORDER}`,
    background: disabled ? "#f1f5f9" : "#ffffff",
    color: disabled ? "#cbd5e1" : "#334155",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "14px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: disabled ? "none" : "0 1px 3px rgba(0,0,0,0.08)",
});

export default Pagination;