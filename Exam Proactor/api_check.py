import requests
import json

try:
    response = requests.get("http://localhost:8000/api/questions/questions/?exam_id=11")
    data = response.json()
    with open('api_check.txt', 'w') as f:
        f.write(json.dumps(data, indent=2))
    print("API Check successful")
except Exception as e:
    with open('api_check.txt', 'w') as f:
        f.write(str(e))
    print("API Check failed")
