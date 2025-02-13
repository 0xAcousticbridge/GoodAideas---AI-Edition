import sqlite3

DATABASE = 'goodaideas.db'  # Path to your database file

def get_db_connection():
    """Opens a database connection if not already opened."""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def close_db_connection(conn):
    """Closes the database connection if it's open."""
    if conn:
        conn.close()


def award_points(user_id, activity_type):
    """Awards points to a user for a specific activity."""
    points_values = {
        'login': 5,
        'favorite_idea': 3,
        'rate_idea': 1,
        'comment': 2,
        'suggest_idea': 10
    }
    points_earned = points_values.get(activity_type, 0)

    if points_earned > 0:
        conn = get_db_connection()
        cursor = conn.cursor()

        try:
            cursor.execute(
                "INSERT INTO Points (user_id, points_earned, activity_type) VALUES (?, ?, ?)",
                (user_id, points_earned, activity_type)
            )
            cursor.execute(
                "UPDATE Users SET total_points = total_points + ? WHERE user_id = ?",
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


def get_user_points(user_id):
    """Retrieves a user's total points."""
    conn = get_db_connection()
    cursor = conn.cursor()
    total_points = 0

    try:
        cursor.execute("SELECT total_points FROM Users WHERE user_id = ?", (user_id,))
        result = cursor.fetchone()

        if result:
            total_points = result[0]
        else:
            print(f"User with ID {user_id} not found in database.")

    except sqlite3.Error as e:
        print(f"Database error retrieving points: {e}")
        total_points = 0
    finally:
        close_db_connection(conn)

    return total_points


def update_total_user_points(user_id, points_to_add):
    """Updates the 'total_points' column in the Users table."""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "UPDATE Users SET total_points = total_points + ? WHERE user_id = ?",
            (points_to_add, user_id)
        )
        conn.commit()
        print(f"Updated total points for user {user_id} by {points_to_add}.")

    except sqlite3.Error as e:
        conn.rollback()
        print(f"Database error updating total points: {e}")
    finally:
        close_db_connection(conn)


if __name__ == '__main__':
    print("--- Testing Points System Functions ---")

    # --- Example: Insert some users for testing ---
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO Users (username) VALUES (?)", ('testuser1',))
    cursor.execute("INSERT INTO Users (username) VALUES (?)", ('testuser2',))
    conn.commit()
    close_db_connection(conn)
    print("--- Added test users ---")


    # --- Test award_points function ---
    award_points(user_id=1, activity_type='login')
    award_points(user_id=1, activity_type='favorite_idea')
    award_points(user_id=2, activity_type='comment')
    print("--- Points awarded ---")

    # --- Test get_user_points function ---
    user1_points = get_user_points(user_id=1)
    print(f"User 1 points: {user1_points}")  # Expected: 8
    user2_points = get_user_points(user_id=2)
    print(f"User 2 points: {user2_points}")  # Expected: 2
    user3_points = get_user_points(user_id=3)  # User 3 might not exist
    print(f"User 3 points: {user3_points}")  # Expected: 0

    print("--- Points retrieved ---")

    print("--- End of Points System Function Tests ---")