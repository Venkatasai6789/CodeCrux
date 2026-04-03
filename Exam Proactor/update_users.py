from django.contrib.auth import get_user_model
User = get_user_model()

print("\nCurrent Users:")
for u in User.objects.all():
    print(f"- {u.username}: role={getattr(u, 'role', 'N/A')}, is_staff={u.is_staff}, is_superuser={u.is_superuser}")

# Update users
print("\nUpdating users...")
for u in User.objects.all():
    if u.username.lower() == 'pardhu':
        u.is_staff = True
        u.is_superuser = True
        if hasattr(u, 'role'):
            u.role = 'instructor' # Also assuming it could be admin
        u.save()
        print(f"Updated {u.username} to ADMIN/INSTRUCTOR")
    else:
        u.is_staff = False
        u.is_superuser = False
        if hasattr(u, 'role'):
            u.role = 'student'
        u.save()
        print(f"Updated {u.username} to STUDENT")

print("\nFinal Users:")
for u in User.objects.all():
    print(f"- {u.username}: role={getattr(u, 'role', 'N/A')}, is_staff={u.is_staff}, is_superuser={u.is_superuser}")
