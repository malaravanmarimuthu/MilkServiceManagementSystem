type PaginationProps = {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

function Pagination({
    searchTerm,
    onSearchChange,
    currentPage,
    totalPages,
    onPageChange,
}: PaginationProps) {
    return (
        <div className="d-flex justify-content-end align-items-center gap-3 mt-3">
            <input
                type="text"
                className="form-control"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{ width: "250px" }}
            />

            {totalPages > 1 && (
                <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button
                            className="page-link"
                            onClick={() => onPageChange(currentPage - 1)}
                        >
                            Previous
                        </button>
                    </li>

                    {Array.from({ length: totalPages }, (_, index) => (
                        <li
                            key={index + 1}
                            className={`page-item ${currentPage === index + 1 ? "active" : ""
                                }`}
                        >
                            <button
                                className="page-link"
                                onClick={() => onPageChange(index + 1)}
                            >
                                {index + 1}
                            </button>
                        </li>
                    ))}

                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                        <button
                            className="page-link"
                            onClick={() => onPageChange(currentPage + 1)}
                        >
                            Next
                        </button>
                    </li>
                </ul>
            )}
        </div>
    );
}

export default Pagination;