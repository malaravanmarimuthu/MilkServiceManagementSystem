type Props = {
    message: string;
    onConfirm: () => void;
    onClose: () => void;
};

export default function ConfirmModal({
    message,
    onConfirm,
    onClose,
}: Props) {
    if (!message) return null;

    return (
        <>
            <div
                className="modal-backdrop fade show"
                style={{
                    backdropFilter: "blur(4px)",
                    backgroundColor: "rgba(0,0,0,0.6)"
                }}
                onClick={onClose}
            />

            <div className="modal fade show d-block" tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">

                        <div className="modal-header border-0 px-4 pt-4 pb-0">
                            <h5 className="modal-title fw-bold text-warning">
                                Confirm Logout
                            </h5>
                        </div>

                        <div className="modal-body text-center">
                            <p>{message}</p>
                        </div>

                        <div className="modal-footer border-0 justify-content-center pb-4">

                            <button
                                className="btn btn-secondary rounded-pill px-4"
                                onClick={onClose}
                            >
                                Cancel
                            </button>

                            <button
                                className="btn btn-danger rounded-pill px-4"
                                onClick={onConfirm}
                            >
                                Logout
                            </button>

                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}