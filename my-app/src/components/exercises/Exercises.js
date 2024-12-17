import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";

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
    // Open new tab with Flask app URL
    window.open(`http://127.0.0.1:5000/exercise_feed/${exercise.id}`, '_blank');
  };

  const handleHomeClick = () => {
    navigate("/patient"); // Navigate to Patient component
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar bg-secondary d-flex justify-content-between px-4">
        <h1 className="navbar-brand text-white">PhysioFit</h1>
        <button className="btn btn-outline-primary" onClick={handleHomeClick}>
          <FaHome className="me-2" /> Home
        </button>
      </nav>

      {/* Exercise List */}
      <div className="container mt-4">
        <h1>Select an Exercise</h1>
        <ul className="list-group">
          {exercises.map((exercise, index) => (
            <li key={exercise.id} className="list-group-item">
              <button
                className="btn btn-primary w-25 mb-2"
                onClick={() => handleExerciseClick(exercise)}
              >
                Exercise {index + 1}
              </button>
              <p>
                <strong>Description:</strong> {exercise.name} <br />
                <strong>Position:</strong> {exercise.position} <br />
                <strong>Side:</strong> {exercise.side} <br />
                <strong>Body Part:</strong> {exercise.bodyPart}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Exercises;
