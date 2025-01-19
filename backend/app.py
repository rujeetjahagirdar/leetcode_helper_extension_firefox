import os
from dotenv import load_dotenv

from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI


app = Flask(__name__)
CORS(app)
load_dotenv()

def call_llm(problem_statement, code_snippet):
    prompt = """For following coding problem, give me most efficient but simple to understand
              code considering all the edge cases. Also mention two lines in comment at bottom of the code
              with first line as run time complexity and second line with space complexity like 
              Runtime Complexity: 
              Space Complexity: . 
              ALSO make sure to
              not output any additional output or explanation so that I can directly execute the code output as it is.
              Problem:{}
              Code Snippet: {}.""".format(problem_statement, code_snippet)

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
            {"role": "user", "content": prompt}
        ],
        temperature=0.5,
        top_p=0.7
    )

    print("#########Chat Response:\n",chat_response.choices[0].message.content)
    return chat_response.choices[0].message.content

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

    # return jsonify({
    #     "status": 'Success',
    #     'outputCode': """```python
    #                     class Solution:
    #                         def twoSum(self, nums: List[int], target: int) -> List[int]:
    #                             num_to_index = {}
    #                             for i, num in enumerate(nums):
    #                                 complement = target - num
    #                                 if complement in num_to_index:
    #                                     return [num_to_index[complement], i]
    #                                 num_to_index[num] = i
    #
    #                     # Runtime Complexity: O(n)
    #                     # Space Complexity: O(n)
    # ```"""})
    output_code = call_llm(problemStatement, codeSnippet)
    return jsonify({"status":'Success', 'outputCode':output_code})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port='5000')
