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
                .contact-form-wrap {
                    background: #1B4332;
                    border-radius: 28px;
                    padding: 52px;
                    box-shadow: 0 24px 50px rgba(27,67,50,0.22);
                }
                .contact-form-label {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: rgba(255,255,255,0.6);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 6px;
                    display: block;
                }
                .contact-input {
                    width: 100%;
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.18);
                    border-radius: 10px;
                    padding: 12px 16px;
                    color: #fff;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.92rem;
                    outline: none;
                    transition: all 0.2s;
                }
                .contact-input::placeholder { color: rgba(255,255,255,0.32); }
                .contact-input:focus {
                    border-color: #52B788;
                    background: rgba(255,255,255,0.12);
                }
                .contact-submit-btn {
                    background: #fff;
                    color: #1B4332;
                    border: none;
                    padding: 14px 44px;
                    border-radius: 100px;
                    font-family: 'Inter', sans-serif;
                    font-weight: 700;
                    font-size: 0.92rem;
                    transition: all 0.25s ease;
                }
                .contact-submit-btn:hover {
                    background: #95D5B2;
                    transform: translateY(-2px);
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
                            <div className="contact-info-text">123 Anna Salai, Chennai</div>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="contact-info-card">
                            <div className="contact-icon-wrap">
                                <i className="bi bi-telephone-fill" />
                            </div>
                            <div className="contact-info-title">Call Us</div>
                            <div className="contact-info-text">+91 98765 43210</div>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="contact-info-card">
                            <div className="contact-icon-wrap">
                                <i className="bi bi-envelope-fill" />
                            </div>
                            <div className="contact-info-title">Email Us</div>
                            <div className="contact-info-text">hello@4kfresh.com</div>
                        </div>
                    </div>
                </div>

                <div className="row justify-content-center">
                    <div className="col-lg-9">
                        <div className="contact-form-wrap">
                            <form>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <label className="contact-form-label">Your Name</label>
                                        <input type="text" placeholder="Enter your name" className="contact-input" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="contact-form-label">Your Email</label>
                                        <input type="email" placeholder="you@email.com" className="contact-input" />
                                    </div>
                                    <div className="col-12">
                                        <label className="contact-form-label">Subject</label>
                                        <input type="text" placeholder="What's this about?" className="contact-input" />
                                    </div>
                                    <div className="col-12">
                                        <label className="contact-form-label">Message</label>
                                        <textarea rows={5} placeholder="Tell us more..." className="contact-input" style={{ resize: "none" }}></textarea>
                                    </div>
                                    <div className="col-12 text-center pt-2">
                                        <button type="submit" className="contact-submit-btn">
                                            Send Message
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Contact;