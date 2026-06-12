import {NavLink,useLocation,} from "react-router-dom";

function Navbar() {

  const location = useLocation();

  // PATIENT PAGE CHECK

  const isPatientPage =
    location.pathname.includes("patient");

  return (

    <nav
      className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top"
    >

      <div className="container">

        {/* LOGO */}

        <NavLink
          to="/"
          className="navbar-brand fw-bold text-info fs-2"
        >

          MEDINOVA

        </NavLink>

        {/* MOBILE BUTTON */}

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >

          <span className="navbar-toggler-icon"></span>

        </button>

        {/* MENU */}

        <div
          className="collapse navbar-collapse"
          id="navbarNav"
        >

          <ul className="navbar-nav ms-auto align-items-center">

            <li className="nav-item">

              <NavLink
                to="/"
                className="nav-link"
              >

                Home

              </NavLink>

            </li>

            <li className="nav-item">

              <NavLink
                to="/about"
                className="nav-link"
              >

                About

              </NavLink>

            </li>

            <li className="nav-item">

              <NavLink
                to="/service"
                className="nav-link"
              >

                Service

              </NavLink>

            </li>

            <li className="nav-item">

              <NavLink
                to="/pricing"
                className="nav-link"
              >

                Pricing

              </NavLink>

            </li>

            <li className="nav-item">

              <NavLink
                to="/contact"
                className="nav-link"
              >

                Contact

              </NavLink>

            </li>

            {/* LOGIN BUTTON */}

            {

              !isPatientPage && (

                <li className="nav-item ms-3">

                  <NavLink
                    to="/login"
                    className="btn btn-info text-white rounded-pill px-4"
                  >

                    Login

                  </NavLink>

                </li>

              )

            }

          </ul>

        </div>

      </div>

    </nav>

  );

}

export default Navbar;