import json
import cv2
import mediapipe as mp
import time
import sys
from flask import Flask, request, Response

app = Flask(__name__)

# Load the dataset
try:
    with open("filtered_dataset.json", "r") as f:
        data = json.load(f)
except FileNotFoundError:
    raise FileNotFoundError("The dataset file 'filtered_dataset.json' was not found!")
except json.JSONDecodeError:
    raise ValueError("The dataset file is not a valid JSON!")

# Get exercise number from the API request
@app.route('/api/start-pose', methods=['POST'])
def start_pose():
    exercise_number = request.json.get('exercise')
    if not exercise_number or not exercise_number.isdigit() or int(exercise_number) < 10:
        return "Invalid exercise number! Choose between 1-9 and 12-16 (padded as 01-09, 12-16).", 400

    # Pad single-digit numbers with zero to match the dataset format
    exercise_number = f"0{exercise_number}" if int(exercise_number) < 10 else exercise_number

    # Validate the exercise number
    valid_exercises = [f"{i:02}" for i in range(1, 17) if i not in [10, 11]]
    if exercise_number not in valid_exercises:
        return "Invalid exercise number!", 400

    # Access the selected exercise data
    exercise_data = next((item for item in data['data'] if item['exercise'] == exercise_number), None)
    if not exercise_data:
        return f"Exercise '{exercise_number}' not found in the dataset!", 404

    # Initialize Mediapipe
    mp_pose = mp.solutions.pose
    mp_drawing = mp.solutions.drawing_utils
    pose = mp_pose.Pose()

    # Mapping custom joint names to Mediapipe landmarks
    joint_mapping = {
        "l_shoulder": mp_pose.PoseLandmark.LEFT_SHOULDER,
        "l_elbow": mp_pose.PoseLandmark.LEFT_ELBOW,
        "l_wrist": mp_pose.PoseLandmark.LEFT_WRIST,
        "r_shoulder": mp_pose.PoseLandmark.RIGHT_SHOULDER,
        "r_elbow": mp_pose.PoseLandmark.RIGHT_ELBOW,
        "r_wrist": mp_pose.PoseLandmark.RIGHT_WRIST,
        "l_hip": mp_pose.PoseLandmark.LEFT_HIP,
        "l_knee": mp_pose.PoseLandmark.LEFT_KNEE,
        "l_ankle": mp_pose.PoseLandmark.LEFT_ANKLE,
        "r_hip": mp_pose.PoseLandmark.RIGHT_HIP,
        "r_knee": mp_pose.PoseLandmark.RIGHT_KNEE,
        "r_ankle": mp_pose.PoseLandmark.RIGHT_ANKLE
    }

    # Access the selected exercise data
    exercise_data = next((item for item in data['data'] if item['exercise'] == exercise_number), None)

    frames_data = exercise_data['cameras']['0']['frames']
    starting_frame = frames_data[0]
    reference_joints = {
        joint: (
            float(starting_frame["joints"][joint]["x"]),
            float(starting_frame["joints"][joint]["y"])
        )
        for joint in joint_mapping.keys()
    }

    # Start video capture
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        return "Cannot access the webcam. Make sure it is connected and not being used by another application.", 500

    # Helper function to calculate deviation
    def calculate_deviation(detected_joints, reference_joints):
        deviations = {}
        directions = {}
        for joint in detected_joints:
            detected_x, detected_y = detected_joints[joint]
            ref_x, ref_y = reference_joints[joint]
            deviations[joint] = abs(detected_x - ref_x) + abs(detected_y - ref_y)
            directions[joint] = ("left" if detected_x < ref_x else "right", "up" if detected_y < ref_y else "down")
        return deviations, directions

    # Start video stream
    def generate_frames():
        exercise_started = False
        start_time = None
        while cap.isOpened():
            ret, frame = cap.read()

            frame_height, frame_width, _ = frame.shape
            DEVIATION_THRESHOLD = 0.1 * frame_width  # Adjust threshold as needed

            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(rgb_frame)

            if results.pose_landmarks:
                mp_drawing.draw_landmarks(
                    frame,
                    results.pose_landmarks,
                    mp_pose.POSE_CONNECTIONS,
                    mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=4),
                    mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2)
                )

                detected_joints = {
                    joint: (
                        results.pose_landmarks.landmark[joint_mapping[joint]].x * frame_width,
                        results.pose_landmarks.landmark[joint_mapping[joint]].y * frame_height
                    )
                    for joint in joint_mapping.keys()
                }

                deviations, directions = calculate_deviation(detected_joints, reference_joints)

                feedback_messages = [
                    f"Move your {joint.replace('_', ' ')} {dir_x} and {dir_y}."
                    for joint, (dir_x, dir_y) in directions.items()
                    if deviations[joint] > DEVIATION_THRESHOLD
                ]

                if not exercise_started and not feedback_messages:
                    exercise_started = True
                    start_time = time.time()

                if exercise_started:
                    cv2.putText(frame, "Exercise Started!", (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

                for idx, message in enumerate(feedback_messages):
                    cv2.putText(frame, message, (10, 100 + idx * 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

                exercise_completed = all(deviation <= DEVIATION_THRESHOLD for deviation in deviations.values())
                if exercise_completed:
                    cv2.putText(frame, "Exercise is Correct!", (10, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

            # Calculate elapsed time and display it on the frame
            if start_time is not None:
                elapsed_time = time.time() - start_time
                minutes = int(elapsed_time // 60)
                seconds = int(elapsed_time % 60)
                time_str = f"{minutes:02}:{seconds:02}"

                # Calculate the position to center the timer text
                text_size = cv2.getTextSize(time_str, cv2.FONT_HERSHEY_SIMPLEX, 1, 2)[0]
                text_x = (frame_width - text_size[0]) // 2  # Center horizontally
                cv2.putText(frame, f"Time: {time_str}", (text_x, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)

            # Display the frame
            ret, buffer = cv2.imencode('.jpg', frame)
            yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(debug=True)