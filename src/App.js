import React, { useState } from "react";
import browser from "webextension-polyfill";
import './index.css';

function App() {
    const [isLoading, setIsLoading] = useState(false);
    // New state for API key and model selection
    const [apiKey, setApiKey] = useState(localStorage.getItem("encryptedApiKey") ? atob(localStorage.getItem("encryptedApiKey")) : "");
    const [selectedModel, setSelectedModel] = useState(localStorage.getItem("selectedModel") ? localStorage.getItem("selectedModel") : "");

    const clearAPI = () => {
        localStorage.removeItem("encryptedApiKey");
        localStorage.removeItem("selectedModel");
        setApiKey("");
        setSelectedModel("");
    }

    const handleSolveClick = () => {
        console.log("Button CLicked!!!!!!");
        setIsLoading(true);


        // Encrypt the API key (using base64 encoding as a dummy encryption)
        const encryptedApiKey = btoa(apiKey);
        // Store encrypted API key and model in browser storage for later use
        localStorage.setItem("encryptedApiKey", encryptedApiKey);
        localStorage.setItem("selectedModel", selectedModel);

        browser.runtime.sendMessage({ action: "extractData" }, (response) => {
            console.log("Data Extracted", response);
            // Include encrypted API key and model in the payload
            const payload = { ...response, apiKey: encryptedApiKey, model: selectedModel };

            fetch("http://localhost:5000/solve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            .then(response => response.json())
            .then(responseAPI => {
                console.log("API response in app.js:", responseAPI.outputCode);
                browser.runtime.sendMessage({ action: "updateData", outputCode: responseAPI.outputCode }, (response) => {
                    console.log("Updating Data....");
                });
            })
            .catch(error => console.log("Error: ", error))
            .finally(() => {
                setIsLoading(false);
            });
        });
    };

    return (
        <div className="min-w-[300px] max-w-[500px] p-6 bg-gray-100 border border-gray-300 rounded-lg shadow-lg text-center">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Leetcode Helper</h1>
            {/* New form with API key input and model selection */}
            <div className="mb-4">
                <div>
                    <label htmlFor="apiKey" className="block text-gray-700 mb-1">API Key:</label>
                    <input
                        id="apiKey"
                        type="text"
                        value={apiKey}
                        required
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter API Key"
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div className="mt-2">
                    <label htmlFor="modelSelect" className="block text-gray-700 mb-1">Model:</label>
                    <select
                        id="modelSelect"
                        value={selectedModel}
                        required
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    >
                        {/* Dummy values for model selection */}
                        <option value="">Select a model</option>
                        <option value="meta-llama/Llama-3.2-3B-Instruct">Llama-3.2-3B-Instruct</option>
                        <option value="model2">Model 2</option>
                        <option value="model3">Model 3</option>
                    </select>
                </div>
            </div>
            <div>
                <div className="mb-4">
                    <button
                        onClick={clearAPI}
                        className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-all 
                    ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-700'}`}
                        disabled={isLoading}>
                        Clear API Key
                    </button>
                </div>
                <div>
                    <button
                        onClick={handleSolveClick}
                        className={`w-full py-3 px-6 rounded-lg text-white font-medium transition-all 
                    ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'}`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Processing..." : "Help Me!!!"}
                    </button>
                </div>

            </div>

        </div>
    );
}

export default App;
