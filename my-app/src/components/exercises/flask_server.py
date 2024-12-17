# from flask import Flask, Response
# import cv2
# import mediapipe as mp
# import signal
# import sys
# from exercise_logic import generate_frames, calculate_deviation, cleanup_and_exit  # Import functions from exercise_logic.py

# # Initialize Flask app
# app = Flask(__name__)

# # Set up joint mappings (assumes you have this in exercise_logic.py)
# mp_pose = mp.solutions.pose
# pose = mp_pose.Pose()
# mp_drawing = mp.solutions.drawing_utils

# # Open webcam
# cap = cv2.VideoCapture(0)

# @app.route('/exercise/<exercise_number>')
# def video_feed(exercise_number):
#     try:
#         # Print the received exercise number to debug
#         print(f"Received exercise number: {exercise_number}")
        
#         # Validate the exercise number
#         valid_exercises = [f"{i:02}" for i in range(1, 17) if i not in [10, 11]]
#         if exercise_number not in valid_exercises:
#             raise ValueError(f"Invalid exercise number! Choose between 01-09 and 12-16.")
        
#         # Return video feed with frames
#         return Response(generate_frames(exercise_number), mimetype='multipart/x-mixed-replace; boundary=frame')

#     except ValueError as e:
#         return str(e), 400  # Return error if the exercise number is invalid

# # Signal cleanup function
# def cleanup_and_exit(signal, frame):
#     print("Cleaning up and exiting...")
#     sys.exit(0)

# if __name__ == "__main__":
#     # Only set the signal handlers in the main thread
#     signal.signal(signal.SIGINT, cleanup_and_exit)
#     signal.signal(signal.SIGTERM, cleanup_and_exit)

#     # Run Flask app
#     app.run(debug=True, host="0.0.0.0", port=5000)


from flask import Flask, Response, render_template
import cv2
import mediapipe as mp
import signal
import sys
from exercise_logic import generate_frames, calculate_deviation, cleanup_and_exit  # Import functions from exercise_logic.py

# Initialize Flask app
app = Flask(__name__)

# Set up joint mappings (assumes you have this in exercise_logic.py)
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()
mp_drawing = mp.solutions.drawing_utils

# Open webcam
cap = cv2.VideoCapture(0)

@app.route('/exercise_feed/<exercise_number>')
def video_feed(exercise_number):
    try:
        # Print the received exercise number to debug
        print(f"Received exercise number: {exercise_number}")

        # Validate the exercise number
        valid_exercises = [f"{i:02}" for i in range(1, 17) if i not in [10, 11]]
        if exercise_number not in valid_exercises:
            raise ValueError(f"Invalid exercise number! Choose between 01-09 and 12-16.")

        # Return video feed with frames
        return Response(generate_frames(exercise_number), mimetype='multipart/x-mixed-replace; boundary=frame')

    except ValueError as e:
        return str(e), 400  # Return error if the exercise number is invalid

@app.route('/exercise/<exercise_number>')
def start_exercise(exercise_number):
    return render_template('exercise.html', exercise_number=exercise_number)

# Signal cleanup function
def cleanup_and_exit(signal, frame):
    print("Cleaning up and exiting...")
    sys.exit(0)

if __name__ == "__main__":
    # Only set the signal handlers in the main thread
    signal.signal(signal.SIGINT, cleanup_and_exit)
    signal.signal(signal.SIGTERM, cleanup_and_exit)

    # Run Flask app
    app.run(debug=True, host="0.0.0.0", port=5000)
