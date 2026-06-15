type LoaderProps = {
    text?: string;
};

const Loader = ({ text = "Loading..." }: LoaderProps) => {
    return (
        <>
            <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
            />
            {text}
        </>
    );
};

export default Loader;