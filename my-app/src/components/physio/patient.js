import React, { useEffect, useState } from "react";
import "./styles/body.css";
import "./styles/heading.css";
import "./styles/styles.css";
import avatar from "./assets/img/avatar.svg";
import $ from "jquery";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const Patient = () => {
  const navigate = useNavigate();
  const [patientDetails, setPatientDetails] = useState({
    firstName: "Loading...",
    lastName: "Loading...",
    assignedTherapist: "Loading...",
    contact: "Loading...",
    email: "Loading...",
  });
  const [therapistDetails, setTherapistDetails] = useState({
    name: "Loading...",
    contact: "Loading...",
    email: "Loading...",
  });

  useEffect(() => {
    // Retrieve patient details from sessionStorage
    const assignedTherapist = sessionStorage.getItem("assignedTherapist");
    const contactNo = sessionStorage.getItem("contactNo");
    const emailID = sessionStorage.getItem("emailID");
    const patientName = sessionStorage.getItem("patientName");

    if (assignedTherapist && contactNo && emailID && patientName) {
      setPatientDetails({
        assignedTherapist,
        contact: contactNo,
        email: emailID,
        name: patientName,
      });
    } else {
      // If data is not found, redirect to login page
      navigate("/login");
    }
// Fetch therapist details based on assignedTherapist ID
fetch(`/api/therapists/${assignedTherapist}`) // Adjust the API endpoint according to your backend setup
  .then((response) => {
    if (!response.ok) {
      // If the response status is not OK, throw an error
      throw new Error('Failed to fetch therapist details');
    }

    // Check the content type of the response
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error('Response is not in JSON format');
    }

    // Parse JSON if the content type is application/json
    return response.json();
  })
  .then((data) => {
    setTherapistDetails({
      name: data.name,
      contact: data.contact,
      email: data.email,
    });
  })
  .catch((error) => {
    console.error("Error fetching therapist details:", error.message);
    // Optionally, display a user-friendly error message
  });




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
    document.body.className = "patient-body";

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
                  Dashboard
                </a>
              </li>
              <li className="nav-item mx-0 mx-lg-1">
                <a
                  className="nav-link py-3 px-0 px-lg-3 rounded js-scroll-trigger"
                  href="#dashboard"
                >
                  Start Exercise
                </a>
              </li>
              <li className="nav-item mx-0 mx-lg-1">
                <a
                  className="nav-link py-3 px-0 px-lg-3 rounded js-scroll-trigger"
                  href="#physiotherapist"
                >
                  Physiotherapist
                </a>
              </li>
              <li className="nav-item mx-0 mx-lg-1">
                <a
                  className="nav-link py-3 px-0 px-lg-3 rounded js-scroll-trigger"
                  href="#contact"
                >
                  Contact
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
            WELCOME, {patientDetails.name}
          </h1>
          <div className="divider-custom divider-light">
            <div className="divider-custom-line"></div>
            <div className="divider-custom-icon">
              <i className="fas fa-star"></i>
            </div>
            <div className="divider-custom-line"></div>
          </div>
        </div>
      </header>

      {/* Dashboard Section */}
      <section className="page-section portfolio" id="portfolio" style={{ backgroundColor: "#2c3e50", color: "#ffffff", backgroundColor: "#2c3e50 !important", color: "#ffffff !important" }}>
        <div className="container-fluid">
          <div className="text-center">
            <h2 className="page-section-heading text-secondary mb-0 d-inline-block">
              Dashboard
            </h2>
          </div>
          <div className="divider-custom">
            <div className="divider-custom-line"></div>
            <div className="divider-custom-icon">
              <i className="fas fa-star"></i>
            </div>
            <div className="divider-custom-line"></div>
          </div>
          <p>Welcome to your personalized dashboard. Here you can track your progress, view assigned exercises, and communicate with your physiotherapist.</p>
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-3 mb-5">
              <div className="portfolio-item mx-auto">
                <h5 className="text-center mt-3">Assigned Exercises</h5>
                <p className="text-center text-muted">View and start your assigned exercises</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/assigned-exercises")}
                >
                  Start Exercise
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Physiotherapist Section */}
        <section className="page-section bg-primary text-white mb-0" id="physiotherapist">
        <div className="container-fluid">
            <div className="text-center">
            <h2 className="page-section-heading d-inline-block text-white">
                Assigned Physiotherapist
            </h2>
            </div>
            <div className="divider-custom divider-light">
            <div className="divider-custom-line"></div>
            <div className="divider-custom-icon">
                <i className="fas fa-star"></i>
            </div>
            <div className="divider-custom-line"></div>
            </div>
            <p className="text-center font-weight-light mb-5">View the details of your assigned physiotherapist below.</p>
            <div className="row justify-content-center">
            <div className="col-lg-6">
                <div className="card bg-dark text-white shadow">
                <div className="card-body">
                    <h5 className="card-title text-center">Physiotherapist Name</h5>
                    <p className="card-text text-center">{therapistDetails.name}</p>
                    <h5 className="card-title text-center">Contact</h5>
                    <p className="card-text text-center">{therapistDetails.contact}</p>
                    <h5 className="card-title text-center">Email</h5>
                    <p className="card-text text-center">{therapistDetails.email}</p>
                </div>
                </div>
            </div>
            </div>
        </div>
        </section>


      {/* Contact Section */}
      <section className="page-section bg-dark text-white mb-0" id="contact">
        <div className="container-fluid">
          <div className="text-center">
            <h2 className="page-section-heading d-inline-block text-white">
              Contact
            </h2>
          </div>
          <div className="divider-custom divider-light">
            <div className="divider-custom-line"></div>
            <div className="divider-custom-icon">
              <i className="fas fa-star"></i>
            </div>
            <div className="divider-custom-line"></div>
          </div>
          <p className="text-center font-weight-light">Email: {patientDetails.email}</p>
          <p className="text-center font-weight-light">Phone: {patientDetails.contact}</p>
        </div>
      </section>
    </div>
  );
};

export default Patient;
