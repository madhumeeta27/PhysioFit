import json
import cv2
import mediapipe as mp
import sys
import time
import math
from collections import deque

cap = None
video_cap = None
should_stop = False

# Define a cleanup function to release resources
def cleanup_and_exit(signum=None, frame=None):
    print("Cleaning up resources...")
    if cap:
        cap.release()
    if video_cap:
        video_cap.release()
    cv2.destroyAllWindows()
    sys.exit(0)

# Load the dataset
try:
    with open("filtered_dataset.json", "r") as f:
        data = json.load(f)
except FileNotFoundError:
    raise FileNotFoundError("The dataset file 'filtered_dataset.json' was not found!")
except json.JSONDecodeError:
    raise ValueError("The dataset file is not a valid JSON!")

# Mediapipe Initialization
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

# Calculate deviations
def calculate_deviation(detected_joints, reference_joints):
    deviations = {}
    directions = {}
    for joint in detected_joints:
        detected_x, detected_y = detected_joints[joint]
        ref_x, ref_y = reference_joints[joint]
        deviations[joint] = math.sqrt((detected_x - ref_x) ** 2 + (detected_y - ref_y) ** 2)
        directions[joint] = ("left" if detected_x < ref_x else "right", "up" if detected_y < ref_y else "down")
    return deviations, directions

# Add this new function
def stop_exercise():
    global should_stop
    should_stop = True
    cleanup_and_exit()

# Function to provide feedback for incorrect posture
def give_feedback(deviations, selected_joints):
    feedback_messages = []

    # Joint-specific feedback based on deviations
    if deviations.get("l_shoulder", 0) > 0.2:
        feedback_messages.append("Move your left shoulder closer to the reference position.")
    if deviations.get("r_shoulder", 0) > 0.2:
        feedback_messages.append("Move your right shoulder closer to the reference position.")
    
    if deviations.get("l_elbow", 0) > 0.15:
        feedback_messages.append("Bend your left elbow more.")
    if deviations.get("r_elbow", 0) > 0.15:
        feedback_messages.append("Bend your right elbow more.")
    
    if deviations.get("l_hip", 0) > 0.2:
        feedback_messages.append("Adjust your left hip position.")
    if deviations.get("r_hip", 0) > 0.2:
        feedback_messages.append("Adjust your right hip position.")
    
    if deviations.get("l_knee", 0) > 0.2:
        feedback_messages.append("Bend your left knee more.")
    if deviations.get("r_knee", 0) > 0.2:
        feedback_messages.append("Bend your right knee more.")
    
    if deviations.get("l_ankle", 0) > 0.2:
        feedback_messages.append("Move your left ankle closer to the reference position.")
    if deviations.get("r_ankle", 0) > 0.2:
        feedback_messages.append("Move your right ankle closer to the reference position.")
    
    if not feedback_messages:
        feedback_messages.append("Your posture looks good!")

    return feedback_messages

# Generate frames for streaming
def generate_frames(exercise_number):
    global cap, video_cap, should_stop
    should_stop = False

    valid_exercises = [f"{i:02}" for i in range(1, 17) if i not in [10, 11]]
    if exercise_number not in valid_exercises:
        raise ValueError("Invalid exercise number! Choose between 1-9 and 12-16 (padded as 01-09, 12-16).")

    exercise_data = next((item for item in data['data'] if item['exercise'] == exercise_number), None)
    if not exercise_data:
        raise ValueError(f"Exercise '{exercise_number}' not found in the dataset!")

    exercise_joints = {
        **dict.fromkeys(["01", "02", "03", "04", "05"], ["l_hip", "l_knee", "l_ankle"]),
        **dict.fromkeys(["06", "07", "08"], ["r_hip", "r_knee", "r_ankle"]),
        **dict.fromkeys(["09", "12"], ["l_shoulder", "l_elbow", "l_wrist"]),
        **dict.fromkeys(["13", "14", "15", "16"], ["r_shoulder", "r_elbow", "r_wrist"])
    }

    selected_joints = exercise_joints[exercise_number]

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

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        raise RuntimeError("Cannot access the webcam. Make sure it is connected and not being used by another application.")

    video_file = f"{exercise_number}.mp4"
    video_cap = cv2.VideoCapture(video_file)
    if not video_cap.isOpened():
        raise FileNotFoundError(f"The exercise video '{video_file}' was not found!")

    exercise_started = False
    start_time = None

    BUFFER_SIZE = 150
    MIN_CORRECT_FRAMES = 120
    deviation_buffer = deque(maxlen=BUFFER_SIZE)

    while cap.isOpened() and not should_stop:
        ret, frame = cap.read()
        if not ret:
            break

        ret_video, video_frame = video_cap.read()
        if not ret_video:
            video_cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            ret_video, video_frame = video_cap.read()

        frame_height, frame_width, _ = frame.shape
        DEVIATION_THRESHOLD_STRICT = 0.1 * frame_width  # Strict threshold for exercise start
        DEVIATION_THRESHOLD_LENIENT = 0.25 * frame_width  # Lenient threshold after exercise start

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(rgb_frame)

        incorrect_exercise = False  # Flag to indicate if exercise is done wrongly

        if results.pose_landmarks:
            detected_joints = {
                joint: (
                    results.pose_landmarks.landmark[joint_mapping[joint]].x * frame_width,
                    results.pose_landmarks.landmark[joint_mapping[joint]].y * frame_height
                )
                for joint in selected_joints
            }

            deviations, directions = calculate_deviation(detected_joints, reference_joints)

            # Exercise start detection: Stricter check
            if not exercise_started and all(deviation <= DEVIATION_THRESHOLD_STRICT for deviation in deviations.values()):
                exercise_started = True
                start_time = time.time()

            # After exercise start: Lenient check for deviations
            if exercise_started:
                cv2.putText(frame, "Exercise Started!", (10, 50), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

            deviation_buffer.append(all(deviation <= DEVIATION_THRESHOLD_LENIENT for deviation in deviations.values()))

            # Check if exercise is done incorrectly
            if sum(deviation_buffer) < MIN_CORRECT_FRAMES:
                incorrect_exercise = True

            if incorrect_exercise:
                cv2.putText(frame, "Exercise is Incorrect!", (10, 200), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)

                # Display feedback messages
                feedback_messages = give_feedback(deviations, selected_joints)
                y_offset = 230
                for message in feedback_messages:
                    cv2.putText(frame, message, (10, y_offset), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
                    y_offset += 30
            else:
                if sum(deviation_buffer) >= MIN_CORRECT_FRAMES:
                    cv2.putText(frame, "Exercise is Correct!", (10, 200), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

            mp_drawing.draw_landmarks(frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

        if start_time is not None:
            elapsed_time = time.time() - start_time
            minutes = int(elapsed_time // 60)
            seconds = int(elapsed_time % 60)
            time_str = f"{minutes:02}:{seconds:02}"

            text_size = cv2.getTextSize(time_str, cv2.FONT_HERSHEY_SIMPLEX, 0.8, 2)[0]
            text_x = (frame_width - text_size[0]) // 2
            cv2.putText(frame, f"Time: {time_str}", (text_x, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)

        # Flip only the video frame (exercise video), not the webcam frame
        flipped_video_frame = cv2.flip(video_frame, 1)

        # Resize the flipped video frame
        resized_video_frame = cv2.resize(flipped_video_frame, (frame_width // 3, frame_height))

        # Combine the resized flipped video frame and the unflipped webcam frame
        combined_frame = cv2.hconcat([resized_video_frame, frame])

        ret, buffer = cv2.imencode('.jpg', combined_frame)
        if not ret:
            continue

        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cleanup_and_exit()

