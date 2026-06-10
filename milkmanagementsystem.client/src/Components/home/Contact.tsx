function Contact() {

  return (

    <div className="container py-5">

      {/* TITLE */}

      <div className="text-center mb-5">

        <h5 className="text-info fw-bold">

          CONTACT US

        </h5>

        <h1 className="fw-bold">

          Please Feel Free To Contact Us

        </h1>

      </div>

      {/* CONTACT BOXES */}

      <div className="row g-4 mb-5">

        <div className="col-lg-4">

          <div className="bg-light p-4 rounded shadow-sm text-center">

            <h4 className="text-info">

              Address

            </h4>

            <p>

              123 Street, Chennai

            </p>

          </div>

        </div>

        <div className="col-lg-4">

          <div className="bg-light p-4 rounded shadow-sm text-center">

            <h4 className="text-info">

              Phone

            </h4>

            <p>

              +91 9876543210

            </p>

          </div>

        </div>

        <div className="col-lg-4">

          <div className="bg-light p-4 rounded shadow-sm text-center">

            <h4 className="text-info">

              Email

            </h4>

            <p>

              medinova@gmail.com

            </p>

          </div>

        </div>

      </div>

      {/* CONTACT FORM */}

      <div className="row justify-content-center">

        <div className="col-lg-8">

          <div className="bg-light p-5 rounded shadow">

            <form>

              <div className="row g-3">

                <div className="col-md-6">

                  <input
                    type="text"
                    placeholder="Your Name"
                    className="form-control"
                  />

                </div>

                <div className="col-md-6">

                  <input
                    type="email"
                    placeholder="Your Email"
                    className="form-control"
                  />

                </div>

                <div className="col-12">

                  <input
                    type="text"
                    placeholder="Subject"
                    className="form-control"
                  />

                </div>

                <div className="col-12">

                  <textarea
                    rows={5}
                    placeholder="Message"
                    className="form-control"
                  ></textarea>

                </div>

                <div className="col-12 text-center">

                  <button className="btn btn-info text-white px-5">

                    Send Message

                  </button>

                </div>

              </div>

            </form>

          </div>

        </div>

      </div>

    </div>

  );
}

export default Contact;