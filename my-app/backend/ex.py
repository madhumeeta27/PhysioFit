import json
import cv2
import mediapipe as mp

# Load the dataset
with open("filtered_dataset.json", "r") as f:
    data = json.load(f)

# Select the exercise "09"
exercise_data = None
for item in data['data']:
    if item['exercise'] == "09":
        exercise_data = item
        break

if not exercise_data:
    raise ValueError("Exercise '09' not found in the dataset!")
else:
    print("Exercise '09' accessed successfully!")

# Load the first frame's reference joints
frames_data = exercise_data['cameras']['0']['frames']
starting_frame = frames_data[0]
starting_joints = {
    "l_shoulder": (float(starting_frame["joints"]["l_shoulder"]["x"]), float(starting_frame["joints"]["l_shoulder"]["y"])),
    "l_elbow": (float(starting_frame["joints"]["l_elbow"]["x"]), float(starting_frame["joints"]["l_elbow"]["y"])),
    "l_wrist": (float(starting_frame["joints"]["l_wrist"]["x"]), float(starting_frame["joints"]["l_wrist"]["y"]))
}

# Initialize Mediapipe
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
pose = mp_pose.Pose()

# Start video capture
cap = cv2.VideoCapture(0)
exercise_started = False

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    frame_height, frame_width, _ = frame.shape

    # Convert frame to RGB
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Perform pose detection
    results = pose.process(rgb_frame)

    if results.pose_landmarks:
        # Draw full body pose landmarks
        mp_drawing.draw_landmarks(
            frame,
            results.pose_landmarks,
            mp_pose.POSE_CONNECTIONS,
            mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=4),
            mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2)
        )

        # Extract detected joints
        detected_joints = {
            "l_shoulder": (results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER].x,
                           results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER].y),
            "l_elbow": (results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_ELBOW].x,
                        results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_ELBOW].y),
            "l_wrist": (results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_WRIST].x,
                        results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_WRIST].y)
        }

        # Normalize dataset joints for comparison
        normalized_dataset_joints = {
            joint: (x / frame_width, y / frame_height)
            for joint, (x, y) in starting_joints.items()
        }

        if not exercise_started:
            # Check if user is in the starting position
            start_ready = True
            for joint, (detected_x, detected_y) in detected_joints.items():
                dataset_x, dataset_y = normalized_dataset_joints[joint]
                deviation = abs(detected_x - dataset_x) + abs(detected_y - dataset_y)
                if deviation > 0.05:  # Adjust the threshold as needed
                    start_ready = False
                    cv2.putText(frame, f"Adjust your {joint.replace('_', ' ')}!",
                                (50, 50 + 30 * list(detected_joints.keys()).index(joint)),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

            if start_ready:
                exercise_started = True
                cv2.putText(frame, "Exercise Started!", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        else:
            # Normal exercise feedback
            for joint, (detected_x, detected_y) in detected_joints.items():
                dataset_x, dataset_y = normalized_dataset_joints[joint]
                deviation = abs(detected_x - dataset_x) + abs(detected_y - dataset_y)

                if deviation > 0.05:  # Adjust threshold for deviations
                    cv2.putText(frame, f"Adjust your {joint.replace('_', ' ')}!",
                                (50, 50 + 30 * list(detected_joints.keys()).index(joint)),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

    # Display the frame
    cv2.imshow("Pose Detection - Exercise 09", frame)

    if cv2.waitKey(10) & 0xFF == ord('q'):  # Press 'q' to quit
        break

cap.release()
cv2.destroyAllWindows()