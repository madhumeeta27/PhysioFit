import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";

const Exercises = () => {
  const navigate = useNavigate();

  const exercises = [
    // Your exercise data here
  ];

  const handleExerciseClick = (exercise) => {
    // Open new tab with Flask app URL
    window.open(`http://127.0.0.1:5000/start-exercise/${exercise.id}`, '_blank');
  };

  const handleHomeClick = () => {
    navigate("/patient");
  };

  return (
    <div>
      <nav className="navbar bg-secondary d-flex justify-content-between px-4">
        <h1 className="navbar-brand text-white">PhysioFit</h1>
        <button className="btn btn-outline-primary" onClick={handleHomeClick}>
          <FaHome className="me-2" /> Home
        </button>
      </nav>
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
