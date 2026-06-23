function Service() {
    return (
        <section id="services" className="service-fresh-section">
            <style>{`
                .service-fresh-section {
                    background: #F7FBF4;
                    padding: 100px 0;
                }
                .service-header { text-align: center; margin-bottom: 60px; }
                .service-eyebrow {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.78rem;
                    font-weight: 700;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    color: #2D6A4F;
                    margin-bottom: 14px;
                }
                .service-title {
                    font-family: 'Fraunces', Georgia, serif;
                    font-weight: 600;
                    font-size: clamp(2rem, 4vw, 2.8rem);
                    color: #14302A;
                    max-width: 560px;
                    margin: 0 auto;
                    line-height: 1.15;
                }
                .service-card {
                    background: #fff;
                    border-radius: 22px;
                    padding: 38px 30px;
                    height: 100%;
                    border: 1px solid rgba(82,183,136,0.15);
                    box-shadow: 0 10px 26px rgba(27,67,50,0.06);
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                .service-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 20px 40px rgba(27,67,50,0.13);
                    border-color: rgba(82,183,136,0.35);
                }
                .service-card::before {
                    content: "";
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, #52B788, #4895EF);
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 0.35s ease;
                }
                .service-card:hover::before { transform: scaleX(1); }
                .service-icon-wrap {
                    width: 58px; height: 58px;
                    border-radius: 16px;
                    background: rgba(82,183,136,0.12);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 22px;
                    font-size: 1.5rem;
                    color: #1B4332;
                    transition: all 0.3s ease;
                }
                .service-card:hover .service-icon-wrap {
                    background: #1B4332;
                    color: #fff;
                    transform: rotate(-6deg) scale(1.05);
                }
                .service-card-title {
                    font-family: 'Fraunces', serif;
                    font-weight: 600;
                    font-size: 1.25rem;
                    color: #14302A;
                    margin-bottom: 12px;
                }
                .service-card-text {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.92rem;
                    color: #5C7268;
                    line-height: 1.65;
                }
            `}</style>

            <div className="container">
                <div className="service-header">
                    <div className="service-eyebrow">What We Offer</div>
                    <h2 className="service-title">Everything Between the Farm and Your Fridge</h2>
                </div>

                <div className="row g-4">

                    <div className="col-lg-4 col-md-6">
                        <div className="service-card">
                            <div className="service-icon-wrap">
                                <i className="bi bi-sunrise-fill" />
                            </div>
                            <h3 className="service-card-title">Daily Doorstep Delivery</h3>
                            <p className="service-card-text">
                                Fresh milk delivered to your door every morning before 6AM,
                                rain or shine  no missed days.
                            </p>
                        </div>
                    </div>

                    <div className="col-lg-4 col-md-6">
                        <div className="service-card">
                            <div className="service-icon-wrap">
                                <i className="bi bi-droplet-fill" />
                            </div>
                            <h3 className="service-card-title">Farm-Direct Sourcing</h3>
                            <p className="service-card-text">
                                Milk comes straight from 40+ verified local farms, with zero
                                cold-storage delays in between.
                            </p>
                        </div>
                    </div>

                    <div className="col-lg-4 col-md-6">
                        <div className="service-card">
                            <div className="service-icon-wrap">
                                <i className="bi bi-clipboard2-pulse-fill" />
                            </div>
                            <h3 className="service-card-title">Quality Lab Testing</h3>
                            <p className="service-card-text">
                                Every batch is tested for purity and fat content before it
                                leaves the depot  reports available on request.
                            </p>
                        </div>
                    </div>

                    <div className="col-lg-4 col-md-6">
                        <div className="service-card">
                            <div className="service-icon-wrap">
                                <i className="bi bi-calendar2-week-fill" />
                            </div>
                            <h3 className="service-card-title">Flexible Subscriptions</h3>
                            <p className="service-card-text">
                                Pause, skip, or change your quantity anytime from the app 
                                no calls, no penalties.
                            </p>
                        </div>
                    </div>

                    <div className="col-lg-4 col-md-6">
                        <div className="service-card">
                            <div className="service-icon-wrap">
                                <i className="bi bi-recycle" />
                            </div>
                            <h3 className="service-card-title">Reusable Glass Bottles</h3>
                            <p className="service-card-text">
                                We collect and sanitize empty bottles on your next delivery 
                                less plastic, less waste.
                            </p>
                        </div>
                    </div>

                    <div className="col-lg-4 col-md-6">
                        <div className="service-card">
                            <div className="service-icon-wrap">
                                <i className="bi bi-headset" />
                            </div>
                            <h3 className="service-card-title">Local Support Team</h3>
                            <p className="service-card-text">
                                A dedicated delivery agent for your area, reachable directly
                                for any delivery changes.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

export default Service;