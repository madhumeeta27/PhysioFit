import json
import cv2
import mediapipe as mp
import time
import sys
from collections import deque
import math

# Load the dataset
try:
    with open("filtered_dataset.json", "r") as f:
        data = json.load(f)
except FileNotFoundError:
    raise FileNotFoundError("The dataset file 'filtered_dataset.json' was not found!")
except json.JSONDecodeError:
    raise ValueError("The dataset file is not a valid JSON!")

# Get exercise number from user
exercise_number = input("Enter exercise number (1-16, excluding 10 and 11): ").strip()

# Pad single-digit numbers with zero to match the dataset format
if exercise_number.isdigit() and int(exercise_number) < 10:
    exercise_number = f"0{exercise_number}"

# Validate the exercise number
valid_exercises = [f"{i:02}" for i in range(1, 17) if i not in [10, 11]]
if exercise_number not in valid_exercises:
    raise ValueError("Invalid exercise number! Choose between 1-9 and 12-16 (padded as 01-09, 12-16).")

# Access the selected exercise data
exercise_data = next((item for item in data['data'] if item['exercise'] == exercise_number), None)
if not exercise_data:
    raise ValueError(f"Exercise '{exercise_number}' not found in the dataset!")

# Define joint mappings for exercises
exercise_joints = {
    **dict.fromkeys(["01", "02", "03", "04", "05"], ["l_hip", "l_knee", "l_ankle"]),
    **dict.fromkeys(["06", "07", "08"], ["r_hip", "r_knee", "r_ankle"]),
    **dict.fromkeys(["09", "12"], ["l_shoulder", "l_elbow", "l_wrist"]),
    **dict.fromkeys(["13", "14", "15", "16"], ["r_shoulder", "r_elbow", "r_wrist"])
}

selected_joints = exercise_joints[exercise_number]

# Load the first frame's reference joints
try:
    frames_data = exercise_data['cameras']['0']['frames']
    starting_frame = frames_data[0]
    reference_joints = {
        joint: (
            float(starting_frame["joints"][joint]["x"]),
            float(starting_frame["joints"][joint]["y"])
        )
        for joint in selected_joints
    }
except (KeyError, IndexError) as e:
    raise ValueError("Invalid dataset format: missing required keys or data!") from e

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

# Start video capture for live user comparison
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    raise RuntimeError("Cannot access the webcam. Make sure it is connected and not being used by another application.")

# Start video capture for exercise video based on exercise number
video_filename = f"{exercise_number}.mp4"  # Dynamically create the video filename based on exercise number
video_capture = cv2.VideoCapture(video_filename)

if not video_capture.isOpened():
    raise RuntimeError(f"Cannot access the video file '{video_filename}'. Make sure the file exists and is accessible.")

def calculate_deviation(detected_joints, reference_joints):
    deviations = {}
    directions = {}
    for joint in detected_joints:
        detected_x, detected_y = detected_joints[joint]
        ref_x, ref_y = reference_joints[joint]
        # Calculate the Euclidean distance between detected and reference joints
        deviations[joint] = math.sqrt((detected_x - ref_x) ** 2 + (detected_y - ref_y) ** 2)
        directions[joint] = ("left" if detected_x < ref_x else "right", "up" if detected_y < ref_y else "down")
    return deviations, directions

# Initialize variables
FRAME_WINDOW_SIZE = 150  # 5 seconds for 30 FPS
sliding_window = deque(maxlen=FRAME_WINDOW_SIZE)
exercise_started = False
start_time = None

# Main loop where frames are processed
while cap.isOpened() and video_capture.isOpened():
    ret, frame = cap.read()
    ret_video, video_frame = video_capture.read()

    # Restart video if it ends
    if not ret_video:
        video_capture.set(cv2.CAP_PROP_POS_FRAMES, 0)
        ret_video, video_frame = video_capture.read()

    frame_height, frame_width, _ = frame.shape
    DEVIATION_THRESHOLD = 0.2 * frame_width  # Adjust threshold as needed

    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = pose.process(rgb_frame)

    if not results.pose_landmarks:
        cv2.putText(frame, "Pose not detected! Ensure visibility.", (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
    else:
        # Draw landmarks on frame
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
            for joint in selected_joints
        }

        deviations, directions = calculate_deviation(detected_joints, reference_joints)

        # Check if current frame is correct
        frame_correct = all(deviation <= DEVIATION_THRESHOLD for deviation in deviations.values())
        sliding_window.append(frame_correct)

        # Calculate deviations for each joint and show feedback if necessary
        feedback = []
        for joint, deviation in deviations.items():
            if deviation > DEVIATION_THRESHOLD:
                feedback.append(f"Adjust {joint}: Move closer to the reference position.")

        if feedback:
            for i, line in enumerate(feedback):
                cv2.putText(frame, line, (10, 100 + i * 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        else:
            cv2.putText(frame, "Good posture!", (10, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

        # Evaluate the sliding window
        if len(sliding_window) == FRAME_WINDOW_SIZE:  # Ensure the window is full
            correct_count = sum(sliding_window)
            if correct_count / FRAME_WINDOW_SIZE > 0.5:  # Threshold for correctness (50%)
                cv2.putText(frame, "Exercise is Being Performed Correctly!", (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            else:
                cv2.putText(frame, "Correct Your Posture!", (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

    # Add video feedback and other UI logic
    if start_time is not None:
        elapsed_time = time.time() - start_time
        minutes = int(elapsed_time // 60)
        seconds = int(elapsed_time % 60)
        time_str = f"{minutes:02}:{seconds:02}"
        text_size = cv2.getTextSize(time_str, cv2.FONT_HERSHEY_SIMPLEX, 1, 2)[0]
        text_x = (frame_width - text_size[0]) // 2
        cv2.putText(frame, f"Time: {time_str}", (text_x, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)

    # Resize and place the exercise video on the frame
    video_frame_resized = cv2.resize(video_frame, (frame_width // 3, frame_height // 3))
    frame[0:video_frame_resized.shape[0], frame_width - video_frame_resized.shape[1]:] = video_frame_resized

    # Display the frame
    cv2.imshow(f"Pose Detection - Exercise {exercise_number}", frame)

    if cv2.waitKey(10) & 0xFF == ord('q'):  # Press 'q' to quit
        sys.exit(0)


cap.release()
video_capture.release()
cv2.destroyAllWindows()