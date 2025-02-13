import sqlite3
import os
from flask import Flask, jsonify, request, session
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

DATABASE = 'goodaideas.db'
app = Flask(__name__)
app.secret_key = 'your super_secret_key_change_me'  # Replace with a real secret key!


# Database Configuration
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def close_db_connection(conn):
    if conn:
        conn.close()

# User Points Calculation (Corrected function name)
def get_user_points(user_id):
    conn = get_db_connection()
    points = 0
    try:
        # Points for suggesting ideas (adjust points as needed)
        suggestion_points_query = conn.execute("SELECT COUNT(*) FROM ideas WHERE user_id = ?", (user_id,))
        suggestion_points = suggestion_points_query.fetchone()[0] * 5  # 5 points per suggestion

        # Points for favoriting ideas (adjust points as needed)
        favorite_points_query = conn.execute("SELECT COUNT(*) FROM idea_favorites WHERE user_id = ?", (user_id,))
        favorite_points = favorite_points_query.fetchone()[0] * 3  # 3 points per favorite

        # Points for rating ideas (adjust points as needed)
        rating_points_query = conn.execute("SELECT COUNT(*) FROM idea_ratings WHERE user_id = ?", (user_id,))
        rating_points = rating_points_query.fetchone()[0] * 2  # 2 points per rating

        points = suggestion_points + favorite_points + rating_points
    except Exception as e:
        print(f"Error calculating points: {e}") # Log any errors for debugging
        points = 0 # Default to 0 points on error
    finally:
        close_db_connection(conn)
    return points


# --- User Authentication ---
@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email') # Get email from registration data

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        # Check if username already exists
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        if cursor.fetchone():
            return jsonify({'message': 'Username already taken'}), 409

        hashed_password = generate_password_hash(password)
        cursor.execute("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", (username, hashed_password, email)) # Insert email
        conn.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'message': f'Registration failed: {str(e)}'}), 500
    finally:
        close_db_connection(conn)


@app.route('/api/login', methods=['POST'])
def login_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()

        if user and check_password_hash(user['password'], password):
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['is_admin'] = user['is_admin'] # Store admin status in session
            return jsonify({'message': 'Login successful', 'username': user['username'], 'isAdmin': user['is_admin']}), 200
        else:
            return jsonify({'message': 'Invalid username or password'}), 401
    except Exception as e:
        return jsonify({'message': f'Login failed: {str(e)}'}), 500
    finally:
        close_db_connection(conn)

@app.route('/api/logout')
def logout_user():
    session.pop('user_id', None)
    session.pop('username', None)
    session.pop('is_admin', None)
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/api/session')
def check_session():
    user_id = session.get('user_id')
    username = session.get('username')
    is_admin = session.get('is_admin')
    if user_id:
        points = get_user_points(user_id) # Fetch points here
        return jsonify({'loggedIn': True, 'username': username, 'isAdmin': is_admin, 'points': points}), 200
    else:
        return jsonify({'loggedIn': False}), 200


# --- Idea Submission ---
@app.route('/api/submit_idea', methods=['POST'])
def submit_idea():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': 'User not logged in'}), 401

    data = request.get_json()
    title = data.get('title')
    category = data.get('category')
    description = data.get('description')
    tags_str = data.get('tags', '')  # Get tags as a string

    if not title or not description or not category:
        return jsonify({'message': 'Title, description and category are required'}), 400

    tags = [tag.strip() for tag in tags_str.split(',') if tag.strip()] # Split and clean tags

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO ideas (user_id, title, category, description, tags, submission_date, average_rating, rating_count, favorite_count, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (user_id, title, category, description, ','.join(tags), datetime.now(), 0.0, 0, 0, False) # Store tags as comma-separated string
        )
        conn.commit()
        return jsonify({'message': 'Idea submitted successfully'}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'message': f'Idea submission failed: {str(e)}'}), 500
    finally:
        close_db_connection(conn)


# --- Idea Feed ---
@app.route('/api/ideas')
def get_ideas():
    category_filter = request.args.get('category')
    tag_filter = request.args.get('tag')
    search_query = request.args.get('search')
    sort_by = request.args.get('sort_by', 'recent') # Default sort by recent

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        query = "SELECT ideas.*, users.username FROM ideas JOIN users ON ideas.user_id = users.id WHERE 1=1" # Base query

        params = []

        if category_filter and category_filter != 'all':
            query += " AND category = ?"
            params.append(category_filter)
        if tag_filter:
            query += " AND tags LIKE ?"
            params.append(f"%{tag_filter}%") # Use LIKE for tag search
        if search_query:
            query += " AND (title LIKE ? OR description LIKE ?)" # Search in title or description
            params.extend([f"%{search_query}%"] * 2) # Duplicate search query for title and description

        if sort_by == 'top_rated':
            query += " ORDER BY average_rating DESC"
        elif sort_by == 'popular':
            query += " ORDER BY favorite_count DESC" # Sort by favorites for 'popular'
        else: # Default to 'recent'
            query += " ORDER BY submission_date DESC"


        cursor.execute(query, params)
        ideas = cursor.fetchall()
        ideas_list = []
        for idea in ideas:
            idea_dict = dict(idea)
            idea_dict['tags'] = idea_dict['tags'].split(',') if idea_dict['tags'] else [] # Split tags back into list
            ideas_list.append(idea_dict)

        return jsonify({'ideas': ideas_list}), 200
    except Exception as e:
        return jsonify({'message': f'Failed to fetch ideas: {str(e)}'}), 500
    finally:
        close_db_connection(conn)


# --- Idea Interaction: Favoriting ---
@app.route('/api/favorite_idea/<int:idea_id>', methods=['POST'])
def favorite_idea(idea_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': 'User not logged in'}), 401

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        # Check if already favorited
        cursor.execute("SELECT * FROM idea_favorites WHERE user_id = ? AND idea_id = ?", (user_id, idea_id))
        if cursor.fetchone():
            return jsonify({'message': 'Idea already favorited'}), 409 # Conflict - already favorited

        cursor.execute("INSERT INTO idea_favorites (user_id, idea_id) VALUES (?, ?)", (user_id, idea_id))
        conn.execute("UPDATE ideas SET favorite_count = favorite_count + 1 WHERE id = ?", (idea_id,)) # Increment favorite count
        conn.commit()
        return jsonify({'message': 'Idea favorited successfully'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'message': f'Failed to favorite idea: {str(e)}'}), 500
    finally:
        close_db_connection(conn)


@app.route('/api/unfavorite_idea/<int:idea_id>', methods=['POST'])
def unfavorite_idea(idea_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': 'User not logged in'}), 401

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM idea_favorites WHERE user_id = ? AND idea_id = ?", (user_id, idea_id))
        conn.execute("UPDATE ideas SET favorite_count = favorite_count - 1 WHERE id = ? AND favorite_count > 0", (idea_id,)) # Decrement, but avoid negative count
        conn.commit()
        return jsonify({'message': 'Idea unfavorited successfully'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'message': f'Failed to unfavorite idea: {str(e)}'}), 500
    finally:
        close_db_connection(conn)


@app.route('/api/is_favorite/<int:idea_id>')
def is_idea_favorite(idea_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'isFavorite': False}), 200 # Not logged in, so not favorite

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM idea_favorites WHERE user_id = ? AND idea_id = ?", (user_id, idea_id))
        is_favorited = cursor.fetchone() is not None
        return jsonify({'isFavorite': is_favorited}), 200
    except Exception as e:
        return jsonify({'message': f'Error checking favorite status: {str(e)}'}), 500
    finally:
        close_db_connection(conn)



# --- Idea Interaction: Rating ---
@app.route('/api/rate_idea/<int:idea_id>', methods=['POST'])
def rate_idea(idea_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': 'User not logged in'}), 401

    data = request.get_json()
    rating_value = data.get('rating')

    try:
        rating_value = int(rating_value)
        if not 1 <= rating_value <= 5:
            return jsonify({'message': 'Invalid rating value. Must be between 1 and 5'}), 400
    except (ValueError, TypeError):
        return jsonify({'message': 'Invalid rating value. Must be a number'}), 400


    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        # Check if user already rated
        cursor.execute("SELECT * FROM idea_ratings WHERE user_id = ? AND idea_id = ?", (user_id, idea_id))
        if cursor.fetchone():
            return jsonify({'message': 'You have already rated this idea'}), 409 # Conflict - already rated

        cursor.execute("INSERT INTO idea_ratings (user_id, idea_id, rating_value) VALUES (?, ?, ?)", (user_id, idea_id, rating_value))

        # Update average rating in ideas table
        conn.execute("""
            UPDATE ideas
            SET rating_count = rating_count + 1,
                average_rating = (
                    (average_rating * rating_count) + ?
                ) / (rating_count + 1)
            WHERE id = ?
        """, (rating_value, idea_id))

        conn.commit()
        return jsonify({'message': 'Rating submitted successfully'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'message': f'Failed to rate idea: {str(e)}'}), 500
    finally:
        close_db_connection(conn)


# --- User Profile ---
@app.route('/api/profile', methods=['GET', 'POST'])
def user_profile():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': 'User not logged in'}), 401

    conn = get_db_connection()
    try:
        if request.method == 'POST':
            data = request.get_json()
            profile_description = data.get('profileDescription') # Get profile description from data
            cursor = conn.cursor()
            cursor.execute("UPDATE users SET profile_description = ? WHERE id = ?", (profile_description, user_id)) # Update description
            conn.commit()
            return jsonify({'message': 'Profile updated!'}), 200
        elif request.method == 'GET':
            cursor = conn.cursor()
            cursor.execute("SELECT username, email, profile_description FROM users WHERE id = ?", (user_id,)) # Fetch profile description
            user_data = cursor.fetchone()
            if user_data:
                points = get_user_points(user_id) # Get points for profile display
                user_profile = dict(user_data)
                user_profile['points'] = points # Add points to profile data
                return jsonify({'profile': user_profile}), 200
            else:
                return jsonify({'message': 'Profile not found'}), 404
    except Exception as e:
        conn.rollback()
        return jsonify({'message': f'Error accessing profile: {str(e)}'}), 500
    finally:
        close_db_connection(conn)


# --- Admin Dashboard ---
@app.route('/api/admin/suggestions')
def get_user_suggestions_admin():
    is_admin = session.get('is_admin')
    if not is_admin:
        return jsonify({'message': 'Admin access required'}), 403

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT user_suggestions.*, users.username FROM user_suggestions JOIN users ON user_suggestions.user_id = users.id ORDER BY submission_date DESC")
        suggestions = cursor.fetchall()
        suggestion_list = []
        for suggestion in suggestions:
            suggestion_list.append(dict(suggestion))
        return jsonify({'suggestions': suggestion_list}), 200
    except Exception as e:
        return jsonify({'message': f'Error fetching suggestions: {str(e)}'}), 500
    finally:
        close_db_connection(conn)


@app.route('/api/admin/suggestions/<int:suggestion_id>', methods=['PUT', 'DELETE'])
def manage_user_suggestion_admin(suggestion_id):
    is_admin = session.get('is_admin')
    if not is_admin:
        return jsonify({'message': 'Admin access required'}), 403

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        if request.method == 'PUT': # Approve/Reject/Update Notes
            data = request.get_json()
            action = data.get('action') # 'approve', 'reject', 'update_notes'
            admin_notes = data.get('adminNotes')

            if action == 'approve':
                status = 'approved'
            elif action == 'reject':
                status = 'rejected'
            elif action == 'update_notes':
                status = None # Status not changed
            else:
                return jsonify({'message': 'Invalid action'}), 400

            if status: # Approve or reject
                 cursor.execute("UPDATE user_suggestions SET status = ? WHERE id = ?", (status, suggestion_id))
            if admin_notes is not None: # Update notes if provided
                cursor.execute("UPDATE user_suggestions SET admin_notes = ? WHERE id = ?", (admin_notes, suggestion_id))


        elif request.method == 'DELETE': # Delete suggestion
            cursor.execute("DELETE FROM user_suggestions WHERE id = ?", (suggestion_id,))

        conn.commit()
        return jsonify({'message': 'Suggestion updated successfully'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'message': f'Error updating suggestion: {str(e)}'}), 500
    finally:
        close_db_connection(conn)


if __name__ == '__main__':
    app.run(debug=True)