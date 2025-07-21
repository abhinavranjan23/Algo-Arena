import sys
import subprocess
import io
import json

def execute_python_code(code, args=[]):
    try:
        sys.argv = ['script.py'] + args  # Simulate CLI args

        old_stdout = sys.stdout
        old_stderr = sys.stderr
        sys.stdout = io.StringIO()
        sys.stderr = io.StringIO()

        # Key fix:
        exec(code, {'__name__': '__main__'})

        output = sys.stdout.getvalue()
        errors = sys.stderr.getvalue()

    except Exception as e:
        output = ''
        errors = str(e)

    finally:
        sys.stdout = old_stdout
        sys.stderr = old_stderr

    return {'output': output.strip(), 'errors': errors.strip()}



def execute_javascript_code(code, args=[]):
    try:
        # Inject code and call the function with arguments
        # args is a list like [[2, 7, 11, 15], 9]
        # We pass this directly as ...args to the function
        args_js = json.dumps(args)  # Safe conversion to JS array

        full_code = f"""
            const fn = {code};
            const args = {args_js};
            const result = fn(...args);
            console.log(JSON.stringify(result));
        """

        process = subprocess.Popen(
            ['node', '-e', full_code],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        output, errors = process.communicate()
        return {'output': output.decode().strip(), 'errors': errors.decode().strip()}
    except Exception as e:
        return {'output': '', 'errors': str(e)}



def execute_java_code(code, args=[]):
    try:
        with open('Main.java', 'w') as f:
            f.write(code)

        compile_process = subprocess.Popen(['javac', 'Main.java'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        _, compile_errors = compile_process.communicate()

        if compile_errors:
            return {'output': '', 'errors': compile_errors.decode()}

        cmd = ['java', 'Main'] + list(map(str, args))
        execute_process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output, errors = execute_process.communicate()

        return {'output': output.decode(), 'errors': errors.decode()}
    except Exception as e:
        return {'output': '', 'errors': str(e)}


def execute_c_code(code, args=[]):
    try:
        with open('temp.c', 'w') as f:
            f.write(code)

        compile_process = subprocess.Popen(['gcc', 'temp.c', '-o', 'temp.out'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        _, compile_errors = compile_process.communicate()

        if compile_errors:
            return {'output': '', 'errors': compile_errors.decode()}

        cmd = ['./temp.out'] + list(map(str, args))  # Ensure all args are strings
        execute_process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output, errors = execute_process.communicate()

        return {'output': output.decode(), 'errors': errors.decode()}
    except Exception as e:
        return {'output': '', 'errors': str(e)}


# AWS Lambda handler
def handler(event, context):
    language = event.get('language', 'python')
    code = event.get('code', '')
    args = event.get('args', [])

    if not code:
        return {'statusCode': 400, 'body': 'No code provided'}
    if not language:
        return {'statusCode': 400, 'body': 'No language provided'}
    if language not in ['python', 'javascript', 'java', 'c']:
        return {'statusCode': 400, 'body': 'Unsupported language'}

    if language == 'python':
        result = execute_python_code(code, args)
    elif language == 'javascript':
        result = execute_javascript_code(code, args)
    elif language == 'java':
        result = execute_java_code(code, args)
    elif language == 'c':
        result = execute_c_code(code, args)

    return {'statusCode': 200, 'body': result}
