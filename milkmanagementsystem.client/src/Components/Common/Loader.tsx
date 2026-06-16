type LoaderProps = {
    text?: string;
};

function Loader({
    text = "Loading..."
}: LoaderProps) {

    return (
        <div className="d-flex justify-content-center align-items-center py-5">

            <div
                className="card border-0 shadow-sm text-center p-4"
                style={{ minWidth: "250px" }}
            >

                <div
                    className="spinner-border text-primary mx-auto"
                    style={{
                        width: "3rem",
                        height: "3rem"
                    }}
                    role="status"
                >
                    <span className="visually-hidden">
                        Loading...
                    </span>
                </div>

                <h6 className="mt-3 mb-1 fw-semibold">
                    {text}
                </h6>

                <small className="text-muted">
                    Please wait...
                </small>

            </div>

        </div>
    );
}

export default Loader;