import sqlite3
conn = sqlite3.connect('db.sqlite3')
c = conn.cursor()

# List all tables
c.execute("SELECT name FROM sqlite_master WHERE type='table'")
print("TABLES:", [r[0] for r in c.fetchall()])

# Check users
try:
    c.execute("SELECT id, username, email, role, first_name, last_name FROM users")
    users = c.fetchall()
    print(f"\nUSERS ({len(users)}):")
    for u in users:
        print(f"  id={u[0]}, username={u[1]}, email={u[2]}, role={u[3]}, name={u[4]} {u[5]}")
except Exception as e:
    print(f"Users table error: {e}")

# Check exams
try:
    c.execute("SELECT id, title, status, duration_minutes FROM exams")
    exams = c.fetchall()
    print(f"\nEXAMS ({len(exams)}):")
    for ex in exams:
        print(f"  id={ex[0]}, title={ex[1]}, status={ex[2]}, duration={ex[3]}")
except Exception as e:
    print(f"Exams table error: {e}")

# Check questions
try:
    c.execute("SELECT id, exam_id, question_type, title, marks FROM questions")
    qs = c.fetchall()
    print(f"\nQUESTIONS ({len(qs)}):")
    for q in qs:
        print(f"  id={q[0]}, exam_id={q[1]}, type={q[2]}, title={q[3]}, marks={q[4]}")
except Exception as e:
    print(f"Questions table error: {e}")

conn.close()
