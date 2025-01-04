import React from "react";
import { Link } from "react-router-dom";

const Navbar = ({ handleLogout, navItems }) => {
  return (
    <nav className="navbar navbar-expand-lg bg-secondary fixed-top" id="mainNav">
      <div className="container-fluid">
        <Link className="navbar-brand js-scroll-trigger" to="/">
          PhysioFit
        </Link>
        <button
          className="navbar-toggler navbar-toggler-right font-weight-bold bg-primary text-white rounded"
          type="button"
          data-toggle="collapse"
          data-target="#navbarResponsive"
          aria-controls="navbarResponsive"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          Menu <i className="fas fa-bars"></i>
        </button>
        <div className="collapse navbar-collapse" id="navbarResponsive">
          <ul className="navbar-nav ml-auto">
            {navItems.map((item, index) => (
              <li key={index} className="nav-item mx-0 mx-lg-1">
                {item.type === 'scroll' ? (
                  <a
                    className="nav-link py-3 px-0 px-lg-3 rounded js-scroll-trigger"
                    href={item.to}
                  >
                    {item.text}
                  </a>
                ) : item.type === 'link' ? (
                  <Link
                    to={item.to}
                    className="nav-link py-3 px-0 px-lg-3 rounded js-scroll-trigger"
                  >
                    {item.text}
                  </Link>
                ) : null}
              </li>
            ))}
            <li className="nav-item mx-0 mx-lg-1">
              <button
                className="btn btn-outline-light nav-link py-3 px-0 px-lg-3 rounded"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 