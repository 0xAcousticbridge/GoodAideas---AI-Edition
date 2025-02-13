import sqlite3

DATABASE_NAME = 'goodaideas.db'

def create_tables():
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        registration_date DATETIME NOT NULL,
        points INTEGER DEFAULT 0
    )
    """)

    # Ideas table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ideas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        tags TEXT,
        submission_date DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """)

    # Favorites table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        idea_id INTEGER NOT NULL,
        favorited_date DATETIME NOT NULL,
        UNIQUE(user_id, idea_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (idea_id) REFERENCES ideas(id)
    )
    """)

    # Ratings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        idea_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        rating_date DATETIME NOT NULL,
        UNIQUE(user_id, idea_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (idea_id) REFERENCES ideas(id)
    )
    """)

    conn.commit()
    conn.close()
    print("Database tables created successfully.")


def insert_test_data():
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    # Test Users (only if no users exist)
    cursor.execute("SELECT count(*) FROM users")
    user_count = cursor.fetchone()
    if user_count == 0:
        print("-Test users likely do not exist, inserting...")
        cursor.execute("INSERT INTO users (username, password, registration_date, points) VALUES (?,?,?,?)",
                       ('testuser', generate_password_hash('password'), datetime.now(), 10))
        cursor.execute("INSERT INTO users (username, password, registration_date, points) VALUES (?,?,?,?)",
                       ('adminuser', generate_password_hash('adminpass'), datetime.now(), 100)) # Example admin user
    else:
        print("-Test users likely already exist, skipping insertion")

    # Test Ideas (inserting a few sample ideas)
    test_ideas = [
        ("AI Posture Reminder", "Health & Wellness", "Slouching at your desk? This AI idea reminds you to sit up straight!", "posture, health, ai", datetime.now(), 3.2),
        ("AI-Powered Language Learning App", "Productivity", "Want to learn a new language? Use an AI app for personalized lessons.", "language, learning, ai, education", datetime.now(), 4.6),
        ("AI-Based Recipe Recommendation", "Health & Wellness", "Stuck in a cooking rut? Get AI to suggest recipes based on ingredients you have.", "recipe, cooking, ai, food", datetime.now(), 4.1),
        ("AI Financial Goal Setting Tool", "Finance", "Need help with financial planning? AI can help you set and track your financial goals.", "finance, ai, budgeting, goals", datetime.now(), 3.7),
        ("AI Travel Planner Personal Assistant", "Productivity", "Planning a trip? AI travel assistants can help you find flights, hotels, and itineraries.", "travel, ai, planning, productivity", datetime.now(), 4.4),
    ]

    cursor.execute("SELECT count(*) FROM ideas")
    idea_count = cursor.fetchone()
    if idea_count < 5: # Insert only if less than 5 test ideas exist
        print("-Fewer than 5 test ideas found, inserting...")
        for idea in test_ideas:
            cursor.execute("INSERT INTO ideas (title, category, description, tags, submission_date, average_rating) VALUES (?,?,?,?,?,?)", idea)
    else:
        print("-At least 5 test ideas already exist, skipping insertion")


    conn.commit()
    conn.close()
    print("Test data inserted (if needed).")


if __name__ == '__main__':
    create_tables()
    insert_test_data()