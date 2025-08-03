from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Min, Avg, Q
from django.utils import timezone
from datetime import timedelta
from .models import Submission
from .serializers import (
    SubmissionSerializer, SubmissionCreateSerializer,
    LeaderboardEntrySerializer, UserStatsSerializer
)
from problems.models import Problem


class SubmissionListView(generics.ListAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['problem', 'user', 'verdict', 'language']
    ordering_fields = ['submitted_at', 'execution_time', 'memory']
    ordering = ['-submitted_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Submission.objects.all()
        return Submission.objects.filter(user=user)


class SubmissionDetailView(generics.RetrieveAPIView):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Submission.objects.all()
        return Submission.objects.filter(user=user)


class SubmissionCreateView(generics.CreateAPIView):
    serializer_class = SubmissionCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        try:
            submission = serializer.save(user=self.request.user)
            # Run evaluation synchronously (without Celery/Redis)
            from .tasks import evaluate_submission
            evaluate_submission(submission.id)
        except Exception as e:
            # Log the error but don't fail the request
            print(f"Error creating submission: {str(e)}")
            # Mark the submission as having an error
            submission.verdict = 'Runtime Error'
            submission.error_message = f'Error during submission: {str(e)}'
            submission.save()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def leaderboard(request):
    """Get leaderboard data"""
    problem_id = request.query_params.get('problem')
    
    if problem_id:
        # Problem-specific leaderboard
        try:
            problem = Problem.objects.get(id=problem_id)
            submissions = Submission.objects.filter(
                problem=problem,
                verdict='Accepted'
            ).select_related('user')
            
            # Group by user and get best performance
            leaderboard_data = []
            user_performance = {}
            
            for submission in submissions:
                user_id = submission.user.id
                if user_id not in user_performance:
                    user_performance[user_id] = {
                        'user': submission.user,
                        'problem': problem,
                        'total_submissions': 0,
                        'accepted_submissions': 0,
                        'best_execution_time': float('inf'),
                        'best_memory_usage': float('inf'),
                        'last_submission_date': submission.submitted_at
                    }
                
                user_performance[user_id]['total_submissions'] += 1
                user_performance[user_id]['accepted_submissions'] += 1
                
                if submission.execution_time and submission.execution_time < user_performance[user_id]['best_execution_time']:
                    user_performance[user_id]['best_execution_time'] = submission.execution_time
                
                if submission.memory and submission.memory < user_performance[user_id]['best_memory_usage']:
                    user_performance[user_id]['best_memory_usage'] = submission.memory
            
            # Convert to list and sort by execution time
            for user_id, data in user_performance.items():
                if data['best_execution_time'] != float('inf'):
                    leaderboard_data.append(data)
            
            leaderboard_data.sort(key=lambda x: x['best_execution_time'])
            
            serializer = LeaderboardEntrySerializer(leaderboard_data, many=True)
            return Response(serializer.data)
            
        except Problem.DoesNotExist:
            return Response({'error': 'Problem not found'}, status=status.HTTP_404_NOT_FOUND)
    
    else:
        # Global leaderboard
        # Get users with their stats
        user_stats = []
        users = request.user.__class__.objects.filter(is_active=True)
        
        for user in users:
            submissions = Submission.objects.filter(user=user)
            accepted_submissions = submissions.filter(verdict='Accepted')
            
            if accepted_submissions.exists():
                stats = {
                    'user': user,
                    'total_problems_solved': accepted_submissions.values('problem').distinct().count(),
                    'total_submissions': submissions.count(),
                    'accepted_submissions': accepted_submissions.count(),
                    'acceptance_rate': (accepted_submissions.count() / submissions.count()) * 100 if submissions.count() > 0 else 0,
                    'average_execution_time': accepted_submissions.aggregate(Avg('execution_time'))['execution_time__avg'] or 0,
                }
                user_stats.append(stats)
        
        # Sort by problems solved, then by acceptance rate
        user_stats.sort(key=lambda x: (x['total_problems_solved'], x['acceptance_rate']), reverse=True)
        
        # Add rank
        for i, stats in enumerate(user_stats):
            stats['rank'] = i + 1
        
        serializer = UserStatsSerializer(user_stats, many=True)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def submission_stats(request):
    """Get submission statistics"""
    user = request.user
    submissions = Submission.objects.filter(user=user)
    
    total_submissions = submissions.count()
    accepted_submissions = submissions.filter(verdict='Accepted').count()
    pending_submissions = submissions.filter(verdict='Pending').count()
    
    # Recent submissions (last 7 days)
    week_ago = timezone.now() - timedelta(days=7)
    recent_submissions = submissions.filter(submitted_at__gte=week_ago).count()
    
    # Language distribution
    language_stats = submissions.values('language').annotate(count=Count('language'))
    
    # Verdict distribution
    verdict_stats = submissions.values('verdict').annotate(count=Count('verdict'))
    
    return Response({
        'total_submissions': total_submissions,
        'accepted_submissions': accepted_submissions,
        'pending_submissions': pending_submissions,
        'recent_submissions': recent_submissions,
        'acceptance_rate': (accepted_submissions / total_submissions * 100) if total_submissions > 0 else 0,
        'language_stats': language_stats,
        'verdict_stats': verdict_stats,
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def run_test(request):
    """Run code against visible test cases for testing"""
    from problems.models import Problem, TestCase
    
    problem_id = request.data.get('problem_id')
    code = request.data.get('code')
    language = request.data.get('language', 'python')
    
    if not all([problem_id, code]):
        return Response(
            {'error': 'Problem ID and code are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        problem = Problem.objects.get(id=problem_id, is_active=True)
        # Get only visible test cases for testing
        test_cases = TestCase.objects.filter(problem=problem, is_hidden=False)
        
        if not test_cases.exists():
            return Response(
                {'error': 'No test cases available for this problem'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = []
        for test_case in test_cases:
            try:
                # Simple code execution for testing (without Docker for now)
                # This is a basic implementation - in production, use Docker
                if language == 'python':
                    # Create a safe execution environment
                    import subprocess
                    import tempfile
                    import os
                    from .test_runners import create_test_script_for_problem
                    
                    # Create appropriate test script based on problem type
                    test_script = create_test_script_for_problem(problem.title, code)
                    
                    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                        f.write(test_script)
                        temp_file = f.name
                    
                    try:
                        # Run with timeout
                        result = subprocess.run(
                            ['python', temp_file],
                            input=test_case.input_data,
                            capture_output=True,
                            text=True,
                            timeout=5
                        )
                        
                        output = result.stdout.strip()
                        error = result.stderr.strip()
                        
                        # Simple output comparison
                        is_correct = output == test_case.expected_output.strip()
                        
                        results.append({
                            'test_case_id': test_case.id,
                            'input': test_case.input_data,
                            'expected_output': test_case.expected_output,
                            'actual_output': output,
                            'error': error,
                            'passed': is_correct,
                            'execution_time': 0.1  # Placeholder
                        })
                        
                    finally:
                        os.unlink(temp_file)
                else:
                    results.append({
                        'test_case_id': test_case.id,
                        'input': test_case.input_data,
                        'expected_output': test_case.expected_output,
                        'actual_output': '',
                        'error': f'Language {language} not supported for testing yet',
                        'passed': False,
                        'execution_time': 0
                    })
                    
            except Exception as e:
                results.append({
                    'test_case_id': test_case.id,
                    'input': test_case.input_data,
                    'expected_output': test_case.expected_output,
                    'actual_output': '',
                    'error': str(e),
                    'passed': False,
                    'execution_time': 0
                })
        
        passed_count = sum(1 for r in results if r['passed'])
        total_count = len(results)
        
        return Response({
            'results': results,
            'summary': {
                'passed': passed_count,
                'total': total_count,
                'success_rate': round((passed_count / total_count) * 100, 2) if total_count > 0 else 0
            }
        })
        
    except Problem.DoesNotExist:
        return Response(
            {'error': 'Problem not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def online_compiler(request):
    """Professional online compiler with comprehensive error handling"""
    import subprocess
    import tempfile
    import os
    import signal
    import threading
    import time
    import json
    from pathlib import Path
    
    code = request.data.get('code', '')
    language = request.data.get('language', 'python')
    input_data = request.data.get('input', '')
    timeout = request.data.get('timeout', 10)  # Default 10 seconds
    
    if not code.strip():
        return Response(
            {'error': 'Code is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Language-specific configurations
    language_configs = {
        'python': {
            'extension': '.py',
            'command': 'python',
            'template': code,
            'timeout_multiplier': 1
        },
        'cpp': {
            'extension': '.cpp',
            'command': 'g++',
            'template': f"""#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <map>
#include <set>
#include <queue>
#include <stack>
#include <cmath>
#include <climits>
#include <cstring>
using namespace std;

{code}

int main() {{
    // Read input from stdin
    string line;
    while (getline(cin, line)) {{
        cout << line << endl;
    }}
    return 0;
}}""",
            'timeout_multiplier': 1.5
        },
        'java': {
            'extension': '.java',
            'command': 'javac',
            'template': f"""import java.util.*;
import java.io.*;

public class Main {{
    {code}
    
    public static void main(String[] args) {{
        Scanner scanner = new Scanner(System.in);
        while (scanner.hasNextLine()) {{
            System.out.println(scanner.nextLine());
        }}
        scanner.close();
    }}
}}""",
            'timeout_multiplier': 1.2
        },
        'javascript': {
            'extension': '.js',
            'command': 'node',
            'template': f"""const readline = require('readline');

const rl = readline.createInterface({{
    input: process.stdin,
    output: process.stdout
}});

{code}

// Read input and process
let inputLines = [];
rl.on('line', (line) => {{
    inputLines.push(line);
}});

rl.on('close', () => {{
    // Process input here
    inputLines.forEach(line => {{
        console.log(line);
    }});
}});
""",
            'timeout_multiplier': 1
        }
    }
    
    if language not in language_configs:
        return Response(
            {'error': f'Language {language} is not supported'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    config = language_configs[language]
    actual_timeout = timeout * config['timeout_multiplier']
    
    try:
        # Create temporary directory for compilation
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Write code to file
            source_file = temp_path / f"main{config['extension']}"
            with open(source_file, 'w', encoding='utf-8') as f:
                f.write(config['template'])
            
            # Compile if needed (for C++ and Java)
            executable_path = None
            if language == 'cpp':
                executable_path = temp_path / "main"
                compile_result = subprocess.run(
                    [config['command'], str(source_file), '-o', str(executable_path)],
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                if compile_result.returncode != 0:
                    return Response({
                        'success': False,
                        'error_type': 'compilation_error',
                        'error_message': compile_result.stderr,
                        'execution_time': 0,
                        'memory_usage': 0
                    })
                executable_path = str(executable_path)
            elif language == 'java':
                compile_result = subprocess.run(
                    [config['command'], str(source_file)],
                    capture_output=True,
                    text=True,
                    cwd=temp_dir,
                    timeout=30
                )
                if compile_result.returncode != 0:
                    return Response({
                        'success': False,
                        'error_type': 'compilation_error',
                        'error_message': compile_result.stderr,
                        'execution_time': 0,
                        'memory_usage': 0
                    })
                executable_path = str(temp_path / "Main.class")
            else:
                executable_path = str(source_file)
            
            # Prepare execution command
            if language == 'java':
                exec_command = ['java', '-cp', temp_dir, 'Main']
            elif language == 'cpp':
                exec_command = [executable_path]
            else:
                exec_command = [config['command'], executable_path]
            
            # Execute with comprehensive monitoring
            start_time = time.time()
            process = None
            output = ""
            error_output = ""
            memory_usage = 0
            
            def kill_process():
                if process:
                    try:
                        process.kill()
                    except:
                        pass
            
            try:
                # Start process
                process = subprocess.Popen(
                    exec_command,
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    cwd=temp_dir
                )
                
                # Set up timeout
                timer = threading.Timer(actual_timeout, kill_process)
                timer.start()
                
                try:
                    # Send input and get output
                    stdout, stderr = process.communicate(input=input_data, timeout=actual_timeout)
                    output = stdout
                    error_output = stderr
                except subprocess.TimeoutExpired:
                    kill_process()
                    return Response({
                        'success': False,
                        'error_type': 'timeout_error',
                        'error_message': f'Execution timed out after {timeout} seconds',
                        'execution_time': actual_timeout,
                        'memory_usage': 0
                    })
                finally:
                    timer.cancel()
                
                execution_time = time.time() - start_time
                
                # Check for infinite loops and excessive resource usage
                if execution_time > timeout:
                    return Response({
                        'success': False,
                        'error_type': 'timeout_error',
                        'error_message': f'Execution took too long ({execution_time:.2f}s)',
                        'execution_time': execution_time,
                        'memory_usage': 0
                    })
                
                # Check return code
                if process.returncode != 0:
                    return Response({
                        'success': False,
                        'error_type': 'runtime_error',
                        'error_message': error_output or f'Process exited with code {process.returncode}',
                        'execution_time': execution_time,
                        'memory_usage': 0
                    })
                
                # Success
                return Response({
                    'success': True,
                    'output': output,
                    'error_output': error_output,
                    'execution_time': round(execution_time, 3),
                    'memory_usage': memory_usage
                })
                
            except Exception as e:
                kill_process()
                return Response({
                    'success': False,
                    'error_type': 'system_error',
                    'error_message': str(e),
                    'execution_time': 0,
                    'memory_usage': 0
                })
                
    except Exception as e:
        return Response({
            'success': False,
            'error_type': 'system_error',
            'error_message': str(e),
            'execution_time': 0,
            'memory_usage': 0
        })
