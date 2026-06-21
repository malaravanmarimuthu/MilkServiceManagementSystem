function Hero() {
    return (
        <section id="home" className="hero-section">
            <style>{`
                .hero-section {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    position: relative;
                    overflow: hidden;
                    background: linear-gradient(135deg, #F7FBF4 0%, #E8F5E9 45%, #D4ECE0 100%);
                }
                .hero-wave-bg {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                }
                .hero-grain {
                    position: absolute;
                    inset: 0;
                    background-image: radial-gradient(circle, rgba(27,67,50,0.04) 1px, transparent 1px);
                    background-size: 22px 22px;
                    pointer-events: none;
                }
                .hero-eyebrow {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.78rem;
                    font-weight: 700;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    color: #2D6A4F;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 22px;
                }
                .hero-eyebrow::before {
                    content: "";
                    width: 32px;
                    height: 2px;
                    background: #52B788;
                }
                .hero-title {
                    font-family: 'Fraunces', Georgia, serif;
                    font-weight: 600;
                    font-size: clamp(2.8rem, 6vw, 5rem);
                    line-height: 1.02;
                    color: #14302A;
                    letter-spacing: -0.02em;
                    margin-bottom: 26px;
                }
                .hero-title em {
                    font-style: italic;
                    color: #2D6A4F;
                    font-weight: 500;
                }
                .hero-sub {
                    font-family: 'Inter', sans-serif;
                    font-size: 1.08rem;
                    color: #3F5249;
                    max-width: 480px;
                    line-height: 1.7;
                    margin-bottom: 36px;
                }
                .hero-cta-row {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                    flex-wrap: wrap;
                }
                .hero-btn-primary {
                    background: #1B4332;
                    color: #fff;
                    border: none;
                    padding: 16px 34px;
                    border-radius: 100px;
                    font-family: 'Inter', sans-serif;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 24px rgba(27,67,50,0.25);
                }
                .hero-btn-primary:hover {
                    background: #14302A;
                    transform: translateY(-2px);
                    box-shadow: 0 12px 28px rgba(27,67,50,0.32);
                }
                .hero-btn-secondary {
                    color: #1B4332;
                    font-family: 'Inter', sans-serif;
                    font-weight: 600;
                    font-size: 0.95rem;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 16px 8px;
                }
                .hero-btn-secondary i { transition: transform 0.25s; }
                .hero-btn-secondary:hover i { transform: translateX(4px); }
                .hero-stats {
                    display: flex;
                    gap: 40px;
                    margin-top: 52px;
                }
                .hero-stat-num {
                    font-family: 'Fraunces', serif;
                    font-size: 2.1rem;
                    font-weight: 600;
                    color: #1B4332;
                    line-height: 1;
                }
                .hero-stat-label {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.78rem;
                    color: #5C7268;
                    margin-top: 4px;
                }

                /* Milk bottle visual */
                .hero-visual {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    min-height: 460px;
                }
                .milk-bottle-wrap {
                    position: relative;
                    animation: bottleFloat 5s ease-in-out infinite;
                }
                @keyframes bottleFloat {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-14px); }
                }
                .milk-bottle {
                    width: 200px;
                    height: 320px;
                    position: relative;
                }
                .bottle-cap {
                    width: 60px;
                    height: 34px;
                    background: linear-gradient(135deg, #4895EF, #4361EE);
                    border-radius: 8px 8px 4px 4px;
                    margin: 0 auto;
                    box-shadow: 0 4px 10px rgba(67,97,238,0.3);
                }
                .bottle-neck {
                    width: 44px;
                    height: 28px;
                    background: rgba(255,255,255,0.55);
                    border: 2px solid rgba(82,183,136,0.4);
                    border-bottom: none;
                    margin: 0 auto;
                }
                .bottle-body {
                    width: 170px;
                    height: 250px;
                    margin: 0 auto;
                    background: linear-gradient(160deg, rgba(255,255,255,0.85), rgba(232,245,233,0.65));
                    border: 2px solid rgba(82,183,136,0.45);
                    border-radius: 24px 24px 36px 36px;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 30px 60px rgba(27,67,50,0.18), inset 0 0 40px rgba(255,255,255,0.5);
                    backdrop-filter: blur(2px);
                }
                .bottle-milk-fill {
                    position: absolute;
                    bottom: 0; left: 0; right: 0;
                    height: 78%;
                    background: linear-gradient(180deg, #FDFEFE, #F2FBF6);
                    border-radius: 0 0 34px 34px;
                }
                .bottle-milk-fill::before {
                    content: "";
                    position: absolute;
                    top: -8px; left: 0; right: 0;
                    height: 16px;
                    background: radial-gradient(ellipse at center, #ffffff 40%, transparent 70%);
                    opacity: 0.9;
                }
                .bottle-label {
                    position: absolute;
                    bottom: 30%;
                    left: 12%;
                    right: 12%;
                    background: #1B4332;
                    color: #fff;
                    text-align: center;
                    padding: 14px 8px;
                    border-radius: 6px;
                    font-family: 'Fraunces', serif;
                    font-weight: 600;
                    font-size: 1rem;
                    letter-spacing: 0.5px;
                    box-shadow: 0 6px 16px rgba(0,0,0,0.15);
                }
                .bottle-label span {
                    display: block;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.6rem;
                    font-weight: 500;
                    letter-spacing: 2px;
                    color: #95D5B2;
                    margin-top: 2px;
                }

                /* Floating droplets */
                .droplet {
                    position: absolute;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(45deg);
                    animation: dropletFloat ease-in-out infinite;
                }
                @keyframes dropletFloat {
                    0%, 100% { transform: rotate(45deg) translateY(0); }
                    50% { transform: rotate(45deg) translateY(-18px); }
                }
                .drop-1 { width: 22px; height: 22px; background: #4895EF; opacity: 0.55; top: 12%; left: 8%; animation-duration: 4s; }
                .drop-2 { width: 16px; height: 16px; background: #52B788; opacity: 0.6; top: 28%; right: 10%; animation-duration: 5s; animation-delay: 0.6s; }
                .drop-3 { width: 12px; height: 12px; background: #95D5B2; opacity: 0.7; bottom: 18%; left: 14%; animation-duration: 4.5s; animation-delay: 1.2s; }
                .drop-4 { width: 18px; height: 18px; background: #4895EF; opacity: 0.4; bottom: 30%; right: 6%; animation-duration: 5.5s; animation-delay: 0.3s; }

                /* Wave divider at bottom */
                .hero-wave-divider {
                    position: absolute;
                    bottom: -2px; left: 0; right: 0;
                    line-height: 0;
                    z-index: 1;
                }

                @media (max-width: 991px) {
                    .hero-visual { min-height: 320px; margin-top: 40px; }
                    .hero-stats { gap: 28px; }
                }
            `}</style>

            <div className="hero-grain" />

            <div className="container position-relative" style={{ zIndex: 2 }}>
                <div className="row align-items-center">
                    <div className="col-lg-6">
                        <div className="hero-eyebrow">Farm to Doorstep, Daily</div>

                        <h1 className="hero-title">
                            Fresh Milk,
                            <br />
                            <em>Delivered</em> Before
                            <br />
                            Sunrise
                        </h1>

                        <p className="hero-sub">
                            Real milk from local farms in your city, bottled the same morning
                            and on your doorstep before you wake up. No middlemen, no preservatives.
                        </p>

                        <div className="hero-cta-row">
                            <button className="hero-btn-primary">
                                Start Your Subscription
                            </button>
                            <a href="#services" className="hero-btn-secondary">
                                See How It Works <i className="bi bi-arrow-right" />
                            </a>
                        </div>

                        <div className="hero-stats">
                            <div>
                                <div className="hero-stat-num">12k+</div>
                                <div className="hero-stat-label">Daily Deliveries</div>
                            </div>
                            <div>
                                <div className="hero-stat-num">40+</div>
                                <div className="hero-stat-label">Partner Farms</div>
                            </div>
                            <div>
                                <div className="hero-stat-num">5AM</div>
                                <div className="hero-stat-label">Delivered By</div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="hero-visual">
                            <div className="droplet drop-1" />
                            <div className="droplet drop-2" />
                            <div className="droplet drop-3" />
                            <div className="droplet drop-4" />

                            <div className="milk-bottle-wrap">
                                <div className="milk-bottle">
                                    <div className="bottle-cap" />
                                    <div className="bottle-neck" />
                                    <div className="bottle-body">
                                        <div className="bottle-milk-fill" />
                                        <div className="bottle-label">
                                            4K FRESH
                                            <span>WHOLE MILK</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="hero-wave-divider">
                <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", display: "block" }}>
                    <path d="M0,40 C360,100 1080,0 1440,50 L1440,100 L0,100 Z" fill="#FBF7EE" />
                </svg>
            </div>
        </section>
    );
}

export default Hero;