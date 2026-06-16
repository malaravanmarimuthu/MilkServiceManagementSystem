function Footer() {
    return (
        <footer
            style={{
                backgroundColor: "#212529",
                color: "white",
                padding: "20px 0",
                marginTop: "auto"
            }}
        >
            <div className="container text-center">
                <h5 className="mb-2">4K Fresh Milk Management System</h5>

                <p className="mb-1">
                    Fresh Milk Procurement & Distribution Management
                </p>

                <small>
                    © {new Date().getFullYear()} 4K Fresh. All Rights Reserved.
                </small>
            </div>
        </footer>
    );
}

export default Footer;