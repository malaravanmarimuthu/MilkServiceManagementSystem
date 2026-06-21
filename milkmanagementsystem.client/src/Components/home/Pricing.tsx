function Pricing() {
    return (
        <section className="pricing-fresh-section">
            <style>{`
                .pricing-fresh-section {
                    background: #F7FBF4;
                    padding: 100px 0;
                }
                .pricing-header { text-align: center; margin-bottom: 60px; }
                .pricing-eyebrow {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.78rem;
                    font-weight: 700;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    color: #2D6A4F;
                    margin-bottom: 14px;
                }
                .pricing-title {
                    font-family: 'Fraunces', Georgia, serif;
                    font-weight: 600;
                    font-size: clamp(2rem, 4vw, 2.8rem);
                    color: #14302A;
                }
                .price-card {
                    background: #fff;
                    border-radius: 24px;
                    padding: 42px 32px;
                    height: 100%;
                    border: 1.5px solid rgba(82,183,136,0.18);
                    box-shadow: 0 12px 30px rgba(27,67,50,0.06);
                    transition: all 0.3s ease;
                    position: relative;
                }
                .price-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 44px rgba(27,67,50,0.14);
                }
                .price-card.featured {
                    background: #1B4332;
                    color: #fff;
                    border: none;
                    transform: scale(1.04);
                }
                .price-card.featured:hover { transform: scale(1.04) translateY(-8px); }
                .price-badge {
                    position: absolute;
                    top: -14px; left: 50%;
                    transform: translateX(-50%);
                    background: #4895EF;
                    color: #fff;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.7rem;
                    font-weight: 700;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    padding: 6px 18px;
                    border-radius: 100px;
                }
                .price-plan-name {
                    font-family: 'Inter', sans-serif;
                    font-weight: 600;
                    font-size: 0.95rem;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    color: #5C7268;
                    margin-bottom: 16px;
                }
                .price-card.featured .price-plan-name { color: #95D5B2; }
                .price-amount {
                    font-family: 'Fraunces', serif;
                    font-weight: 600;
                    font-size: 2.8rem;
                    color: #1B4332;
                    margin-bottom: 4px;
                }
                .price-card.featured .price-amount { color: #fff; }
                .price-unit {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.85rem;
                    color: #8A9B92;
                    margin-bottom: 28px;
                }
                .price-card.featured .price-unit { color: rgba(255,255,255,0.6); }
                .price-feature {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.92rem;
                    color: #3F5249;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 0;
                    border-bottom: 1px solid rgba(82,183,136,0.12);
                }
                .price-card.featured .price-feature {
                    color: rgba(255,255,255,0.88);
                    border-bottom: 1px solid rgba(255,255,255,0.12);
                }
                .price-feature i { color: #52B788; font-size: 1rem; }
                .price-card.featured .price-feature i { color: #95D5B2; }
                .price-btn {
                    width: 100%;
                    margin-top: 28px;
                    padding: 13px;
                    border-radius: 100px;
                    border: none;
                    font-family: 'Inter', sans-serif;
                    font-weight: 600;
                    font-size: 0.92rem;
                    background: #1B4332;
                    color: #fff;
                    transition: all 0.25s ease;
                }
                .price-btn:hover { background: #14302A; transform: translateY(-2px); }
                .price-card.featured .price-btn {
                    background: #fff;
                    color: #1B4332;
                }
                .price-card.featured .price-btn:hover { background: #F0FAF4; }
            `}</style>

            <div className="container">
                <div className="pricing-header">
                    <div className="pricing-eyebrow">Subscription Plans</div>
                    <h2 className="pricing-title">Pick Your Daily Bottle</h2>
                </div>

                <div className="row g-4 justify-content-center">

                    <div className="col-lg-4 col-md-6">
                        <div className="price-card">
                            <div className="price-plan-name">Starter</div>
                            <div className="price-amount">₹999</div>
                            <div className="price-unit">per month / 500ml daily</div>
                            <div className="price-feature"><i className="bi bi-check-circle-fill" /> Standard delivery slot</div>
                            <div className="price-feature"><i className="bi bi-check-circle-fill" /> Pause anytime</div>
                            <div className="price-feature"><i className="bi bi-check-circle-fill" /> Same-morning sourcing</div>
                            <button className="price-btn">Choose Starter</button>
                        </div>
                    </div>

                    <div className="col-lg-4 col-md-6">
                        <div className="price-card featured">
                            <div className="price-badge">Most Popular</div>
                            <div className="price-plan-name">Family</div>
                            <div className="price-amount">₹1899</div>
                            <div className="price-unit">per month / 1L daily</div>
                            <div className="price-feature"><i className="bi bi-check-circle-fill" /> Priority 5AM delivery</div>
                            <div className="price-feature"><i className="bi bi-check-circle-fill" /> Free glass bottle swap</div>
                            <div className="price-feature"><i className="bi bi-check-circle-fill" /> Quality lab reports</div>
                            <button className="price-btn">Choose Family</button>
                        </div>
                    </div>

                    <div className="col-lg-4 col-md-6">
                        <div className="price-card">
                            <div className="price-plan-name">Bulk</div>
                            <div className="price-amount">₹3499</div>
                            <div className="price-unit">per month / 2L daily</div>
                            <div className="price-feature"><i className="bi bi-check-circle-fill" /> Dedicated delivery agent</div>
                            <div className="price-feature"><i className="bi bi-check-circle-fill" /> Custom delivery windows</div>
                            <div className="price-feature"><i className="bi bi-check-circle-fill" /> Restaurant & shop billing</div>
                            <button className="price-btn">Choose Bulk</button>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

export default Pricing;