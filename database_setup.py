# database_setup.py (Updated Database Schema)
import sqlite3

DATABASE = 'goodaideas.db'

def create_database():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    # --- Updated Users Table ---
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT UNIQUE,          -- Added email
            profile_description TEXT,   -- Added profile description
            profile_avatar TEXT,        -- Added profile avatar (URL)
            total_points INTEGER DEFAULT 0,
            join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP        -- Added last login tracking
            is_admin BOOLEAN DEFAULT FALSE -- Added admin flag
        )
    ''')

    # --- Ideas Table (Enhanced) ---
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Ideas (
            idea_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            category TEXT,              -- Added category
            tags TEXT,                  -- Added tags (comma-separated)
            description TEXT NOT NULL,
            submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            rating REAL DEFAULT 0.0,    -- Idea rating (average)
            rating_count INTEGER DEFAULT 0, -- Number of ratings
            favorite_count INTEGER DEFAULT 0, -- Number of favorites
            is_featured BOOLEAN DEFAULT FALSE, -- For "Idea of the Day"
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )
    ''')

    # --- Points Table (No Change Needed, Assuming it Exists) ---
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Points (
            point_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            points_earned INTEGER NOT NULL,
            activity_type TEXT NOT NULL,
            activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )
    ''')

    # --- IdeaRatings Table (New for explicit ratings) ---
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS IdeaRatings (
            rating_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            idea_id INTEGER NOT NULL,
            rating_value INTEGER NOT NULL, -- Rating from 1 to 5 (e.g.)
            rating_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, idea_id),     -- One rating per user per idea
            FOREIGN KEY (user_id) REFERENCES Users(user_id),
            FOREIGN KEY (idea_id) REFERENCES Ideas(idea_id)
        )
    ''')

    # --- IdeaFavorites Table (New for favorites) ---
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS IdeaFavorites (
            favorite_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            idea_id INTEGER NOT NULL,
            favorite_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, idea_id),     -- One favorite per user per idea
            FOREIGN KEY (user_id) REFERENCES Users(user_id),
            FOREIGN KEY (idea_id) REFERENCES Ideas(idea_id)
        )
    ''')

    # --- UserSuggestions Table (Enhanced for admin view) ---
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS UserSuggestions (
            suggestion_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,                -- User suggesting (can be NULL if anonymous)
            suggestion_title TEXT NOT NULL,
            suggestion_category TEXT,
            suggestion_text TEXT NOT NULL,
            suggestion_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'pending',   -- 'pending', 'approved', 'rejected' - for admin moderation
            admin_notes TEXT,               -- Admin notes on suggestion
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )
    ''')


    conn.commit()
    conn.close()
    print("Database tables created/updated successfully.")

if __name__ == '__main__':
    create_database()