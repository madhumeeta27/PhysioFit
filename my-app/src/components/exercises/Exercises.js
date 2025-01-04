import React from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import Navbar from "../shared/Navbar";

const Exercises = () => {
  const navigate = useNavigate();

  const exercises = [
    { id: "01", name: "Bending the knee without support while sitting", position: "Seated", side: "Left", bodyPart: "Lower" },
    { id: "02", name: "Bending the knee with support while sitting", position: "Seated", side: "Left", bodyPart: "Lower" },
    { id: "03", name: "Lift the extended leg", position: "Supine", side: "Left", bodyPart: "Lower" },
    { id: "04", name: "Bending the knee with bed support", position: "Supine", side: "Left", bodyPart: "Lower" },
    { id: "05", name: "Bending the knee without support while sitting", position: "Seated", side: "Right", bodyPart: "Lower" },
    { id: "06", name: "Bending the knee with support while sitting", position: "Seated", side: "Right", bodyPart: "Lower" },
    { id: "07", name: "Lift the extended leg", position: "Supine", side: "Right", bodyPart: "Lower" },
    { id: "08", name: "Bending the knee with bed support", position: "Supine", side: "Right", bodyPart: "Lower" },
    { id: "09", name: "Shoulder flexion", position: "Seated", side: "Left", bodyPart: "Upper" },
    { id: "10", name: "Horizontal weighted openings", position: "Standing", side: "Left", bodyPart: "Upper" },
    { id: "11", name: "External rotation of shoulders with elastic band", position: "Standing", side: "Left", bodyPart: "Upper" },
    { id: "12", name: "Circular pendulum", position: "Standing", side: "Left", bodyPart: "Upper" },
    { id: "13", name: "Shoulder flexion", position: "Seated", side: "Right", bodyPart: "Upper" },
    { id: "14", name: "Horizontal weighted openings", position: "Standing", side: "Right", bodyPart: "Upper" },
    { id: "15", name: "External rotation of shoulders with elastic band", position: "Standing", side: "Right", bodyPart: "Upper" },
    { id: "16", name: "Circular pendulum", position: "Standing", side: "Right", bodyPart: "Upper" },
  ];

  const handleExerciseClick = (exercise) => {
    window.open(`http://127.0.0.1:5000/exercise/${exercise.id}`, '_blank');
  };

  const handleLogout = () => {
    navigate("/login");
  };

  const navItems = [
    { type: 'scroll', to: '#portfolio', text: 'Dashboard' },
    { type: 'scroll', to: '#dashboard', text: 'Start Exercise' },
    { type: 'scroll', to: '#physiotherapist', text: 'Physiotherapist' },
    { type: 'scroll', to: '#contact', text: 'Contact' },
  ];

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      <Navbar handleLogout={handleLogout} navItems={navItems} />

      {/* Exercise List */}
      <div className="container" style={{ paddingTop: "100px" }}>
        <h1 className="text-center mb-4" style={{ color: '#2c3e50', fontWeight: '600' }}>
          Select an Exercise
        </h1>
        <div className="row">
          {exercises.map((exercise, index) => (
            <div key={exercise.id} className="col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title text-primary mb-3">Exercise {index + 1}</h5>
                  <div className="card-text">
                    <p className="mb-3"><strong>Description:</strong> {exercise.name}</p>
                    <p className="mb-3">
                      <span className="badge bg-info me-2">Position: {exercise.position}</span>
                      <span className="badge bg-success me-2">Side: {exercise.side}</span>
                      <span className="badge bg-warning">Body Part: {exercise.bodyPart}</span>
                    </p>
                  </div>
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => handleExerciseClick(exercise)}
                  >
                    Start Exercise
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Exercises;
