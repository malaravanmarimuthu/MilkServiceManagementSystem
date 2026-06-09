import { useLocation } from "react-router-dom";

function Header() {

  const location = useLocation();

  const isHidden =
    location.pathname === "/patients" ||
    location.pathname === "/login";

  if (isHidden) return null;

  return (

    <div className="bg-light py-2 border-bottom">

      <div className="container d-flex justify-content-between">

        <span>
          Welcome to Professional Health Care
        </span>

        <span>
          📞 010-060-0160
        </span>

      </div>

    </div>

  );
}

export default Header;