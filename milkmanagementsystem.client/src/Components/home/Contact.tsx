function Contact() {
    return (
        <section className="contact-fresh-section">
            <style>{`
                .contact-fresh-section {
                    background: #FBF7EE;
                    padding: 100px 0;
                }
                .contact-header { text-align: center; margin-bottom: 56px; }
                .contact-eyebrow {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.78rem;
                    font-weight: 700;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    color: #2D6A4F;
                    margin-bottom: 14px;
                }
                .contact-title {
                    font-family: 'Fraunces', Georgia, serif;
                    font-weight: 600;
                    font-size: clamp(2rem, 4vw, 2.8rem);
                    color: #14302A;
                }
                .contact-info-card {
                    background: #fff;
                    border-radius: 18px;
                    padding: 30px 26px;
                    text-align: center;
                    height: 100%;
                    border: 1px solid rgba(82,183,136,0.15);
                    transition: all 0.25s ease;
                }
                .contact-info-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 16px 32px rgba(27,67,50,0.1);
                }
                .contact-icon-wrap {
                    width: 52px; height: 52px;
                    border-radius: 14px;
                    background: rgba(82,183,136,0.12);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 16px;
                    font-size: 1.3rem;
                    color: #1B4332;
                }
                .contact-info-title {
                    font-family: 'Inter', sans-serif;
                    font-weight: 600;
                    font-size: 0.95rem;
                    color: #14302A;
                    margin-bottom: 6px;
                }
                .contact-info-text {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.88rem;
                    color: #5C7268;
                }
                .contact-info-text a {
                    color: #5C7268;
                    text-decoration: none;
                }
                .contact-info-text a:hover {
                    color: #1B4332;
                    text-decoration: underline;
                }
                .contact-map-wrap {
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 16px 32px rgba(27,67,50,0.1);
                    border: 1px solid rgba(82,183,136,0.15);
                }
            `}</style>

            <div className="container">
                <div className="contact-header">
                    <div className="contact-eyebrow">Get In Touch</div>
                    <h2 className="contact-title">Questions About Your Delivery?</h2>
                </div>

                <div className="row g-4 mb-5">
                    <div className="col-lg-4">
                        <div className="contact-info-card">
                            <div className="contact-icon-wrap">
                                <i className="bi bi-geo-alt-fill" />
                            </div>
                            <div className="contact-info-title">Depot Address</div>
                            <div className="contact-info-text">
                                No:239, Gangai Vinayagar Kovil Street,<br />
                                New Dharapuram Road, R.M.K Nagar,<br />
                                Palani - 624601
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="contact-info-card">
                            <div className="contact-icon-wrap">
                                <i className="bi bi-telephone-fill" />
                            </div>
                            <div className="contact-info-title">Call Us</div>
                            <div className="contact-info-text">
                                <a href="tel:+917845085110">+91 78450 85110</a>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="contact-info-card">
                            <div className="contact-icon-wrap">
                                <i className="bi bi-envelope-fill" />
                            </div>
                            <div className="contact-info-title">Email Us</div>
                            <div className="contact-info-text">
                                <a href="mailto:customercare@fourkfresh.com">customercare@fourkfresh.com</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row justify-content-center">
                    <div className="col-lg-9">
                        <div className="contact-map-wrap">
                            <iframe
                                title="FourKFresh Dairy Location"
                                src="https://www.google.com/maps?q=FourKFresh+Dairy,+Gangai+Vinayagar+Street,+RMK+Nagar,+Kodaimangalam,+Palani,+Tamil+Nadu+624601&output=embed"
                                width="100%"
                                height="350"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Contact;