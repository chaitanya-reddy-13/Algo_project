from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from problems.models import Problem, TestCase
from contests.models import Contest, ContestProblem
from django.utils import timezone

User = get_user_model()


class Command(BaseCommand):
    help = 'Load sample problems and test cases into the database'

    def handle(self, *args, **options):
        self.stdout.write('Loading sample data...')
        
        # Get or create admin user
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'role': 'Admin',
                'is_active': True,
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write('Created admin user')
        
        # Sample problems data
        problems_data = [
            {
                'title': 'Two Sum',
                'description': '''Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]

Example 3:
Input: nums = [3,3], target = 6
Output: [0,1]''',
                'constraints': '''2 <= nums.length <= 104
-109 <= nums[i] <= 109
-109 <= target <= 109
Only one valid answer exists.''',
                'difficulty': 'Easy',
                'tags': ['Array', 'Hash Table'],
                'starter_code': '''def twoSum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    pass''',
                'test_cases': [
                    {
                        'input_data': '[2,7,11,15]\n9',
                        'expected_output': '[0,1]',
                        'is_hidden': False
                    },
                    {
                        'input_data': '[3,2,4]\n6',
                        'expected_output': '[1,2]',
                        'is_hidden': False
                    },
                    {
                        'input_data': '[3,3]\n6',
                        'expected_output': '[0,1]',
                        'is_hidden': False
                    },
                    {
                        'input_data': '[1,5,8,10,13]\n18',
                        'expected_output': '[2,4]',
                        'is_hidden': True
                    }
                ]
            },
            {
                'title': 'Palindrome Number',
                'description': '''Given an integer x, return true if x is a palindrome, and false otherwise.

A number is a palindrome when it reads the same backward as forward.

Example 1:
Input: x = 121
Output: true
Explanation: 121 reads as 121 from left to right and from right to left.

Example 2:
Input: x = -121
Output: false
Explanation: From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.

Example 3:
Input: x = 10
Output: false
Explanation: Reads 01 from right to left. Therefore it is not a palindrome.''',
                'constraints': '''-231 <= x <= 231 - 1''',
                'difficulty': 'Easy',
                'tags': ['Math'],
                'starter_code': '''def isPalindrome(x):
    """
    :type x: int
    :rtype: bool
    """
    pass''',
                'test_cases': [
                    {
                        'input_data': '121',
                        'expected_output': 'True',
                        'is_hidden': False
                    },
                    {
                        'input_data': '-121',
                        'expected_output': 'False',
                        'is_hidden': False
                    },
                    {
                        'input_data': '10',
                        'expected_output': 'False',
                        'is_hidden': False
                    },
                    {
                        'input_data': '12321',
                        'expected_output': 'True',
                        'is_hidden': True
                    }
                ]
            },
            {
                'title': 'Valid Parentheses',
                'description': '''Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

Example 1:
Input: s = "()"
Output: true

Example 2:
Input: s = "()[]{}"
Output: true

Example 3:
Input: s = "(]"
Output: false''',
                'constraints': '''1 <= s.length <= 104
s consists of parentheses only '()[]{}' ''',
                'difficulty': 'Easy',
                'tags': ['String', 'Stack'],
                'starter_code': '''def isValid(s):
    """
    :type s: str
    :rtype: bool
    """
    pass''',
                'test_cases': [
                    {
                        'input_data': '"()"',
                        'expected_output': 'True',
                        'is_hidden': False
                    },
                    {
                        'input_data': '"()[]{}"',
                        'expected_output': 'True',
                        'is_hidden': False
                    },
                    {
                        'input_data': '"(]"',
                        'expected_output': 'False',
                        'is_hidden': False
                    },
                    {
                        'input_data': '"([{}])"',
                        'expected_output': 'True',
                        'is_hidden': True
                    }
                ]
            }
        ]
        
        # Create problems and test cases
        created_problems = []
        for problem_data in problems_data:
            problem, created = Problem.objects.get_or_create(
                title=problem_data['title'],
                defaults={
                    'description': problem_data['description'],
                    'constraints': problem_data['constraints'],
                    'difficulty': problem_data['difficulty'],
                    'tags': problem_data['tags'],
                    'starter_code': problem_data['starter_code'],
                    'created_by': admin_user,
                }
            )
            created_problems.append(problem)
            
            if created:
                self.stdout.write(f'Created problem: {problem.title}')
                
                # Create test cases
                for test_case_data in problem_data['test_cases']:
                    TestCase.objects.get_or_create(
                        problem=problem,
                        input_data=test_case_data['input_data'],
                        defaults={
                            'expected_output': test_case_data['expected_output'],
                            'is_hidden': test_case_data['is_hidden'],
                        }
                    )
        
        # Create or get contest
        contest, created = Contest.objects.get_or_create(
            title='TEST',
            defaults={
                'description': 'A test contest with sample problems',
                'start_time': timezone.now(),
                'end_time': timezone.now() + timezone.timedelta(hours=6),
                'is_active': True,
                'is_public': True,
                'allow_registration': True,
                'max_participants': 150,
                'created_by': admin_user,
            }
        )
        
        if created:
            self.stdout.write(f'Created contest: {contest.title}')
        
        # Add problems to contest
        for i, problem in enumerate(created_problems):
            ContestProblem.objects.get_or_create(
                contest=contest,
                problem=problem,
                defaults={
                    'order': i + 1,
                    'points': (i + 1) * 10,  # 10, 20, 30 points
                }
            )
        
        self.stdout.write(self.style.SUCCESS('Sample data loaded successfully!')) 