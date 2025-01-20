import os
from dotenv import load_dotenv
import json
import re

from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI


app = Flask(__name__)
CORS(app)
load_dotenv()

def call_llm(problem_statement, code_snippet):

    prompt = """Following problem, use the given code snippet to write most efficient but simple to understand code considering all the edge cases.
Give me output in three sections as follows:
1.Intuition
Give simple to understand intuition of how to solve the problem.
2.Step by step algorithm
Give a step by step algorithm. Make sure to number each step and output is in one continuous string.
3.Code Solution
Give code for above step by step algorithm and output it in one continuous string enclosed in double quotes. 
Also make sure at the bottom of the code solution provide two comment lines describing complexities as follows:
#Runtime Complexity: [mention run-time complexity here]
#Space Complexity: [mention space complexity here].
Also make sure to use tab instead of spaces of code indentation.

ALSO make sure not to provide any additional comments or notes, such that I can directly copy code and execute that.
Give output in json form with keys \"intuition\", \"algorithm\", \"code\" enclosed in curly braces like {{\"intuition\":[content of intuition section here],\"algorithm\":[content of algorithm section here],\"code\":[content of code section here]}}.
Make sure that every section is properly formatted to be easy to read and also is in json parsable form.
Problem Statement:{}
Code Snippet: {}""".format(problem_statement, code_snippet)

    print("####Promt is:\n", prompt)
    ############# ChatGPT ###############
    # client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    # chat_response = client.chat.completions.create(
    #     model="gpt-4-turbo",
    #     messages=[
    #         {"role": "user", "content": prompt}
    #     ],
    #     temperature=0.5,
    #     top_p=1
    # )

    ################# Hugging face ################
    client = OpenAI(
        base_url="https://api-inference.huggingface.co/v1/",
        api_key=os.getenv("HF_API_KEY")
    )
    chat_response = client.chat.completions.create(
        model="meta-llama/Llama-3.2-3B-Instruct",
        messages=[
            {"role": "developer", "content": "You are an expert Software Developer."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.5,
        top_p=0.7
    )

    print("#########Chat Response:\n",chat_response.choices[0].message.content)

    return chat_response.choices[0].message.content
    # return res

@app.route('/')
def home():
    return {"message": "Hello, World!"}, 200

@app.route('/solve', methods=['POST'])
def solve():  # put application's code here
    request_data = request.get_json()
    #get problem statement form requet
    problemStatement = request_data.get("problemStatement")
    #get code snippet from request
    codeSnippet = request_data.get("codeSnippet")
    print("Problem Statement: ", problemStatement)
    print("Code Snippet: ", codeSnippet)
    #get prompt
    #call openai api
    #return code retunred by openai api

    output_code = call_llm(problemStatement, codeSnippet)


    return jsonify({"status":'Success', 'outputCode':output_code})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port='5000', debug=True)
