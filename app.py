import sqlite3
from flask import Flask, jsonify, request, session
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

DATABASE = 'goodaideas.db'
app = Flask(__name__)
app.secret_key = 'your_super_secret_key_change_me'  # IMPORTANT: Replace with a real secret key!

# Database Configuration
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def close_db_connection(conn):
    if conn:
        conn.close()

def get_user_points(user_id):
    conn = get_db_connection()
    points = 0
    try:
        user_data = conn.execute("SELECT points FROM users WHERE id = ?", (user_id,)).fetchone()
        if user_data:
            points = user_data['points']
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        points = 0  # Or handle error as appropriate
    finally:
        close_db_connection(conn)
    return points


# --- User Authentication ---
@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email') # Optional email

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400

    conn = get_db_connection()
    try:
        existing_user = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
        if existing_user:
            return jsonify({'message': 'Username already taken'}), 409

        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        conn.execute("INSERT INTO users (username, password, email, registration_date, points) VALUES (?, ?, ?, ?, ?)",
                     (username, hashed_password, email, datetime.now(), 0)) # Initialize points to 0
        conn.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except sqlite3.Error as e:
        conn.rollback()
        return jsonify({'message': f'Registration failed: {e}'}), 500
    finally:
        close_db_connection(conn)


@app.route('/api/login', methods=['POST'])
def login_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password required'}), 400

    conn = get_db_connection()
    try:
        user = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
        if user and check_password_hash(user['password'], password):
            session['user_id'] = user['id']
            session['username'] = user['username']
            return jsonify({'message': 'Login successful', 'username': user['username'], 'userId': user['id']}), 200
        else:
            return jsonify({'message': 'Invalid username or password'}), 401
    except sqlite3.Error as e:
        return jsonify({'message': f'Login error: {e}'}), 500
    finally:
        close_db_connection(conn)


@app.route('/api/logout')
def logout_user():
    session.pop('user_id', None)
    session.pop('username', None)
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/api/session')
def check_session():
    user_id = session.get('user_id')
    username = session.get('username')
    if user_id:
        is_admin = False # Implement admin check if needed, e.g., from database
        return jsonify({'loggedIn': True, 'username': username, 'userId': user_id, 'isAdmin': is_admin}), 200
    else:
        return jsonify({'loggedIn': False}), 200


# --- Idea Endpoints ---
@app.route('/api/ideas', methods=['GET'])
def list_ideas():
    conn = get_db_connection()
    ideas = []
    try:
        # Example query - adjust as needed for filters, sorting, pagination
        db_ideas = conn.execute("SELECT * FROM ideas").fetchall()
        for row in db_ideas:
            idea = dict(row)
            # Calculate average rating and favorite count (example - adjust based on your DB schema)
            idea['average_rating'] = 4.2  # Replace with actual calculation if needed
            idea['rating_count'] = 10     # Replace with actual calculation if needed
            idea['favorite_count'] = 5    # Replace with actual calculation if needed
            ideas.append(idea)
    except sqlite3.Error as e:
        return jsonify({'message': f'Error fetching ideas: {e}'}), 500
    finally:
        close_db_connection(conn)
    return jsonify({'ideas': ideas}), 200


@app.route('/api/submit_idea', methods=['POST'])
def submit_idea():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': 'Must be logged in to suggest ideas'}), 401

    data = request.get_json()
    title = data.get('title')
    category = data.get('category')
    description = data.get('description')
    tags = data.get('tags') # Assuming tags is a list of strings

    if not title or not category or not description:
        return jsonify({'message': 'Title, category, and description are required'}), 400

    conn = get_db_connection()
    try:
        conn.execute("INSERT INTO ideas (user_id, title, category, description, tags, submission_date) VALUES (?, ?, ?, ?, ?, ?)",
                     (user_id, title, category, description, ','.join(tags) if tags else None, datetime.now())) # Store tags as comma-separated string
        conn.commit()

        # Award points for suggesting an idea
        points_to_award = 5  # Example points
        conn.execute("UPDATE users SET points = points + ? WHERE id = ?", (points_to_award, user_id))
        conn.commit()


        return jsonify({'message': 'Idea submitted successfully', 'points_awarded': points_to_award}), 201
    except sqlite3.Error as e:
        conn.rollback()
        return jsonify({'message': f'Idea submission failed: {e}'}), 500
    finally:
        close_db_connection(conn)


@app.route('/api/favorite_idea/<int:idea_id>', methods=['POST'])
def favorite_idea(idea_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': 'Must be logged in to favorite ideas'}), 401

    conn = get_db_connection()
    try:
        # Check if already favorited (prevent duplicates)
        existing_favorite = conn.execute("SELECT * FROM favorites WHERE user_id = ? AND idea_id = ?", (user_id, idea_id)).fetchone()
        if existing_favorite:
            return jsonify({'message': 'Idea already favorited'}), 409 # Conflict - already exists

        conn.execute("INSERT INTO favorites (user_id, idea_id, favorited_date) VALUES (?, ?, ?)",
                     (user_id, idea_id, datetime.now()))
        conn.commit()

        # Award points for favoriting an idea
        points_to_award = 1  # Example points
        conn.execute("UPDATE users SET points = points + ? WHERE id = ?", (points_to_award, user_id))
        conn.commit()


        return jsonify({'message': 'Idea favorited successfully', 'points_awarded': points_to_award}), 200
    except sqlite3.Error as e:
        conn.rollback()
        return jsonify({'message': f'Error favoriting idea: {e}'}), 500
    finally:
        close_db_connection(conn)


@app.route('/api/unfavorite_idea/<int:idea_id>', methods=['POST'])
def unfavorite_idea(idea_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': 'Must be logged in to unfavorite ideas'}), 401

    conn = get_db_connection()
    try:
        conn.execute("DELETE FROM favorites WHERE user_id = ? AND idea_id = ?", (user_id, idea_id))
        conn.commit()

        # Deduct points for unfavoriting (optional - you can decide if you want to deduct points)
        points_deduct = 1 # Example points to deduct
        conn.execute("UPDATE users SET points = points - ? WHERE id = ? AND points >= ?", (points_deduct, user_id, points_deduct)) # Ensure points don't go below zero
        conn.commit()


        return jsonify({'message': 'Idea unfavorited successfully', 'points_deducted': points_deduct}), 200
    except sqlite3.Error as e:
        conn.rollback()
        return jsonify({'message': f'Error unfavoriting idea: {e}'}), 500
    finally:
        close_db_connection(conn)


@app.route('/api/rate_idea/<int:idea_id>', methods=['POST'])
def rate_idea(idea_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': 'Must be logged in to rate ideas'}), 401

    data = request.get_json()
    rating_value = data.get('rating') # Expecting rating value from 1 to 5

    if not rating_value or not isinstance(rating_value, int) or rating_value < 1 or rating_value > 5:
        return jsonify({'message': 'Invalid rating value. Must be an integer from 1 to 5'}), 400


    conn = get_db_connection()
    try:
        # Check if user has already rated this idea - if so, update, otherwise insert new rating
        existing_rating = conn.execute("SELECT * FROM ratings WHERE user_id = ? AND idea_id = ?", (user_id, idea_id)).fetchone()
        if existing_rating:
            conn.execute("UPDATE ratings SET rating = ?, rating_date = ? WHERE user_id = ? AND idea_id = ?",
                         (rating_value, datetime.now(), user_id, idea_id))
            conn.commit()
            return jsonify({'message': 'Rating updated successfully'}), 200 # Indicate update

        else:
            conn.execute("INSERT INTO ratings (user_id, idea_id, rating, rating_date) VALUES (?, ?, ?, ?)",
                         (user_id, idea_id, rating_value, datetime.now()))
            # Award points for rating an idea (first time rating)
            points_to_award = 2  # Example points
            conn.execute("UPDATE users SET points = points + ? WHERE id = ?", (points_to_award, user_id))
            conn.commit()
            return jsonify({'message': 'Idea rated successfully', 'points_awarded': points_to_award}), 201 # Indicate creation (first rating)


    except sqlite3.Error as e:
        conn.rollback()
        return jsonify({'message': f'Error rating idea: {e}'}), 500
    finally:
        close_db_connection(conn)


@app.route('/api/idea_of_the_day', methods=['GET'])
def get_idea_of_the_day():
    conn = get_db_connection()
    idea_of_day = None
    try:
        # Simple logic to get a "random" idea for the day - improve as needed
        idea_of_day_data = conn.execute("SELECT * FROM ideas ORDER BY RANDOM() LIMIT 1").fetchone()
        if idea_of_day_data:
            idea_of_day = dict(idea_of_day_data)
            idea_of_day['average_rating'] = 4.5 # Replace with actual rating calculation
            idea_of_day['rating_count'] = 20    # Replace with actual rating count
            idea_of_day['favorite_count'] = 12   # Replace with actual favorite count
        else:
            return jsonify({'message': 'No featured idea today'}) # Not an error, just no idea to feature

    except sqlite3.Error as e:
        return jsonify({'message': f'Error fetching idea of the day: {e}'}), 500
    finally:
        close_db_connection(conn)

    return jsonify({'idea': idea_of_day})


@app.route('/api/user/<int:user_id>/points', methods=['GET'])
def get_user_points_api(user_id):
    points = get_user_points(user_id)
    return jsonify({'points': points}), 200


if __name__ == '__main__':
    app.run(debug=True)