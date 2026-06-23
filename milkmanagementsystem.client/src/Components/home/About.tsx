function About() {
    return (
        <section className="about-fresh-section">
            <style>{`
                .about-fresh-section {
                    background: #FBF7EE;
                    padding: 100px 0;
                }
                .about-eyebrow {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.78rem;
                    font-weight: 700;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    color: #2D6A4F;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 18px;
                }
                .about-eyebrow::before {
                    content: "";
                    width: 32px;
                    height: 2px;
                    background: #52B788;
                }
                .about-title {
                    font-family: 'Fraunces', Georgia, serif;
                    font-weight: 600;
                    font-size: clamp(2rem, 4vw, 2.9rem);
                    line-height: 1.12;
                    color: #14302A;
                    letter-spacing: -0.01em;
                    margin-bottom: 22px;
                }
                .about-title em {
                    font-style: italic;
                    color: #2D6A4F;
                    font-weight: 500;
                }
                .about-text {
                    font-family: 'Inter', sans-serif;
                    font-size: 1.02rem;
                    color: #3F5249;
                    line-height: 1.75;
                    max-width: 480px;
                }
                .about-visual {
                    position: relative;
                    height: 420px;
                    border-radius: 28px;
                    background: linear-gradient(150deg, #1B4332 0%, #2D6A4F 55%, #52B788 100%);
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 24px 50px rgba(27,67,50,0.22);
                }
                .about-visual::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1.5px, transparent 1.5px);
                    background-size: 26px 26px;
                }
                .about-jar {
                    position: relative;
                    z-index: 2;
                    width: 130px;
                    height: 170px;
                    background: rgba(255,255,255,0.92);
                    border-radius: 16px 16px 28px 28px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.25);
                }
                .about-jar::before {
                    content: "";
                    position: absolute;
                    top: -18px; left: 50%;
                    transform: translateX(-50%);
                    width: 50px; height: 22px;
                    background: #4895EF;
                    border-radius: 6px 6px 2px 2px;
                }
                .about-jar-stripe {
                    position: absolute;
                    bottom: 38%;
                    left: 0; right: 0;
                    height: 36px;
                    background: #1B4332;
                }
                .about-stat-card {
                    background: #fff;
                    border-radius: 18px;
                    padding: 26px 22px;
                    text-align: center;
                    box-shadow: 0 12px 30px rgba(27,67,50,0.08);
                    border: 1px solid rgba(82,183,136,0.15);
                    transition: transform 0.25s ease;
                }
                .about-stat-card:hover { transform: translateY(-4px); }
                .about-stat-num {
                    font-family: 'Fraunces', serif;
                    font-weight: 600;
                    font-size: 2.3rem;
                    color: #1B4332;
                    line-height: 1;
                }
                .about-stat-label {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.85rem;
                    color: #5C7268;
                    margin-top: 8px;
                }
            `}</style>

            <div className="container">
                <div className="row align-items-center g-5">

                    <div className="col-lg-6">
                        <div className="about-visual">
                            <div className="about-jar">
                                <div className="about-jar-stripe" />
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="about-eyebrow">About 4K Fresh</div>

                        <h2 className="about-title">
                            We Skip the Warehouse.
                            <br />
                            <em>Farm to Fridge</em>, Same Day.
                        </h2>

                        <p className="about-text">
                            Every bottle we deliver was milked that morning. We work directly
                            with local dairy farms, cutting out distributors and cold storage
                            delays so what reaches your door is as close to fresh as it gets.
                        </p>

                        <div className="row mt-5 g-3">
                            <div className="col-6">
                                <div className="about-stat-card">
                                    <div className="about-stat-num">40+</div>
                                    <div className="about-stat-label">Partner Farms</div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="about-stat-card">
                                    <div className="about-stat-num">0</div>
                                    <div className="about-stat-label">Preservatives Added</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

export default About;