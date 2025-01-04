from flask import Flask, Response, render_template, request
import signal
import sys
from exercise_logic import generate_frames, cleanup_and_exit, stop_exercise

# Initialize Flask app
app = Flask(__name__)

@app.route('/exercise_feed/<exercise_number>')
def video_feed(exercise_number):
    try:
        print(f"Received exercise number: {exercise_number}")
        
        # Validate the exercise number
        valid_exercises = [f"{i:02}" for i in range(1, 17) if i not in [10, 11]]
        if exercise_number not in valid_exercises:
            raise ValueError(f"Invalid exercise number! Choose between 01-09 and 12-16.")
        
        return Response(generate_frames(exercise_number),
                       mimetype='multipart/x-mixed-replace; boundary=frame')
    except ValueError as e:
        return str(e), 400

@app.route('/exercise/<exercise_number>')
def start_exercise(exercise_number):
    return render_template('exercise.html', exercise_number=exercise_number)

@app.route('/stop_exercise', methods=['POST'])
def handle_stop_exercise():
    stop_exercise()
    return '', 204

if __name__ == "__main__":
    # Set up signal handlers
    signal.signal(signal.SIGINT, cleanup_and_exit)
    signal.signal(signal.SIGTERM, cleanup_and_exit)
    
    # Run Flask app
    app.run(debug=True, host="0.0.0.0", port=5000)
