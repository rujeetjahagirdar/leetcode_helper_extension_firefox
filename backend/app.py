import os
from dotenv import load_dotenv
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import base64


app = Flask(__name__)
CORS(app)
load_dotenv()

def call_llm(problem_statement, code_snippet, api, model):

#     prompt = """Following problem, use the given code snippet to write most efficient but simple to understand code considering all the edge cases.
# Give me output in three sections as follows:
# 1.Intuition
# Give simple to understand intuition of how to solve the problem.
# 2.Step by step algorithm
# Give a step by step algorithm. Make sure to number each step and output is in one continuous string.
# 3.Code Solution
# Give code for above step by step algorithm.
# Also make sure at the bottom of the code solution provide two comment lines describing complexities as follows:
# #Runtime Complexity: [mention run-time complexity here]
# #Space Complexity: [mention space complexity here].
#
# Ensure to follow following instructions exactly:
# -Make sure not to provide any additional comments or notes.
# -Make sure that entire output is in json parsable form.
# -Refer the following example for output format and make sure to follow exact this format:
#  {{\"intuition\": \"The idea is to sort the array in ascending order and then return it. However, we need to consider the constraint that |nums[i] - nums[j]| <= limit. We can achieve this by using a min-heap data structure to keep track of the smallest unsorted elements. The min-heap will store the indices of the elements in the array, along with the elements themselves. We will repeatedly pop the smallest element from the min-heap and swap it with the first unsorted element in the array. This process will continue until the entire array is sorted.\",\"algorithm\": \"1. Create a min-heap and push the indices and values of the array into the heap.2. Initialize an empty list to store the sorted array.3. While the heap is not empty, pop the smallest element from the heap and swap it with the first unsorted element in the array.4. Push the swapped element back into the heap.5. Repeat steps 3-4 until the heap is empty.6. Return the sorted array.\",\"code\": \"class Solution:\n    def lexicographicallySmallestArray(self, nums: List[int], limit: int) -> List[int]:\n        import heapq\n        heap = [(nums[i], i) for i in range(len(nums))]\n        heapq.heapify(heap)\n        result = []\n        while heap:\n            val, idx = heapq.heappop(heap)\n            result.append(val)\n            for i in range(len(nums)):\n                if nums[i] < val and abs(nums[i] - val) <= limit:\n                    heapq.heappush(heap, (nums[i], i))\n        return result\n#Runtime Complexity: O(n log n)\n#Space Complexity: O(n)\"}}
# -The json should be in one line only.
#
# Problem Statement:{}
# Code Snippet: {}""".format(problem_statement, code_snippet)

    prompt = """Given the following problem statement and code snippet, generate an efficient yet easy-to-understand solution that covers all edge cases. Your response must be a single-line JSON object with the following keys:
    
    - "intuition": Provide a simple, clear explanation of the approach.
    - "algorithm": Provide a step-by-step algorithm, numbering each step in one continuous string.
    - "code": Provide the code solution implementing the algorithm. At the end of the code, include exactly two comment lines specifying the complexities in the format:
    #Runtime Complexity: [complexity]
    #Space Complexity: [complexity]
    
    Requirements:
    - Do not include any extra commentary or notes.
    - The entire output must be valid JSON in one line.
    - Follow the exact JSON format as shown in the example below:
    
    {{"intuition": "Your explanation here", "algorithm": "1. Step one. 2. Step two. ...", "code": "Code here\\n    ...\\n#Runtime Complexity: O(n log n)\\n#Space Complexity: O(n)"}}
    -Refer the following example for json output format and make sure to follow exact this json output format:
    {{"intuition": "The idea is to sort the array in ascending order and then return it. However, we need to consider the constraint that |nums[i] - nums[j]| <= limit. We can achieve this by using a min-heap data structure to keep track of the smallest unsorted elements. The min-heap will store the indices of the elements in the array, along with the elements themselves. We will repeatedly pop the smallest element from the min-heap and swap it with the first unsorted element in the array. This process will continue until the entire array is sorted.","algorithm": "1. Create a min-heap and push the indices and values of the array into the heap.2. Initialize an empty list to store the sorted array.3. While the heap is not empty, pop the smallest element from the heap and swap it with the first unsorted element in the array.4. Push the swapped element back into the heap.5. Repeat steps 3-4 until the heap is empty.6. Return the sorted array.","code": "class Solution:\n    def lexicographicallySmallestArray(self, nums: List[int], limit: int) -> List[int]:\n        import heapq\n        heap = [(nums[i], i) for i in range(len(nums))]\n        heapq.heapify(heap)\n        result = []\n        while heap:\n            val, idx = heapq.heappop(heap)\n            result.append(val)\n            for i in range(len(nums)):\n                if nums[i] < val and abs(nums[i] - val) <= limit:\n                    heapq.heappush(heap, (nums[i], i))\n        return result\n#Runtime Complexity: O(n log n)\n#Space Complexity: O(n)"}}
    -Make sure code is properly indented.
    Problem Statement: {}
    Code Snippet: {}""".format(problem_statement, code_snippet)


    # print("####Promt is:\n", prompt)
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
        # api_key=os.getenv("HF_API_KEY")
        api_key=api
    )

    chat_response = client.chat.completions.create(
        # model="meta-llama/Llama-3.2-3B-Instruct",
        model=model,
        messages=[
            {"role": "system", "content": "You are an expert Software Developer. Follow the user’s instructions exactly without adding any extra commentary or deviating from the prompt"},
            {"role": "user", "content": prompt}
        ],
        temperature=0.0,
        top_p=0.7,
    )

    # print("#########Chat Response:\n",chat_response.choices[0].message.content)
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
    enc_api_key = request_data.get("apiKey")
    print("enc_api_key",enc_api_key)
    txt_api_key = base64.b64decode(enc_api_key).decode('utf-8')
    modelSelection = request_data.get("model")
    # print("Problem Statement: ", problemStatement)
    # print("Code Snippet: ", codeSnippet)
    print("Plain text api = ", txt_api_key)
    print("Model Selection= ", modelSelection)
    #get prompt
    #call openai api
    #return code retunred by openai api

    output_code = call_llm(problemStatement, codeSnippet, txt_api_key, modelSelection)
    output_code_formatted = output_code.replace('\n', '\\n')
    print(output_code_formatted)
    response_json = json.loads(output_code_formatted)
    encoded_code = base64.b64encode(response_json['code'].encode("utf-8")).decode("utf-8")
    response_json['code']=encoded_code
    print(response_json)
    return jsonify({"status":'Success', 'outputCode':response_json})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port='5000', debug=True)
