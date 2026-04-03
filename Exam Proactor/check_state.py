
import sqlite3
import os

db_path = 'db.sqlite3'
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found in {os.getcwd()}")
    exit(1)

conn = sqlite3.connect(db_path)
c = conn.cursor()

print("--- USER ROLES ---")
c.execute("SELECT id, username, role, first_name, last_name FROM users")
for row in c.fetchall():
    print(f"ID: {row[0]}, Username: {row[1]}, Role: {row[2]}, Name: {row[3]} {row[4]}")

print("\n--- EXAMS ---")
c.execute("SELECT id, title, instructor_id, status FROM exams")
for row in c.fetchall():
    print(f"ID: {row[0]}, Title: {row[1]}, Instructor_ID: {row[2]}, Status: {row[3]}")

print("\n--- ENROLLMENTS (Submissions) ---")
c.execute("""
    SELECT e.id, e.exam_id, ex.title, e.student_id, u.username, e.status, e.score 
    FROM exams_examenrollment e
    JOIN exams ex ON e.exam_id = ex.id
    JOIN users u ON e.student_id = u.id
""")
for row in c.fetchall():
    print(f"EnrID: {row[0]}, ExamID: {row[1]}, Exam: {row[2]}, StudentID: {row[3]}, Student: {row[4]}, Status: {row[5]}, Score: {row[6]}")

conn.close()
