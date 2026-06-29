function Footer() {
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');

                .footer-fresh {
                    background: linear-gradient(135deg, #1a6b3c 0%, #2ecc8e 50%, #1a6b3c 100%);
                    background-size: 200% 200%;
                    animation: gradientShift 6s ease infinite;
                    animation-delay: 0s;
                    color: #fff;
                    padding: 28px 0 20px;
                    margin-top: auto;
                    position: relative;
                }

                .footer-fresh::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 100%);
                    pointer-events: none;
                }

                .footer-brand {
                    font-family: 'Poppins', sans-serif;
                    font-weight: 800;
                    font-size: 1.3rem;
                    letter-spacing: -0.3px;
                    color: #fff;
                    text-shadow: 0 2px 8px rgba(0,0,0,0.15);
                }

                .footer-sub {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.85rem;
                    color: rgba(255,255,255,0.82);
                    margin: 4px 0 10px;
                }

                .footer-divider {
                    width: 60px;
                    height: 2px;
                    background: rgba(255,255,255,0.3);
                    margin: 10px auto;
                    border-radius: 2px;
                }

                .footer-copy {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.78rem;
                    color: rgba(255,255,255,0.65);
                }

                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>

            <footer className="footer-fresh">
                <div className="container text-center position-relative">
                    <div className="footer-brand">4K FRESH</div>
                    <div className="footer-sub">
                        Fresh Milk Procurement & Distribution Management
                    </div>
                    <div className="footer-divider"></div>
                    <div className="footer-copy">
                        © {new Date().getFullYear()} Anaiyaan Technology. All Rights Reserved.
                    </div>
                </div>
            </footer>
        </>
    );
}

export default Footer;