import os
from typing import Tuple, Optional
from django.conf import settings


class AIService:
    def __init__(self):
        self.openai_api_key = getattr(settings, 'OPENAI_API_KEY', None)
        self.anthropic_api_key = getattr(settings, 'ANTHROPIC_API_KEY', None)
        self.google_ai_api_key = getattr(settings, 'GOOGLE_AI_API_KEY', None)
    
    def get_response(self, prompt: str) -> Tuple[str, int, str]:
        """
        Get response from AI service
        Returns: (response, tokens_used, model_used)
        """
        # Try OpenAI first
        if self.openai_api_key:
            try:
                return self._get_openai_response(prompt)
            except Exception as e:
                print(f"OpenAI error: {e}")
        
        # Try Anthropic
        if self.anthropic_api_key:
            try:
                return self._get_anthropic_response(prompt)
            except Exception as e:
                print(f"Anthropic error: {e}")
        
        # Try Google AI
        if self.google_ai_api_key:
            try:
                return self._get_google_ai_response(prompt)
            except Exception as e:
                print(f"Google AI error: {e}")
        
        # Fallback response
        return (
            "I'm sorry, but I'm currently unable to process your request. Please try again later.",
            0,
            "fallback"
        )
    
    def _get_google_ai_response(self, prompt: str) -> Tuple[str, int, str]:
        """Get response from Google AI"""
        try:
            import google.generativeai as genai
            
            genai.configure(api_key=self.google_ai_api_key)
            model = genai.GenerativeModel('gemini-2.5-flash')
            
            system_prompt = """You are a helpful programming assistant for an online judge platform. Your role is to guide users in solving coding problems without providing complete solutions.

IMPORTANT GUIDELINES:
1. NEVER provide complete working code solutions
2. Focus on explaining concepts, algorithms, and approaches
3. Give hints and guidance to help users think through the problem
4. Help debug code by pointing out potential issues and suggesting fixes
5. Explain time complexity and space complexity when relevant
6. Be encouraging and supportive while maintaining educational value
7. If asked for a complete solution, redirect to providing hints instead

When helping with code:
- Point out logical errors or edge cases
- Suggest algorithm improvements
- Explain why certain approaches might not work
- Guide users toward the right direction
- Ask clarifying questions to better understand their confusion

Remember: Your goal is to help users learn and improve their problem-solving skills, not to solve problems for them."""
            
            full_prompt = f"{system_prompt}\n\nUser query: {prompt}"
            
            response = model.generate_content(full_prompt)
            response_text = response.text
            
            # Estimate tokens (rough approximation)
            tokens_used = len(full_prompt.split()) + len(response_text.split())
            
            return response_text, tokens_used, "gemini-2.5-flash"
            
        except ImportError:
            raise Exception("Google AI library not installed")
        except Exception as e:
            raise Exception(f"Google AI API error: {str(e)}")
    
#     def _get_openai_response(self, prompt: str) -> Tuple[str, int, str]:
#         """Get response from OpenAI"""
#         try:
#             import openai
            
#             openai.api_key = self.openai_api_key
            
#             system_prompt = """You are a helpful programming assistant for an online judge platform. Your role is to guide users in solving coding problems without providing complete solutions.

# IMPORTANT GUIDELINES:
# 1. NEVER provide complete working code solutions
# 2. Focus on explaining concepts, algorithms, and approaches
# 3. Give hints and guidance to help users think through the problem
# 4. Help debug code by pointing out potential issues and suggesting fixes
# 5. Explain time complexity and space complexity when relevant
# 6. Be encouraging and supportive while maintaining educational value
# 7. If asked for a complete solution, redirect to providing hints instead

# When helping with code:
# - Point out logical errors or edge cases
# - Suggest algorithm improvements
# - Explain why certain approaches might not work
# - Guide users toward the right direction
# - Ask clarifying questions to better understand their confusion

# Remember: Your goal is to help users learn and improve their problem-solving skills, not to solve problems for them."""
            
#             response = openai.ChatCompletion.create(
#                 model="gpt-3.5-turbo",
#                 messages=[
#                     {"role": "system", "content": system_prompt},
#                     {"role": "user", "content": prompt}
#                 ],
#                 max_tokens=500,
#                 temperature=0.7
#             )
            
#             response_text = response.choices[0].message.content
#             tokens_used = response.usage.total_tokens
            
#             return response_text, tokens_used, "gpt-3.5-turbo"
            
#         except ImportError:
#             raise Exception("OpenAI library not installed")
#         except Exception as e:
#             raise Exception(f"OpenAI API error: {str(e)}")
    
#     def _get_anthropic_response(self, prompt: str) -> Tuple[str, int, str]:
#         """Get response from Anthropic"""
#         try:
#             import anthropic
            
#             client = anthropic.Anthropic(api_key=self.anthropic_api_key)
            
#             system_prompt = """You are a helpful programming assistant for an online judge platform. Your role is to guide users in solving coding problems without providing complete solutions.

# IMPORTANT GUIDELINES:
# 1. NEVER provide complete working code solutions
# 2. Focus on explaining concepts, algorithms, and approaches
# 3. Give hints and guidance to help users think through the problem
# 4. Help debug code by pointing out potential issues and suggesting fixes
# 5. Explain time complexity and space complexity when relevant
# 6. Be encouraging and supportive while maintaining educational value
# 7. If asked for a complete solution, redirect to providing hints instead

# When helping with code:
# - Point out logical errors or edge cases
# - Suggest algorithm improvements
# - Explain why certain approaches might not work
# - Guide users toward the right direction
# - Ask clarifying questions to better understand their confusion

# Remember: Your goal is to help users learn and improve their problem-solving skills, not to solve problems for them."""
            
#             response = client.messages.create(
#                 model="claude-3-sonnet-20240229",
#                 max_tokens=500,
#                 messages=[
#                     {"role": "user", "content": f"{system_prompt}\n\nUser query: {prompt}"}
#                 ]
#             )
            
#             response_text = response.content[0].text
#             tokens_used = response.usage.input_tokens + response.usage.output_tokens
            
#             return response_text, tokens_used, "claude-3-sonnet"
            
#         except ImportError:
#             raise Exception("Anthropic library not installed")
#         except Exception as e:
#             raise Exception(f"Anthropic API error: {str(e)}") 