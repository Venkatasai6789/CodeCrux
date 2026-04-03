
import sqlite3
import os

db_path = 'db.sqlite3'
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found in {os.getcwd()}")
    exit(1)

conn = sqlite3.connect(db_path)
c = conn.cursor()

c.execute("SELECT username, role, first_name, last_name FROM users WHERE username IN ('pardhu', 'hitesh')")
users = c.fetchall()
print("--- USERS ---")
for u in users:
    print(f"Username: {u[0]}, Role: {u[1]}, Name: {u[2]} {u[3]}")

c.execute("SELECT id, title, instructor_id FROM exams")
exams = c.fetchall()
print("\n--- EXAMS ---")
for ex in exams:
    print(f"ID: {ex[0]}, Title: {ex[1]}, Instructor ID: {ex[2]}")

# Check which table holds enrollments. Django usually uses <app>_<model>
c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%enrollment%'")
tables = c.fetchall()
print(f"\nEnrollment tables: {tables}")

for t in tables:
    table_name = t[0]
    print(f"\n--- DATA FROM {table_name} ---")
    c.execute(f"SELECT id, exam_id, student_id, status, score FROM {table_name}")
    for row in c.fetchall():
        print(row)

conn.close()
