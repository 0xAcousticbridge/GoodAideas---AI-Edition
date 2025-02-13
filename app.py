# app.py (Flask Backend - API Enhancements)
import sqlite3
from flask import Flask, jsonify, request, session
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'your_super_secret_key_change_me' # Replace with a real secret key!

# --- Database Configuration ---
DATABASE = 'goodaideas.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def close_db_connection(conn):
    if conn:
        conn.close()

def get_user_points(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    total_points = 0
    try:
        cursor.execute("SELECT total_points FROM Users WHERE user_id =?", (user_id,))
        result = cursor.fetchone()
        if result:
            total_points = result
    except sqlite3.Error as e:
        print(f"Database error retrieving points: {e}")
    finally:
        close_db_connection(conn)
    return total_points

def award_points(user_id, activity_type):
    points_values = {
        'login': 5, 'favorite_idea': 3, 'rate_idea': 1, 'comment': 2, 'suggest_idea': 10, 'share_idea': 2
    }
    points_earned = points_values.get(activity_type, 0)
    if points_earned > 0:
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO Points (user_id, points_earned, activity_type) VALUES (?,?,?)",
                (user_id, points_earned, activity_type)
            )
            cursor.execute(
                "UPDATE Users SET total_points = total_points +? WHERE user_id =?",
                (points_earned, user_id)
            )
            conn.commit()
            print(f"Awarded {points_earned} points to user {user_id} for activity '{activity_type}'.")
        except sqlite3.Error as e:
            conn.rollback()
            print(f"Database error awarding points: {e}")
        finally:
            close_db_connection(conn)
    else:
        print(f"No points awarded for activity type '{activity_type}'.")


# --- User Authentication Endpoints ---
@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email') # Get email from registration request

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        hashed_password = generate_password_hash(password)
        cursor.execute("INSERT INTO Users (username, password, email) VALUES (?,?,?)", (username, hashed_password, email)) # Insert email
        conn.commit()
        close_db_connection(conn)
        return jsonify({'message': 'User registered successfully'}), 201
    except sqlite3.IntegrityError:
        conn.rollback()
        close_db_connection(conn)
        return jsonify({'message': 'Username or email already exists'}), 409
    except sqlite3.Error as e:
        conn.rollback()
        close_db_connection(conn)
        return jsonify({'message': f'Database error: {e}'}), 500

@app.route('/api/login', methods=['POST'])
def login_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM Users WHERE username =?", (username,))
        user = cursor.fetchone()
        close_db_connection(conn)

        if user and check_password_hash(user['password'], password):
            session['user_id'] = user['user_id']
            conn = get_db_connection() # Re-open connection to update last_login
            cursor = conn.cursor()
            cursor.execute("UPDATE Users SET last_login =? WHERE user_id =?", (datetime.now(), user['user_id'])) # Track last login
            conn.commit()
            close_db_connection(conn)
            award_points(user['user_id'], 'login') # Award points for login
            return jsonify({'message': 'Login successful', 'user_id': user['user_id'], 'username': user['username']}), 200
        else:
            return jsonify({'message': 'Invalid username or password'}), 401
    except sqlite3.Error as e:
        close_db_connection(conn)
        return jsonify({'message': f'Database error: {e}'}), 500

@app.route('/api/logout', methods=['POST']) # Logout endpoint
def logout_user():
    session.pop('user_id', None) # Clear user session
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/api/check_login') # Check login status
def check_login_status():
    user_id = session.get('user_id')
    if user_id:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT username FROM Users WHERE user_id =?", (user_id,))
        user = cursor.fetchone()
        close_db_connection(conn)
        if user:
            return jsonify({'loggedIn': True, 'user_id': user_id, 'username': user['username']}), 200
    return jsonify({'loggedIn': False}), 200


# --- User Profile Endpoints ---
@app.route('/api/user/profile', methods=['GET', 'PUT']) # Get/Update logged in user profile
def user_profile():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401

    conn = get_db_connection()
    cursor = conn.cursor()

    if request.method == 'GET': # Get profile
        try:
            cursor.execute("SELECT user_id, username, email, profile_description, profile_avatar, total_points FROM Users WHERE user_id =?", (user_id,))
            user_data = cursor.fetchone()
            close_db_connection(conn)
            if user_data:
                profile = dict(user_data) # Convert Row object to dict
                return jsonify({'profile': profile}), 200
            else:
                return jsonify({'message': 'Profile not found'}), 404
        except sqlite3.Error as e:
            close_db_connection(conn)
            return jsonify({'message': f'Database error: {e}'}), 500

    elif request.method == 'PUT': # Update profile
        data = request.get_json()
        profile_description = data.get('profile_description')
        profile_avatar = data.get('profile_avatar') # URL to avatar image

        try:
            cursor.execute("UPDATE Users SET profile_description =?, profile_avatar =? WHERE user_id =?",
                           (profile_description, profile_avatar, user_id))
            conn.commit()
            close_db_connection(conn)
            return jsonify({'message': 'Profile updated successfully'}), 200
        except sqlite3.Error as e:
            conn.rollback()
            close_db_connection(conn)
            return jsonify({'message': f'Database error: {e}'}), 500

@app.route('/api/user/<int:user_id>/', methods=['GET']) # Get public user profile (view only)
def get_public_user_profile(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT user_id, username, profile_description, profile_avatar, total_points FROM Users WHERE user_id =?", (user_id,))
        user_data = cursor.fetchone()
        close_db_connection(conn)
        if user_data:
            profile = dict(user_data)
            return jsonify({'profile': profile}), 200
        else:
            return jsonify({'message': 'Profile not found'}), 404
    except sqlite3.Error as e:
        close_db_connection(conn)
        return jsonify({'message': f'Database error: {e}'}), 500


# --- Idea Endpoints ---
@app.route('/api/ideas', methods=['GET', 'POST']) # Get all ideas (with filters), or submit new idea
def ideas_handler():
    if request.method == 'GET': # Get ideas (with filters)
        category_filter = request.args.get('category')
        sort_by = request.args.get('sort')
        search_query = request.args.get('search')
        tag_filter = request.args.get('tag') # Filter by tag

        conn = get_db_connection()
        cursor = conn.cursor()
        query = "SELECT * FROM Ideas WHERE 1=1" # Base query

        if category_filter and category_filter!= 'all':
            query += " AND category =?"
        if tag_filter: # Filter by tag
            query += " AND tags LIKE?"
        if search_query:
            query += " AND (title LIKE? OR description LIKE?)"

        if sort_by == 'top-rated':
            query += " ORDER BY rating DESC"
        elif sort_by == 'most-recent':
            query += " ORDER BY submission_date DESC"
        else: # Default sort (submission date, ascending - oldest first might be better default?)
            query += " ORDER BY submission_date DESC" # Default sort by most recent

        params =
        if category_filter and category_filter!= 'all':
            params.append(category_filter)
        if tag_filter: # Parameter for tag filter
            params.append(f"%{tag_filter}%") # LIKE %tag% for tag search
        if search_query:
            search_param = f"%{search_query}%"
            params.extend([search_param, search_param])


        try:
            cursor.execute(query, params)
            ideas = cursor.fetchall()
            close_db_connection(conn)
            ideas_list = [dict(idea) for idea in ideas] # Convert Row objects to dictionaries
            return jsonify({'ideas': ideas_list}), 200
        except sqlite3.Error as e:
            close_db_connection(conn)
            return jsonify({'message': f'Database error: {e}'}), 500


    elif request.method == 'POST': # Submit new idea
        user_id = session.get('user_id') # Get user ID from session
        if not user_id:
            return jsonify({'message': 'Unauthorized'}), 401

        data = request.get_json()
        title = data.get('title')
        description = data.get('description')
        category = data.get('category') # Get category from request
        tags = data.get('tags') # Get tags from request (comma-separated string)


        if not title or not description:
            return jsonify({'message': 'Title and description are required'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO Ideas (user_id, title, description, category, tags) VALUES (?,?,?,?,?)", # Include category and tags
                (user_id, title, description, category, tags)
            )
            conn.commit()
            idea_id = cursor.lastrowid # Get ID of newly inserted idea
            close_db_connection(conn)
            award_points(user_id, 'suggest_idea') # Award points for suggesting idea
            return jsonify({'message': 'Idea submitted successfully', 'idea_id': idea_id}), 201
        except sqlite3.Error as e:
            conn.rollback()
            close_db_connection(conn)
            return jsonify({'message': f'Database error: {e}'}), 500


@app.route('/api/ideas/<int:idea_id>', methods=['GET', 'PUT', 'DELETE']) # Get, Update, Delete specific idea
def idea_handler(idea_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    if request.method == 'GET': # Get single idea
        try:
            cursor.execute("SELECT * FROM Ideas WHERE idea_id =?", (idea_id,))
            idea = cursor.fetchone()
            close_db_connection(conn)
            if idea:
                return jsonify({'idea': dict(idea)}), 200
            else:
                return jsonify({'message': 'Idea not found'}), 404
        except sqlite3.Error as e:
            close_db_connection(conn)
            return jsonify({'message': f'Database error: {e}'}), 500

    elif request.method == 'PUT': # Update idea (Admin only for now, could be user-editable with permissions)
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'message': 'Unauthorized'}), 401
        # Admin check (simple is_admin flag in User table) - enhance with roles later
        cursor.execute("SELECT is_admin FROM Users WHERE user_id =?", (user_id,))
        user_admin_status = cursor.fetchone()
        if not user_admin_status or not user_admin_status['is_admin']:
            close_db_connection(conn)
            return jsonify({'message': 'Admin access required'}), 403 # 403 Forbidden

        data = request.get_json()
        title = data.get('title')
        description = data.get('description')
        category = data.get('category')
        tags = data.get('tags')
        is_featured = data.get('is_featured') # Admin can feature ideas

        try:
            cursor.execute(
                "UPDATE Ideas SET title =?, description =?, category =?, tags =?, is_featured =? WHERE idea_id =?",
                (title, description, category, tags, is_featured, idea_id)
            )
            conn.commit()
            close_db_connection(conn)
            return jsonify({'message': 'Idea updated successfully'}), 200
        except sqlite3.Error as e:
            conn.rollback()
            close_db_connection(conn)
            return jsonify({'message': f'Database error: {e}'}), 500

    elif request.method == 'DELETE': # Delete idea (Admin only)
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'message': 'Unauthorized'}), 401
         # Admin check
        cursor.execute("SELECT is_admin FROM Users WHERE user_id =?", (user_id,))
        user_admin_status = cursor.fetchone()
        if not user_admin_status or not user_admin_status['is_admin']:
            close_db_connection(conn)
            return jsonify({'message': 'Admin access required'}), 403

        try:
            cursor.execute("DELETE FROM Ideas WHERE idea_id =?", (idea_id,))
            conn.commit()
            close_db_connection(conn)
            return jsonify({'message': 'Idea deleted successfully'}), 200
        except sqlite3.Error as e:
            conn.rollback()
            close_db_connection(conn)
            return jsonify({'message': f'Database error: {e}'}), 500


# --- Idea Rating and Favorite Endpoints ---
@app.route('/api/ideas/<int:idea_id>/rate', methods=['POST']) # Rate an idea
def rate_idea(idea_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401

    data = request.get_json()
    rating_value = data.get('rating') # Rating value from 1 to 5 (e.g.)
    if not rating_value or not isinstance(rating_value, int) or not 1 <= rating_value <= 5:
        return jsonify({'message': 'Invalid rating value'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check if user already rated this idea - prevent duplicate ratings
        cursor.execute("SELECT rating_id FROM IdeaRatings WHERE user_id =? AND idea_id =?", (user_id, idea_id))
        existing_rating = cursor.fetchone()
        if existing_rating:
            close_db_connection(conn)
            return jsonify({'message': 'You have already rated this idea'}), 409 # 409 Conflict

        cursor.execute(
            "INSERT INTO IdeaRatings (user_id, idea_id, rating_value) VALUES (?,?,?)",
            (user_id, idea_id, rating_value)
        )

        # Update average rating and rating count in Ideas table (simple average for now)
        cursor.execute("""
            UPDATE Ideas
            SET rating = (SELECT AVG(rating_value) FROM IdeaRatings WHERE idea_id =?),
                rating_count = (SELECT COUNT(*) FROM IdeaRatings WHERE idea_id =?)
            WHERE idea_id =?
        """, (idea_id, idea_id, idea_id))


        conn.commit()
        close_db_connection(conn)
        award_points(user_id, 'rate_idea') # Award points for rating
        return jsonify({'message': 'Idea rated successfully'}), 200
    except sqlite3.Error as e:
        conn.rollback()
        close_db_connection(conn)
        return jsonify({'message': f'Database error: {e}'}), 500


@app.route('/api/ideas/<int:idea_id>/favorite', methods=['POST', 'DELETE']) # Favorite/Unfavorite idea
def favorite_idea_handler(idea_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401

    conn = get_db_connection()
    cursor = conn.cursor()

    if request.method == 'POST': # Favorite
        try:
            # Check if already favorited
            cursor.execute("SELECT favorite_id FROM IdeaFavorites WHERE user_id =? AND idea_id =?", (user_id, idea_id))
            existing_favorite = cursor.fetchone()
            if existing_favorite:
                close_db_connection(conn)
                return jsonify({'message': 'Idea already favorited'}), 409 # 409 Conflict

            cursor.execute(
                "INSERT INTO IdeaFavorites (user_id, idea_id) VALUES (?,?)",
                (user_id, idea_id)
            )
            cursor.execute("UPDATE Ideas SET favorite_count = favorite_count + 1 WHERE idea_id =?", (idea_id,)) # Increment favorite count in Ideas
            conn.commit()
            close_db_connection(conn)
            award_points(user_id, 'favorite_idea') # Award points for favoriting
            return jsonify({'message': 'Idea favorited successfully'}), 200
        except sqlite3.Error as e:
            conn.rollback()
            close_db_connection(conn)
            return jsonify({'message': f'Database error: {e}'}), 500

    elif request.method == 'DELETE': # Unfavorite
        try:
            cursor.execute("DELETE FROM IdeaFavorites WHERE user_id =? AND idea_id =?", (user_id, idea_id))
            cursor.execute("UPDATE Ideas SET favorite_count = favorite_count - 1 WHERE idea_id =?", (idea_id,)) # Decrement favorite count
            conn.commit()
            close_db_connection(conn)
            return jsonify({'message': 'Idea unfavorited successfully'}), 200
        except sqlite3.Error as e:
            conn.rollback()
            close_db_connection(conn)
            return jsonify({'message': f'Database error: {e}'}), 500


# --- Comments Endpoints ---
@app.route('/api/ideas/<int:idea_id>/comments', methods=['GET', 'POST']) # Get comments for idea, or add new comment
def comments_handler(idea_id):
    if request.method == 'GET': # Get comments
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("""
                SELECT Comments.*, Users.username
                FROM Comments
                JOIN Users ON Comments.user_id = Users.user_id
                WHERE Comments.idea_id =?
                ORDER BY Comments.comment_date DESC
            """, (idea_id,))
            comments = cursor.fetchall()
            close_db_connection(conn)
            comments_list = [dict(comment) for comment in comments] # Convert to dict
            return jsonify({'comments': comments_list}), 200
        except sqlite3.Error as e:
            close_db_connection(conn)
            return jsonify({'message': f'Database error: {e}'}), 500

    elif request.method == 'POST': # Add new comment
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'message': 'Unauthorized'}), 401

        data = request.get_json()
        comment_text = data.get('comment_text')
        if not comment_text:
            return jsonify({'message': 'Comment text is required'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO Comments (user_id, idea_id, comment_text) VALUES (?,?,?)",
                (user_id, idea_id, comment_text)
            )
            conn.commit()
            close_db_connection(conn)
            award_points(user_id, 'comment') # Award points for comment
            return jsonify({'message': 'Comment added successfully'}), 201
        except sqlite3.Error as e:
            conn.rollback()
            close_db_connection(conn)
            return jsonify({'message': f'Database error: {e}'}), 500

@app.route('/api/comments/<int:comment_id>', methods=['DELETE']) # Delete comment (Admin or comment owner)
def delete_comment(comment_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check if user is admin or comment owner
        cursor.execute("SELECT user_id FROM Comments WHERE comment_id =?", (comment_id,))
        comment = cursor.fetchone()
        if not comment:
            close_db_connection(conn)
            return jsonify({'message': 'Comment not found'}), 404

        cursor.execute("SELECT is_admin FROM Users WHERE user_id =?", (user_id,))
        user_admin_status = cursor.fetchone()

        if comment['user_id'] == user_id or (user_admin_status and user_admin_status['is_admin']): # Owner or Admin can delete
            cursor.execute("DELETE FROM Comments WHERE comment_id =?", (comment_id,))
            conn.commit()
            close_db_connection(conn)
            return jsonify({'message': 'Comment deleted successfully'}), 200
        else:
            close_db_connection(conn)
            return jsonify({'message': 'Not authorized to delete this comment'}), 403 # 403 Forbidden
    except sqlite3.Error as e:
        conn.rollback()
        close_db_connection(conn)
        return jsonify({'message': f'Database error: {e}'}), 500


# --- User Suggestion Endpoints (Admin View) ---
@app.route('/api/suggestions', methods=['GET', 'POST']) # Get all suggestions (admin), or submit new suggestion (user)
def suggestions_handler():
    if request.method == 'GET': # Get all suggestions (Admin only)
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'message': 'Unauthorized'}), 401
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT is_admin FROM Users WHERE user_id =?", (user_id,))
        user_admin_status = cursor.fetchone()
        if not user_admin_status or not user_admin_status['is_admin']:
            close_db_connection(conn)
            return jsonify({'message': 'Admin access required'}), 403

        try:
            cursor.execute("SELECT UserSuggestions.*, Users.username FROM UserSuggestions LEFT JOIN Users ON UserSuggestions.user_id = Users.user_id ORDER BY suggestion_date DESC")
            suggestions = cursor.fetchall()
            close_db_connection(conn)
            suggestions_list = [dict(suggestion) for suggestion in suggestions]
            return jsonify({'suggestions': suggestions_list}), 200
        except sqlite3.Error as e:
            close_db_connection(conn)
            return jsonify({'message': f'Database error: {e}'}), 500

    elif request.method == 'POST': # Submit new suggestion (user)
        user_id = session.get('user_id') # User might be logged in or anonymous
        data = request.get_json()
        suggestion_title = data.get('suggestion_title')
        suggestion_category = data.get('suggestion_category')
        suggestion_text = data.get('suggestion_text')

        if not suggestion_title or not suggestion_text:
            return jsonify({'message': 'Suggestion title and text are required'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO UserSuggestions (user_id, suggestion_title, suggestion_category, suggestion_text) VALUES (?,?,?,?)",
                (user_id, suggestion_title, suggestion_category, suggestion_text)
            )
            conn.commit()
            suggestion_id = cursor.lastrowid
            close_db_connection(conn)
            if user_id: # Award points only if user is logged in
                award_points(user_id, 'suggest_idea')
            return jsonify({'message': 'Suggestion submitted successfully', 'suggestion_id': suggestion_id}), 201
        except sqlite3.Error as e:
            conn.rollback()
            close_db_connection(conn)
            return jsonify({'message': f'Database error: {e}'}), 500


@app.route('/api/suggestions/<int:suggestion_id>', methods=['GET', 'PUT', 'DELETE']) # Get, Update (admin status), Delete suggestion (admin)
def suggestion_handler(suggestion_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT is_admin FROM Users WHERE user_id =?", (user_id,))
    user_admin_status = cursor.fetchone()
    if not user_admin_status or not user_admin_status['is_admin']:
        close_db_connection(conn)
        return jsonify({'message': 'Admin access required'}), 403

    if request.method == 'GET': # Get single suggestion (admin)
        try:
            cursor.execute("SELECT UserSuggestions.*, Users.username FROM UserSuggestions LEFT JOIN Users ON UserSuggestions.user_id = Users.user_id WHERE suggestion_id =?", (suggestion_id,))
            suggestion = cursor.fetchone()
            close_db_connection(conn)
            if suggestion:
                return jsonify({'suggestion': dict(suggestion)}), 200
            else:
                return jsonify({'message': 'Suggestion not found'}), 404
        except sqlite3.Error as e:
            close_db_connection(conn)
            return jsonify({'message': f'Database error: {e}'}), 500

    elif request.method == 'PUT': # Update suggestion status/admin notes (admin)
        data = request.get_json()
        status = data.get('status') # 'pending', 'approved', 'rejected'
        admin_notes = data.get('admin_notes')

        if status not in ['pending', 'approved', 'rejected']:
            return jsonify({'message': 'Invalid suggestion status'}), 400

        try:
            cursor.execute(
                "UPDATE UserSuggestions SET status =?, admin_notes =? WHERE suggestion_id =?",
                (status, admin_notes, suggestion_id)
            )
            conn.commit()
            close_db_connection(conn)
            return jsonify({'message': 'Suggestion updated successfully'}), 200
        except sqlite3.Error as e:
            conn.rollback()
            close_db_connection(conn)
            return jsonify({'message': f'Database error: {e}'}), 500

    elif request.method == 'DELETE': # Delete suggestion (admin)
        try:
            cursor.execute("DELETE FROM UserSuggestions WHERE suggestion_id =?", (suggestion_id,))
            conn.commit()
            close_db_connection(conn)
            return jsonify({'message': 'Suggestion deleted successfully'}), 200
        except sqlite3.Error as e:
            conn.rollback()
            close_db_connection(conn)
            return jsonify({'message': f'Database error: {e}'}), 500


# --- Featured Idea of the Day Endpoint (Admin) ---
@app.route('/api/featured_idea_of_day', methods=['GET', 'PUT']) # Get featured idea, or set featured idea (admin)
def featured_idea_of_day_handler():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT is_admin FROM Users WHERE user_id =?", (user_id,))
    user_admin_status = cursor.fetchone()
    if not user_admin_status or not user_admin_status['is_admin']:
        close_db_connection(conn)
        return jsonify({'message': 'Admin access required'}), 403

    if request.method == 'GET': # Get featured idea
        try:
            cursor.execute("SELECT * FROM Ideas WHERE is_featured = TRUE")
            featured_idea = cursor.fetchone()
            close_db_connection(conn)
            if featured_idea:
                return jsonify({'featured_idea': dict(featured_idea)}), 200
            else:
                return jsonify({'featured_idea': None}), 200 # No featured idea set
        except sqlite3.Error as e:
            close_db_connection(conn)
            return jsonify({'message': f'Database error: {e}'}), 500

    elif request.method == 'PUT': # Set featured idea (admin)
        data = request.get_json()
        idea_id_to_feature = data.get('idea_id') # Idea ID to set as featured

        if not idea_id_to_feature:
            return jsonify({'message': 'Idea ID is required'}), 400

        try:
            # Unfeature any existing featured idea first
            cursor.execute("UPDATE Ideas SET is_featured = FALSE WHERE is_featured = TRUE")
            # Feature the new idea
            cursor.execute("UPDATE Ideas SET is_featured = TRUE WHERE idea_id =?", (idea_id_to_feature,))
            conn.commit()
            close_db_connection(conn)
            return jsonify({'message': 'Featured idea updated successfully'}), 200
        except sqlite3.Error as e:
            conn.rollback()
            close_db_connection(conn)
            return jsonify({'message': f'Database error: {e}'}), 500


# --- Leaderboard Endpoint ---
@app.route('/api/leaderboard', methods=['GET']) # Get leaderboard of users by points
def get_leaderboard():
    limit = request.args.get('limit', default=10, type=int) # Limit for leaderboard size
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT user_id, username, total_points, profile_avatar
            FROM Users
            ORDER BY total_points DESC
            LIMIT?
        """, (limit,))
        leaderboard_data = cursor.fetchall()
        close_db_connection(conn)
        leaderboard_list = [dict(user) for user in leaderboard_data]
        return jsonify({'leaderboard': leaderboard_list}), 200
    except sqlite3.Error as e:
        close_db_connection(conn)
        return jsonify({'message': f'Database error: {e}'}), 500


# --- Get User Points Endpoint (No Changes) ---
@app.route('/api/user/<int:user_id>/points', methods=['GET'])
def api_get_user_points(user_id):
    points = get_user_points(user_id)
    return jsonify({'user_id': user_id, 'points': points})


if __name__ == '__main__':
    # --- Example: Insert admin user and test users with usernames and passwords ---
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        admin_password = generate_password_hash('adminpassword') # Stronger admin password!
        cursor.execute("INSERT INTO Users (username, password, email, is_admin) VALUES (?,?,?,?)", ('admin', admin_password, 'admin@example.com', True)) # Insert admin user
        hashed_password1 = generate_password_hash('password123')
        hashed_password2 = generate_password_hash('securepass')
        cursor.execute("INSERT INTO Users (username, password, email) VALUES (?,?,?)", ('testuser1', hashed_password1, 'testuser1@example.com'))
        cursor.execute("INSERT INTO Users (username, password, email) VALUES (?,?,?)", ('testuser2', hashed_password2, 'testuser2@example.com'))
        conn.commit()
        print("--- Added admin user and test users with usernames/passwords/emails (if not already present) ---")
    except sqlite3.IntegrityError:
        print("--- Test/Admin users likely already exist, skipping insertion ---")
        conn.rollback()
    finally:
        close_db_connection(conn)

    app.run(debug=True)