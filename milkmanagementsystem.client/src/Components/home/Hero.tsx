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

              WELCOME TO 4K FRESH

            </h5>

            <h1
              className="fw-bold mb-4"
              style={{
                fontSize: "70px",
              }}
            >

              FRESH MILK 
              <br />
              In Your City

            </h1>        

            </div>

          </div>

        </div>

            </section>

  );
}

export default Hero;