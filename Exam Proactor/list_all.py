
import sqlite3
import os

db_path = 'db.sqlite3'
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found in {os.getcwd()}")
    exit(1)

conn = sqlite3.connect(db_path)
c = conn.cursor()

c.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in c.fetchall()]
print(f"TABLES: {tables}")

for table in ['users', 'exams', 'questions', 'exam_enrollments', 'proctoring_violations']:
    if table in tables:
        print(f"\n--- {table.upper()} ---")
        try:
            c.execute(f"SELECT * FROM {table} LIMIT 10")
            rows = c.fetchall()
            for r in rows:
                print(r)
        except Exception as e:
            print(f"Error reading {table}: {e}")
    else:
        print(f"\nTable {table} not found.")

conn.close()
