import subprocess
import tempfile
import os
import time
from django.conf import settings
from .models import Submission
from problems.models import TestCase


def evaluate_contest_submission(submission_id):
    """Evaluate a contest submission against test cases and calculate score"""
    print(f"Starting contest evaluation for submission {submission_id}")
    try:
        from contests.models import ContestSubmission
        submission = ContestSubmission.objects.get(id=submission_id)
        problem = submission.problem
        test_cases = problem.test_cases.all()
        print(f"Found {len(test_cases)} test cases for problem: {problem.title}")
        
        # Language-specific configurations
        language_configs = {
            'python': {
                'file_extension': '.py',
                'run_command': 'python',
            },
            'cpp': {
                'file_extension': '.cpp',
                'compile_command': 'g++ -o solution solution.cpp',
                'run_command': './solution',
            },
            'java': {
                'file_extension': '.java',
                'compile_command': 'javac Solution.java',
                'run_command': 'java Solution',
            },
            'javascript': {
                'file_extension': '.js',
                'run_command': 'node',
            },
        }
        
        config = language_configs.get(submission.language)
        if not config:
            submission.verdict = 'Compilation Error'
            submission.error_message = f'Unsupported language: {submission.language}'
            submission.save()
            return
        
        # Create temporary directory for code
        with tempfile.TemporaryDirectory() as temp_dir:
            # Use the same test runner approach as run_test
            from .test_runners import create_test_script_for_problem
            
            # Create appropriate test script based on problem type
            test_script = create_test_script_for_problem(problem.title, submission.code)
            
            # Write code to file
            code_file = os.path.join(temp_dir, f'solution{config["file_extension"]}')
            with open(code_file, 'w') as f:
                f.write(test_script)
            
            # Change to temp directory
            original_dir = os.getcwd()
            os.chdir(temp_dir)
            
            try:
                # Compile if needed
                if 'compile_command' in config:
                    try:
                        result = subprocess.run(
                            config['compile_command'],
                            shell=True,
                            capture_output=True,
                            text=True,
                            timeout=getattr(settings, "CODE_EXECUTION_TIMEOUT", 10)
                        )
                        if result.returncode != 0:
                            submission.verdict = 'Compilation Error'
                            submission.error_message = result.stderr
                            submission.save()
                            return
                    except subprocess.TimeoutExpired:
                        submission.verdict = 'Time Limit Exceeded'
                        submission.error_message = 'Compilation timeout'
                        submission.save()
                        return
                
                # Run test cases
                passed_cases = 0
                total_cases = len(test_cases)
                start_time = time.time()
                
                for test_case in test_cases:
                    try:
                        # Run with input as stdin
                        result = subprocess.run(
                            f'{config["run_command"]} solution{config["file_extension"]}',
                            shell=True,
                            capture_output=True,
                            text=True,
                            input=test_case.input_data,
                            timeout=getattr(settings, "CODE_EXECUTION_TIMEOUT", 10)
                        )
                        
                        if result.returncode != 0:
                            submission.verdict = 'Runtime Error'
                            submission.error_message = result.stderr
                            submission.save()
                            break
                        
                        # Compare output
                        actual_output = result.stdout.strip()
                        expected_output = test_case.expected_output.strip()
                        
                        if actual_output == expected_output:
                            passed_cases += 1
                        else:
                            submission.verdict = 'Wrong Answer'
                            submission.error_message = f'Expected: {expected_output}, Got: {actual_output}'
                            submission.save()
                            break
                            
                    except subprocess.TimeoutExpired:
                        submission.verdict = 'Time Limit Exceeded'
                        submission.error_message = 'Execution timeout'
                        submission.save()
                        break
                    except Exception as e:
                        submission.verdict = 'Runtime Error'
                        submission.error_message = str(e)
                        submission.save()
                        break
                
                execution_time = time.time() - start_time
                
                # Calculate score based on contest problem points
                # Get the contest problem to access points
                contest_problem = submission.contest.problems.get(problem=problem)
                problem_points = contest_problem.points if contest_problem else 0
                
                # Update submission
                submission.execution_time = execution_time
                submission.test_cases_passed = passed_cases
                submission.total_test_cases = total_cases
                
                if passed_cases == total_cases:
                    submission.verdict = 'Accepted'
                    submission.score = problem_points  # Full points for accepted solution
                else:
                    submission.score = 0  # No points for failed solution
                
                print(f"Contest evaluation complete: {passed_cases}/{total_cases} test cases passed. Verdict: {submission.verdict}, Score: {submission.score}")
                submission.save()
                
            finally:
                # Change back to original directory
                os.chdir(original_dir)
                    
    except ContestSubmission.DoesNotExist:
        print(f"Contest submission {submission_id} not found")
    except Exception as e:
        print(f"Error evaluating contest submission {submission_id}: {str(e)}")
        try:
            from contests.models import ContestSubmission
            submission = ContestSubmission.objects.get(id=submission_id)
            submission.verdict = 'Runtime Error'
            submission.error_message = str(e)
            submission.score = 0
            submission.save()
            print(f"Marked contest submission {submission_id} as Runtime Error")
        except Exception as inner_e:
            print(f"Failed to update contest submission {submission_id}: {str(inner_e)}")


def evaluate_submission(submission_id):
    """Evaluate a code submission against test cases using subprocess"""
    print(f"Starting evaluation for submission {submission_id}")
    try:
        submission = Submission.objects.get(id=submission_id)
        problem = submission.problem
        test_cases = problem.test_cases.all()
        print(f"Found {len(test_cases)} test cases for problem: {problem.title}")
        
        # Language-specific configurations
        language_configs = {
            'python': {
                'file_extension': '.py',
                'run_command': 'python',
            },
            'cpp': {
                'file_extension': '.cpp',
                'compile_command': 'g++ -o solution solution.cpp',
                'run_command': './solution',
            },
            'java': {
                'file_extension': '.java',
                'compile_command': 'javac Solution.java',
                'run_command': 'java Solution',
            },
            'javascript': {
                'file_extension': '.js',
                'run_command': 'node',
            },
        }
        
        config = language_configs.get(submission.language)
        if not config:
            submission.verdict = 'Compilation Error'
            submission.error_message = f'Unsupported language: {submission.language}'
            submission.save()
            return
        
        # Create temporary directory for code
        with tempfile.TemporaryDirectory() as temp_dir:
            # Use the same test runner approach as run_test
            from .test_runners import create_test_script_for_problem
            
            # Create appropriate test script based on problem type
            test_script = create_test_script_for_problem(problem.title, submission.code)
            
            # Write code to file
            code_file = os.path.join(temp_dir, f'solution{config["file_extension"]}')
            with open(code_file, 'w') as f:
                f.write(test_script)
            
            # Change to temp directory
            original_dir = os.getcwd()
            os.chdir(temp_dir)
            
            try:
                # Compile if needed
                if 'compile_command' in config:
                    try:
                        result = subprocess.run(
                            config['compile_command'],
                            shell=True,
                            capture_output=True,
                            text=True,
                            timeout=getattr(settings, "CODE_EXECUTION_TIMEOUT", 10)
                        )
                        if result.returncode != 0:
                            submission.verdict = 'Compilation Error'
                            submission.error_message = result.stderr
                            submission.save()
                            return
                    except subprocess.TimeoutExpired:
                        submission.verdict = 'Time Limit Exceeded'
                        submission.error_message = 'Compilation timeout'
                        submission.save()
                        return
                
                # Run test cases
                passed_cases = 0
                total_cases = len(test_cases)
                start_time = time.time()
                
                for test_case in test_cases:
                    try:
                        # Run with input as stdin
                        result = subprocess.run(
                            f'{config["run_command"]} solution{config["file_extension"]}',
                            shell=True,
                            capture_output=True,
                            text=True,
                            input=test_case.input_data,
                            timeout=getattr(settings, "CODE_EXECUTION_TIMEOUT", 10)
                        )
                        
                        if result.returncode != 0:
                            submission.verdict = 'Runtime Error'
                            submission.error_message = result.stderr
                            submission.save()
                            break
                        
                        # Compare output
                        actual_output = result.stdout.strip()
                        expected_output = test_case.expected_output.strip()
                        
                        if actual_output == expected_output:
                            passed_cases += 1
                        else:
                            submission.verdict = 'Wrong Answer'
                            submission.error_message = f'Expected: {expected_output}, Got: {actual_output}'
                            submission.save()
                            break
                            
                    except subprocess.TimeoutExpired:
                        submission.verdict = 'Time Limit Exceeded'
                        submission.error_message = 'Execution timeout'
                        submission.save()
                        break
                    except Exception as e:
                        submission.verdict = 'Runtime Error'
                        submission.error_message = str(e)
                        submission.save()
                        break
                
                execution_time = time.time() - start_time
                
                # Update submission
                submission.execution_time = execution_time
                submission.test_cases_passed = passed_cases
                submission.total_test_cases = total_cases
                
                if passed_cases == total_cases:
                    submission.verdict = 'Accepted'
                
                print(f"Evaluation complete: {passed_cases}/{total_cases} test cases passed. Verdict: {submission.verdict}")
                submission.save()
                
            finally:
                # Change back to original directory
                os.chdir(original_dir)
                    
    except Submission.DoesNotExist:
        print(f"Submission {submission_id} not found")
    except Exception as e:
        print(f"Error evaluating submission {submission_id}: {str(e)}")
        try:
            submission = Submission.objects.get(id=submission_id)
            submission.verdict = 'Runtime Error'
            submission.error_message = str(e)
            submission.save()
            print(f"Marked submission {submission_id} as Runtime Error")
        except Exception as inner_e:
            print(f"Failed to update submission {submission_id}: {str(inner_e)}") 