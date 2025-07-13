# runner/main.py
import subprocess

try:
    result = subprocess.run(
        ["python", "user/solution.py"],
        stdin=open("user/input.txt", "r"),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        timeout=2
    )

    print(result.stdout.strip())
    if result.stderr:
        print(result.stderr.strip())
except Exception as e:
    print(f"Error: {e}")

