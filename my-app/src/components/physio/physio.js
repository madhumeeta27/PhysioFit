import React, { useEffect, useState } from "react";
import "./styles/body.css";
import "./styles/heading.css";
import "./styles/styles.css";
import avatar from "./assets/img/avatar.svg";
import person from "./assets/img/person.png";
import $ from "jquery";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const Physio = () => {
  const navigate = useNavigate();
  const [doctorDetails, setDoctorDetails] = useState({
    name: "Loading...",
    hospital: "Loading...",
    address: "Loading...",
    contact: "Loading...",
    email: "Loading...",
  });

  useEffect(() => {
    // Retrieve doctor's details from sessionStorage
    const physioName = sessionStorage.getItem("physioName");
    const hospitalName = sessionStorage.getItem("hospitalName");
    const hospitalAddress = sessionStorage.getItem("hospitalAddress");
    const contactNo = sessionStorage.getItem("contactNo");
    const emailID = sessionStorage.getItem("emailID");

    if (physioName && hospitalName && hospitalAddress) {
      setDoctorDetails({
        name: physioName,
        hospital: hospitalName,
        address: hospitalAddress,
        contact: contactNo,
        email: emailID,
      });
    } else {
      // If data is not found, redirect to login page
      navigate("/login");
    }

    // jQuery Smooth Scrolling
    $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
      if (
        window.location.pathname.replace(/^\//, "") ===
          this.pathname.replace(/^\//, "") &&
        window.location.hostname === this.hostname
      ) {
        let target = $(this.hash);
        target = target.length ? target : $("[name=" + this.hash.slice(1) + "]");
        if (target.length) {
          $("html, body").animate(
            {
              scrollTop: target.offset().top - 71,
            },
            1000,
            "easeInOutExpo"
          );
          return false;
        }
      }
    });

    // Navbar collapse logic
    const navbarCollapse = () => {
      if ($("#mainNav").offset()?.top > 100) {
        $("#mainNav").addClass("navbar-shrink");
      } else {
        $("#mainNav").removeClass("navbar-shrink");
      }
    };
    $(window).scroll(navbarCollapse);
    navbarCollapse();

    // Scroll to top button
    $(document).scroll(() => {
      const scrollDistance = $(this).scrollTop();
      if (scrollDistance > 100) {
        $(".scroll-to-top").fadeIn();
      } else {
        $(".scroll-to-top").fadeOut();
      }
    });

    // Add class to body for specific styles
    document.body.className = "physio-body";
    
    return () => {
      document.body.className = ""; // Clean up on component unmount
    };
  }, [navigate]);

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        sessionStorage.clear(); // Clear sessionStorage on logout
        navigate("/login");
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg bg-secondary fixed-top" id="mainNav">
        <div className="container-fluid">
          <a className="navbar-brand js-scroll-trigger" href="#page-top">
            PhysioFit
          </a>
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
              <li className="nav-item mx-0 mx-lg-1">
                <a
                  className="nav-link py-3 px-0 px-lg-3 rounded js-scroll-trigger"
                  href="#portfolio"
                >
                  PATIENTS
                </a>
              </li>
              <li className="nav-item mx-0 mx-lg-1">
                <a
                  className="nav-link py-3 px-0 px-lg-3 rounded js-scroll-trigger"
                  href="#about"
                >
                  SCHEDULE
                </a>
              </li>
              <li className="nav-item mx-0 mx-lg-1">
                <a
                  className="nav-link py-3 px-0 px-lg-3 rounded js-scroll-trigger"
                  href="#contact"
                >
                  CONTACT
                </a>
              </li>
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

      {/* Header */}
      <header className="masthead container-fluid bg-primary text-white text-center">
        <div className="d-flex align-items-center flex-column">
          <img
            className="masthead-avatar mb-5"
            src={avatar}
            alt="Avatar"
            style={{ width: "200px" }}
          />
          <h1
            className="masthead-heading mb-3"
            id="doctor-name"
            style={{ fontSize: "3.5rem" }}
          >
            WELCOME, {doctorDetails.name}
          </h1>
          <div className="divider-custom divider-light">
            <div className="divider-custom-line"></div>
            <div className="divider-custom-icon">
              <i className="fas fa-star"></i>
            </div>
            <div className="divider-custom-line"></div>
          </div>
          <p className="pre-wrap masthead-subheading font-weight-light mb-0">
            Physio Therapist, {doctorDetails.hospital}
          </p>
        </div>
      </header>

      {/* Patients Section */}
      <section className="page-section portfolio" id="portfolio" style={{ backgroundColor: "#2c3e50", color: "#ffffff", backgroundColor: "#2c3e50 !important", color: "#ffffff !important" }}>
        <div className="container-fluid">
          <div className="text-center">
            <h2 className="page-section-heading text-secondary mb-0 d-inline-block">
              PATIENTS
            </h2>
          </div>
          <div className="divider-custom">
            <div className="divider-custom-line"></div>
            <div className="divider-custom-icon">
              <i className="fas fa-star"></i>
            </div>
            <div className="divider-custom-line"></div>
          </div>
          <div className="row justify-content-center">
            {["John Doe", "Jane Smith", "Alice Brown", "Bob Johnson"].map(
              (patient, index) => (
                <div className="col-md-6 col-lg-3 mb-5" key={index}>
                  <div className="portfolio-item mx-auto">
                    <img
                      className="img-fluid"
                      src={person}
                      alt={patient}
                    />
                    <h5 className="text-center mt-3">{patient}</h5>
                    <p className="text-center text-muted">Condition</p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="page-section bg-primary text-white mb-0" id="about">
        <div className="container-fluid">
          <div className="text-center">
            <h2 className="page-section-heading d-inline-block text-white">
              DOCTOR'S SCHEDULE
            </h2>
          </div>
          <div className="divider-custom divider-light">
            <div className="divider-custom-line"></div>
            <div className="divider-custom-icon">
              <i className="fas fa-star"></i>
            </div>
            <div className="divider-custom-line"></div>
          </div>
          <div className="row">
            <div className="col-lg-6">
              <h4 className="text-center text-uppercase">Morning Schedule</h4>
              <ul className="list-unstyled lead">
                <li>8:00 AM - Ward Rounds</li>
                <li>9:30 AM - Outpatient Consultations</li>
              </ul>
            </div>
            <div className="col-lg-6">
              <h4 className="text-center text-uppercase">Afternoon Schedule</h4>
              <ul className="list-unstyled lead">
                <li>1:00 PM - Lunch Break</li>
                <li>2:00 PM - Specialized Surgeries</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer bg-secondary">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 ml-auto">
              <h4 className="text-uppercase mb-4">Contact</h4>
              <ul className="list-unstyled">
                <li>
                  <i className="fas fa-phone-alt mr-2"></i>{doctorDetails.contact}
                </li>
                <li>
                  <i className="fas fa-envelope mr-2"></i>{doctorDetails.email}
                </li>
              </ul>
            </div>
            <div className="col-lg-4 mr-auto">
              <h4 className="text-uppercase mb-4">Location</h4>
              <p>{doctorDetails.address}</p>
            </div>  
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <a className="scroll-to-top rounded js-scroll-trigger" href="#page-top">
        <i className="fas fa-angle-up"></i>
      </a>
    </div>
  );
};

export default Physio;
