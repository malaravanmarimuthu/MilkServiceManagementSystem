type Props = {
    message: string;
    onClose: () => void;
};

export default function ErrorModal({ message, onClose }: Props) {
    if (!message) return null;

    return (
        <>
            <div
                className="modal-backdrop fade show"
                style={{
                    backdropFilter: "blur(4px)",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    zIndex: 999999
                }}
                onClick={onClose}
            />

            <div
                className="modal fade show d-block"
                tabIndex={-1}
                style={{ zIndex: 1000000 }}
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">

                        <div className="modal-header border-0 px-4 pt-4 pb-0">
                            <div className="d-flex align-items-center gap-2">
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: 36, height: 36, backgroundColor: "#fee2e2" }}
                                >
                                    <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: 18 }} />
                                </div>
                                <h5 className="modal-title fw-bold text-danger mb-0">
                                    Something went wrong
                                </h5>
                            </div>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onClose}
                            />
                        </div>

                        <div className="modal-body px-4 py-3 text-center">
                            <p className="text-muted mb-0" style={{ fontSize: 15 }}>
                                {message}
                            </p>
                        </div>

                        <div className="modal-footer border-0 px-4 pb-4 pt-2 justify-content-center">
                            <button
                                className="btn btn-danger px-5 rounded-pill"
                                onClick={onClose}
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}