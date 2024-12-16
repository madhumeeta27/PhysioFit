import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const StartExercise = () => {
  const { exercise } = useParams();
  const [cameraStream, setCameraStream] = useState(null);
  const [feedbackMessages, setFeedbackMessages] = useState([]);
  const videoRef = React.createRef();

  useEffect(() => {
    // Function to start pose detection
    const startPoseDetection = async () => {
      try {
        const response = await axios.post("http://127.0.0.1:5000/api/start-pose", { exercise });
        console.log(response.data.message);
      } catch (error) {
        console.error("Error starting pose detection:", error);
      }
    };

    // Set up camera stream
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        setCameraStream(stream);
        videoRef.current.srcObject = stream;
      })
      .catch((error) => {
        console.error("Error accessing camera:", error);
      });

    startPoseDetection();
  }, [exercise]);

  useEffect(() => {
    // Set up the feedback display
    const handlePoseDetection = async (videoElement) => {
      const mpPose = new window.mediapipe.pose.Pose();
      const mpDraw = new window.mediapipe.drawingUtils();
      const frameRate = 10;
      let frameCounter = 0;

      const detectPoses = () => {
        const video = videoElement.current;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        video.play();
        const frameLoop = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const rgbFrame = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          mpPose.send({ image: rgbFrame }, (results) => {
            if (results.poseLandmarks) {
              const landmarks = results.poseLandmarks;
              const joints = {
                l_shoulder: [landmarks[11].x, landmarks[11].y],
                l_elbow: [landmarks[13].x, landmarks[13].y],
                l_wrist: [landmarks[15].x, landmarks[15].y],
                r_shoulder: [landmarks[12].x, landmarks[12].y],
                r_elbow: [landmarks[14].x, landmarks[14].y],
                r_wrist: [landmarks[16].x, landmarks[16].y],
                l_hip: [landmarks[23].x, landmarks[23].y],
                l_knee: [landmarks[25].x, landmarks[25].y],
                l_ankle: [landmarks[27].x, landmarks[27].y],
                r_hip: [landmarks[24].x, landmarks[24].y],
                r_knee: [landmarks[26].x, landmarks[26].y],
                r_ankle: [landmarks[28].x, landmarks[28].y],
              };

              // Send frame to the server for analysis
              axios.post("http://127.0.0.1:5000/api/start-pose", {
                exercise: exercise,
                joints: joints
              })
              .then((response) => {
                setFeedbackMessages(response.data.feedback);
              })
              .catch((error) => {
                console.error("Error getting feedback:", error);
              });

              frameCounter++;
              if (frameCounter >= frameRate) {
                frameCounter = 0;
              }
            }
          });

          requestAnimationFrame(frameLoop);
        };

        frameLoop();
      };

      detectPoses();
    };

    if (cameraStream && videoRef.current) {
      handlePoseDetection(videoRef);
    }
  }, [cameraStream]);

  return (
    <div>
      <h2>Exercise Feedback</h2>
      <video ref={videoRef} width="640" height="480" autoPlay></video>
      {feedbackMessages.map((message, index) => (
        <p key={index}>{message}</p>
      ))}
    </div>
  );
};

export default StartExercise;
