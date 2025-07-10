import subprocess
import uuid
import os
import shutil

def run_python_code(code: str, input_data: str, timeout: int = 2):
    return _run_code_generic(code, input_data, timeout, language="python")

def run_cpp_code(code: str, input_data: str, timeout: int = 2):
    return _run_code_generic(code, input_data, timeout, language="cpp")


def _run_code_generic(code: str, input_data: str, timeout: int, language: str):
    run_id = uuid.uuid4().hex
    run_dir = os.path.join("temp_codes", run_id)
    os.makedirs(run_dir, exist_ok=True)

    # Choose filenames based on language
    code_file = "solution.py" if language == "python" else "main.cpp"
    with open(os.path.join(run_dir, code_file), "w") as f:
        f.write(code)
    with open(os.path.join(run_dir, "input.txt"), "w") as f:
        f.write(input_data)

    # Choose Docker image
    docker_image = "code-runner" if language == "python" else "cpp-runner"

    try:
        result = subprocess.run(
            [
                "docker", "run",
                "--rm",
                "-v", f"{os.path.abspath(run_dir)}:/app/user",  # mount code and input
                docker_image
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=timeout
        )

        return {
            "success": result.returncode == 0,
            "output": result.stdout.decode().strip(),
            "error": result.stderr.decode().strip()
        }

    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "output": "",
            "error": "Time Limit Exceeded"
        }

    finally:
        shutil.rmtree(run_dir)
