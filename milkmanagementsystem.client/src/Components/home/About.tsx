import aboutImg from "../../assets/images/about-bg.jpg";
function About() {

    return (

    <div className="container py-5">

      <div className="row align-items-center">

        {/* LEFT IMAGE */}

        <div className="col-lg-6 mb-4">

          <img
            src={aboutImg}
            alt="about"
            className="img-fluid rounded shadow"
          />

        </div>

        {/* RIGHT CONTENT */}

        <div className="col-lg-6">

          <h5 className="text-info fw-bold">

            ABOUT US

          </h5>

          <h1 className="fw-bold mb-4">

            Best Medical Care
            For Yourself & Your Family

          </h1>

          <p className="text-secondary">

            We provide high quality
            healthcare services with
            expert doctors and modern
            medical facilities.

          </p>

          <div className="row mt-4">

            <div className="col-6">

              <div className="bg-white p-3 rounded shadow-sm text-center">

                <h2 className="text-info">

                  15+

                </h2>

                <p>

                  Expert Doctors

                </p>

              </div>

            </div>

            <div className="col-6">

              <div className="bg-white p-3 rounded shadow-sm text-center">

                <h2 className="text-info">

                  24/7

                </h2>

                <p>

                  Emergency Service

                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

            </div>

  );
}

export default About;