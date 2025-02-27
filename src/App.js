import React, { useState } from "react";
import browser from "webextension-polyfill";
import './index.css';

const API_ENDPOINT = "http://localhost:5000/solve";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  // Load saved values from localStorage (decrypt API key if it exists)
  const [apiKey, setApiKey] = useState(
    localStorage.getItem("encryptedApiKey")
      ? atob(localStorage.getItem("encryptedApiKey"))
      : ""
  );
  const [selectedModel, setSelectedModel] = useState(
    localStorage.getItem("selectedModel") || ""
  );

  const clearAPI = () => {
    localStorage.removeItem("encryptedApiKey");
    localStorage.removeItem("selectedModel");
    setApiKey("");
    setSelectedModel("");
  };

  // Use async/await for clarity and better error handling
  const handleSolveClick = async (e) => {
    e.preventDefault();

    // Early validation: Ensure required fields are filled
    if (!apiKey.trim() || !selectedModel.trim()) {
      alert("Please enter an API key and select a model.");
      return;
    }

    setIsLoading(true);
    try {
      // Encrypt the API key (using base64 encoding as a dummy encryption)
      const encryptedApiKey = btoa(apiKey);
      // Store encrypted API key and model in browser storage for later use
      localStorage.setItem("encryptedApiKey", encryptedApiKey);
      localStorage.setItem("selectedModel", selectedModel);

      // Send message to extract data from the content script
      const response = await new Promise((resolve, reject) => {
        browser.runtime.sendMessage({ action: "extractData" }, (response) => {
          if (browser.runtime.lastError) {
            return reject(browser.runtime.lastError);
          }
          resolve(response);
        });
      });

      console.log("Data Extracted", response);

      // Merge data with our encrypted API key and selected model
      const payload = { ...response, apiKey: encryptedApiKey, model: selectedModel };

      // Call the backend API
      const apiResponse = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseAPI = await apiResponse.json();
      console.log("API response in app.js:", responseAPI.outputCode);

      // Forward the output to content script
      browser.runtime.sendMessage({ action: "updateData", outputCode: responseAPI.outputCode }, (res) => {
        console.log("Updating Data....", res);
      });
    } catch (error) {
      console.error("Error during solve operation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-w-[300px] max-w-[500px] p-6 bg-gray-100 border border-gray-300 rounded-lg shadow-lg text-center">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Leetcode Helper</h1>
      {/* Use a form to leverage native validation */}
      <form onSubmit={handleSolveClick} className="mb-4">
        <div>
          <label htmlFor="apiKey" className="block text-gray-700 mb-1">
            HuggingFace API Key:
          </label>
          <input
            id="apiKey"
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter HF API Key"
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mt-2">
          <label htmlFor="modelSelect" className="block text-gray-700 mb-1">
            Model:
          </label>
          <select
            id="modelSelect"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Select a model</option>
            <option value="meta-llama/Llama-3.2-3B-Instruct">Llama-3.2-3B-Instruct</option>
            <option value="deepseek-ai/DeepSeek-Coder-V2-Instruct">DeepSeek-Coder-V2-Instruct</option>
            <option value="Qwen/Qwen2.5-Coder-32B-Instruct">Qwen2.5-Coder-32B-Instruct</option>
          </select>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={clearAPI}
            className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-all ${
              isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-700"
            }`}
            disabled={isLoading}
          >
            Clear API Key
          </button>
        </div>
        <div className="mt-4">
          <button
            type="submit"
            className={`w-full py-3 px-6 rounded-lg text-white font-medium transition-all ${
              isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Help Me!!!"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
