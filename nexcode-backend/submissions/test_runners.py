"""
Test runners for different problem types
"""

def create_test_script_for_problem(problem_title, code, language='python'):
    """Create appropriate test script based on problem type"""
    
    if "Merge Two Sorted Lists" in problem_title:
        return create_linked_list_test_script(code)
    elif "Two Sum" in problem_title:
        return create_two_sum_test_script(code)
    elif "Palindrome Number" in problem_title:
        return create_palindrome_test_script(code)
    elif "Valid Parentheses" in problem_title:
        return create_parentheses_test_script(code)
    elif "Maximum Subarray" in problem_title:
        return create_max_subarray_test_script(code)
    else:
        # Default test script
        return create_default_test_script(code)


def create_linked_list_test_script(code):
    """Create test script for linked list problems"""
    return f"""
# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

{code}

# Test the function
if __name__ == "__main__":
    import sys
    
    # Read input from stdin
    input_data = sys.stdin.read().strip()
    
    try:
        # Parse input (assuming format like "[1,2,4]\\n[1,3,4]")
        lines = input_data.split('\\n')
        if len(lines) >= 2:
            # Convert string representations to linked lists
            def list_to_linked_list(arr_str):
                if arr_str == '[]':
                    return None
                # Remove brackets and split by comma
                arr_str = arr_str.strip('[]')
                if not arr_str:
                    return None
                values = [int(x.strip()) for x in arr_str.split(',')]
                
                if not values:
                    return None
                
                head = ListNode(values[0])
                current = head
                for val in values[1:]:
                    current.next = ListNode(val)
                    current = current.next
                return head
            
            def linked_list_to_list(head):
                if not head:
                    return []
                result = []
                current = head
                while current:
                    result.append(current.val)
                    current = current.next
                return result
            
            list1 = list_to_linked_list(lines[0])
            list2 = list_to_linked_list(lines[1])
            
            # Call the user's function
            result = mergeTwoLists(list1, list2)
            
            # Convert result back to list format
            output_list = linked_list_to_list(result)
            print(str(output_list))
        else:
            print("Invalid input format")
            
    except Exception as e:
        print(f"Error: {{e}}")
"""


def create_two_sum_test_script(code):
    """Create test script for Two Sum problem"""
    return f"""
{code}

# Test the function
if __name__ == "__main__":
    import sys
    import ast
    
    # Read input from stdin
    input_data = sys.stdin.read().strip()
    
    try:
        # Parse input (assuming format like "[2,7,11,15]\\n9")
        lines = input_data.split('\\n')
        if len(lines) >= 2:
            nums = ast.literal_eval(lines[0])
            target = int(lines[1])
            
            # Call the user's function
            result = twoSum(nums, target)
            print(str(result))
        else:
            print("Invalid input format")
            
    except Exception as e:
        print(f"Error: {{e}}")
"""


def create_palindrome_test_script(code):
    """Create test script for Palindrome Number problem"""
    return f"""
{code}

# Test the function
if __name__ == "__main__":
    import sys
    
    # Read input from stdin
    input_data = sys.stdin.read().strip()
    
    try:
        x = int(input_data)
        
        # Call the user's function
        result = isPalindrome(x)
        print(str(result).lower())
        
    except Exception as e:
        print(f"Error: {{e}}")
"""


def create_parentheses_test_script(code):
    """Create test script for Valid Parentheses problem"""
    return f"""
{code}

# Test the function
if __name__ == "__main__":
    import sys
    
    # Read input from stdin
    input_data = sys.stdin.read().strip()
    
    try:
        # Remove quotes if present
        s = input_data.strip('"')
        
        # Call the user's function
        result = isValid(s)
        print(str(result).lower())
        
    except Exception as e:
        print(f"Error: {{e}}")
"""


def create_max_subarray_test_script(code):
    """Create test script for Maximum Subarray problem"""
    return f"""
{code}

# Test the function
if __name__ == "__main__":
    import sys
    import ast
    
    # Read input from stdin
    input_data = sys.stdin.read().strip()
    
    try:
        # Parse input as array
        nums = ast.literal_eval(input_data)
        
        # Call the user's function
        result = maxSubArray(nums)
        print(str(result))
        
    except Exception as e:
        print(f"Error: {{e}}")
"""


def create_default_test_script(code):
    """Create default test script for unknown problem types"""
    return f"""
{code}

# Test the function
if __name__ == "__main__":
    import sys
    
    # Read input from stdin
    input_data = sys.stdin.read().strip()
    
    try:
        # Just print the input for debugging
        print(f"Input received: {{input_data}}")
        print("No specific test logic implemented for this problem type")
        
    except Exception as e:
        print(f"Error: {{e}}")
""" 