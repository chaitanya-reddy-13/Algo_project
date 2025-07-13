#!/bin/bash
set -e  # Stop on first error

# Compile C++ code
g++ /app/user/main.cpp -o /app/user/main

# Run the compiled binary with input
/app/user/main < /app/user/input.txt
