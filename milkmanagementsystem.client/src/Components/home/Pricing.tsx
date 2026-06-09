function Pricing() {

  return (

    <div className="container py-5">

      {/* TITLE */}

      <div className="text-center mb-5">

        <h5 className="text-info fw-bold">

          PRICING

        </h5>

        <h1 className="fw-bold">

          Medical Packages

        </h1>

      </div>

      {/* PRICE CARDS */}

      <div className="row g-4">

        <div className="col-lg-4">

          <div className="bg-light p-5 rounded shadow text-center h-100">

            <h3 className="fw-bold">

              Basic

            </h3>

            <h1 className="text-info my-4">

              ₹499

            </h1>

            <p>

              General Checkup

            </p>

            <p>

              Blood Test

            </p>

            <p>

              Basic Consultation

            </p>

            <button className="btn btn-info text-white mt-3">

              Book Now

            </button>

          </div>

        </div>

        <div className="col-lg-4">

          <div className="bg-light p-5 rounded shadow text-center h-100">

            <h3 className="fw-bold">

              Premium

            </h3>

            <h1 className="text-info my-4">

              ₹999

            </h1>

            <p>

              Heart Checkup

            </p>

            <p>

              Scan Included

            </p>

            <p>

              Specialist Doctor

            </p>

            <button className="btn btn-info text-white mt-3">

              Book Now

            </button>

          </div>

        </div>

        <div className="col-lg-4">

          <div className="bg-light p-5 rounded shadow text-center h-100">

            <h3 className="fw-bold">

              VIP

            </h3>

            <h1 className="text-info my-4">

              ₹1999

            </h1>

            <p>

              Full Body Checkup

            </p>

            <p>

              Priority Support

            </p>

            <p>

              Personal Doctor

            </p>

            <button className="btn btn-info text-white mt-3">

              Book Now

            </button>

          </div>

        </div>

      </div>

    </div>

  );
}

export default Pricing;