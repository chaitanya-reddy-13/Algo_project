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
    base_dir = os.path.abspath("temp_codes")
    run_dir = os.path.join(base_dir, run_id)
    os.makedirs(run_dir, exist_ok=True)

    # File setup
    code_file = "solution.py" if language == "python" else "main.cpp"
    code_path = os.path.join(run_dir, code_file)
    input_path = os.path.join(run_dir, "input.txt")

    with open(code_path, "w") as f:
        f.write(code)
    with open(input_path, "w") as f:
        f.write(input_data)

    docker_image = "code-runner" if language == "python" else "cpp-runner"

    try:
        result = subprocess.run(
            [
                "docker", "run",
                "--rm",
                "-v", f"{run_dir}:/app/user",  # mount exact dir
                docker_image
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=timeout
        )

        stdout_output = result.stdout.decode().strip()
        stderr_output = result.stderr.decode().strip()
        returncode = result.returncode

        # Docker or permission issues
        if "not recognized" in stderr_output:
            return {
                "success": False,
                "output": "",
                "error": "Docker is not installed or not in the system's PATH."
            }
        if "Cannot connect to the Docker daemon" in stderr_output:
            return {
                "success": False,
                "output": "",
                "error": "Docker is not running. Please start Docker Desktop."
            }

        return {
            "success": returncode == 0,
            "output": stdout_output,
            "error": stderr_output if returncode != 0 else ""
        }

    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "output": "",
            "error": "Time Limit Exceeded"
        }
    except FileNotFoundError:
        return {
            "success": False,
            "output": "",
            "error": "Docker not found or incorrect path setup."
        }
    finally:
        shutil.rmtree(run_dir, ignore_errors=True)
