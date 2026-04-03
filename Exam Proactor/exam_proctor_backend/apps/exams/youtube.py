import os
import sys
import re
import subprocess
import json
import google.generativeai as genai
from django.conf import settings
from decouple import config

# --- Gemini Configuration ---
GEMINI_API_KEY = config('GEMINI_API_KEY', default='')
genai.configure(api_key=GEMINI_API_KEY)

def extract_video_id(url):
    """
    Extracts the video ID from various YouTube URL formats.
    """
    patterns = [
        r'(?:v=|\/)([0-9A-Za-z_-]{11}).*',
        r'(?:be\/)([0-9A-Za-z_-]{11}).*',
        r'(?:embed\/)([0-9A-Za-z_-]{11}).*',
        r'(?:v\/)([0-9A-Za-z_-]{11}).*'
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def fetch_transcript(video_url):
    """
    Fetches transcript using yt-dlp as per user's robust logic.
    """
    video_id = extract_video_id(video_url)
    if not video_id:
        raise ValueError("Invalid YouTube URL")

    output_filename = f"{video_id}.en.vtt"
    
    try:
        # Call yt-dlp to download auto-generated subtitles
        subprocess.run(
            [
                sys.executable,
                "-m",
                "yt_dlp",
                "--write-auto-subs",
                "--sub-lang", "en",
                "--skip-download",
                "-o", video_id,
                video_url
            ],
            check=True,
            capture_output=True,
            text=True
        )
        
        # Read and parse VTT
        if os.path.exists(output_filename):
            with open(output_filename, 'r', encoding='utf-8') as f:
                vtt_content = f.read()
            
            # Simple parsing logic
            lines = vtt_content.splitlines()
            transcript_parts = []
            for line in lines:
                if '-->' in line or line.strip().isdigit() or 'WEBVTT' in line or not line.strip():
                    continue
                cleaned_line = re.sub(r'<[^>]+>', '', line)
                transcript_parts.append(cleaned_line.strip())
            
            # Remove duplicates while preserving order
            full_transcript = " ".join(dict.fromkeys(transcript_parts))
            
            # Cleanup
            os.remove(output_filename)
            return full_transcript
        else:
            raise FileNotFoundError(f"Transcript file {output_filename} not found.")

    except Exception as e:
        # Try to cleanup if any error occurred
        if os.path.exists(output_filename):
            os.remove(output_filename)
        raise e

def generate_exam_content(transcript, difficulty='Intermediate', count=5, include_coding=True):
    """
    Uses Gemini to generate MCQs and Coding problems from transcript.
    Returns a list of questions in the format expected by FacultyExamCreate.
    """
    if not GEMINI_API_KEY:
        raise ValueError("Google Gemini API Key is missing. Please add GEMINI_API_KEY to your .env file and restart the server.")

    # Using the suggested free-tier model from the user's preferred list
    MODEL_NAME = 'gemini-2.5-flash'
    try:
        model = genai.GenerativeModel(MODEL_NAME)
    except Exception:
        # Fallback to standard 1.5 flash if the specific version fails
        model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"""
    You are an expert academic professor specialized in software engineering and technical assessments.
    Based on the following transcript of an educational video, generate {count} high-quality exam questions.
    
    Difficulty: {difficulty}
    Include Coding Challenges: {'Yes' if include_coding else 'No'}
    
    Transcript Content:
    {transcript[:15000]} 

    ---
    INSTRUCTIONS:
    1. Generate a mix of Multiple Choice Questions (MCQs) and Coding Challenges.
    2. If coding challenges are included, generate at least 1-2 coding problems if the content is technical.
    3. Ensure all questions are directly derived from the concepts discussed in the transcript.
    4. Provide clear, concise descriptions.
    
    OUTPUT FORMAT (STRICT JSON):
    Return a JSON array of question objects. Each object MUST follow this structure:
    
    For MCQs:
    {{
        "id": "gen_mcq_unique_id",
        "type": "mcq",
        "text": "Question text here?",
        "points": 5,
        "options": [
            {{ "id": "opt1", "text": "Correct Option", "isCorrect": true }},
            {{ "id": "opt2", "text": "Wrong Option 1", "isCorrect": false }},
            {{ "id": "opt3", "text": "Wrong Option 2", "isCorrect": false }},
            {{ "id": "opt4", "text": "Wrong Option 3", "isCorrect": false }}
        ]
    }}
    
    For Coding Challenges:
    {{
        "id": "gen_coding_unique_id",
        "type": "coding",
        "text": "Detailed problem description. Implement a function that...",
        "points": 15,
        "language": "python",
        "starterCode": "def solution():\\n    # Write your code here\\n    pass",
        "solutionCode": "def solution():\\n    # Reference implementation\\n    return True",
        "testCases": [
            {{ "id": "tc1", "input": "input_val", "output": "expected_val", "isHidden": false }},
            {{ "id": "tc2", "input": "input_val2", "output": "expected_val2", "isHidden": true }}
        ]
    }}
    
    Ensure all JSON is valid and properly escaped. Do not include any text outside the JSON array.
    """
    
    try:
        response = model.generate_content(prompt)
        text = response.text
        
        # Robust JSON extraction
        json_match = re.search(r'\[\s*\{.*\}\s*\]', text, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
        else:
            # Fallback for code blocks
            if "```json" in text:
                json_str = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                json_str = text.split("```")[1].split("```")[0].strip()
            else:
                json_str = text
            
        questions = json.loads(json_str)
        
        # Post-processing to ensure IDs are valid for frontend if missing
        for i, q in enumerate(questions):
            if 'id' not in q or not q['id']:
                q['id'] = f"gen_{i}_{int(timezone.now().timestamp())}"
        
        return questions
    except Exception as e:
        print(f"Error generating/parsing Gemini response: {e}")
        import traceback
        print(traceback.format_exc())
        return []