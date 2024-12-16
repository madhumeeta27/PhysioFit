import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const StartExercise = () => {
  const { exercise } = useParams(); // Get exercise from URL

  useEffect(() => {
    const startPoseDetection = async () => {
      try {
        const response = await axios.post("http://127.0.0.1:5000/api/start-pose", {
          exercise,
        });
        console.log(response.data.message);
      } catch (error) {
        console.error("Error starting pose detection:", error);
      }
    };

    startPoseDetection();
  }, [exercise]);

  return (
    <div className="container mt-4">
      <h1>Starting Exercise No. {exercise}...</h1>
      <p>
        Ensure your camera is turned on and follow the exercise instructions.
      </p>
    </div>
  );
};

export default StartExercise;
