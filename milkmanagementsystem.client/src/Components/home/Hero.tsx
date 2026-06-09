import slider1 from "../../assets/images/news-image.jpg";

function Hero() {

  return (

    <section
      id="home"
      className="d-flex align-items-center"
      style={{

        minHeight: "100vh",

        background: `
          linear-gradient(
            rgba(0,0,0,0.5),
            rgba(0,0,0,0.5)
          ),
          url(${slider1})
        `,

        backgroundSize: "cover",

        backgroundPosition: "center",

        backgroundRepeat: "no-repeat",
      }}
    >

      <div className="container">

        <div className="row">

          <div className="col-lg-7 text-white">

            <h5 className="text-info fw-bold mb-3">

              WELCOME TO MEDINOVA

            </h5>

            <h1
              className="fw-bold mb-4"
              style={{
                fontSize: "70px",
              }}
            >

              Best Healthcare Solution
              <br />
              In Your City

            </h1>

            <div className="d-flex gap-3">

              <button className="btn btn-light btn-lg rounded-pill px-4">

                Find Doctor

              </button>

              <button className="btn btn-outline-light btn-lg rounded-pill px-4">

                Appointment

              </button>

            </div>

          </div>

        </div>

      </div>

    </section>

  );
}

export default Hero;