import React, { useState } from "react";
import browser from "webextension-polyfill";
import './index.css';

function App() {
    const [isLoading, setIsLoading] = useState(false);
    const handleSolveClick = () => {
        console.log("Button CLicked!!!!!!");
        setIsLoading(true);
        browser.runtime.sendMessage({action: "extractData"}, (response) => {
            console.log("Data Extracted", response);

            // fetch("http://localhost:5000/solve", {
            fetch("https://leetcode-helper-extension-firefox.onrender.com/solve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response)
            })
                .then(response => response.json())
                .then(responseAPI => {
                    console.log("API response in app.js:", responseAPI.outputCode);
                    browser.runtime.sendMessage({action: "updateData", outputCode: responseAPI.outputCode}, (response) => {
                        console.log("Updating Data....");
                    });
                })
            .catch(error => console.log("Error: ",error))
            .finally(() => {
                    setIsLoading(false);
                });
        });
    };
    return (
        <div className="min-w-[300px] max-w-[500px] p-6 bg-gray-100 border border-gray-300 rounded-lg shadow-lg text-center">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Leetcode Helper</h1>
            <button
                onClick={handleSolveClick}
                className={`w-full py-3 px-6 rounded-lg text-white font-medium transition-all 
                    ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'}`}
                disabled={isLoading}
            >
                {isLoading ? "Processing..." : "Help Me!!!"}
            </button>
        </div>
    );
}

export default App;