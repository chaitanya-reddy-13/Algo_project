from judge.run_code import run_python_code

# This code runs forever
code = """
while True:
    pass
"""

input_data = ""  # no input needed

result = run_python_code(code, input_data)
print("Success:", result["success"])
print("Output:", result["output"])
print("Error:", result["error"])

