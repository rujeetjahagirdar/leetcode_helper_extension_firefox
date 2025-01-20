import React, { useState } from "react";
import "./Popup.css";
import browser from "webextension-polyfill"

function App() {
    const [isLoading, setIsLoading] = useState(false);
    const handleSolveClick = () => {
        console.log("Button CLicked!!!!!!");
        setIsLoading(true);
        browser.runtime.sendMessage({action: "extractData"}, (response) => {
            console.log("Data Extracted", response);

            fetch("http://localhost:5000/solve", {
            // fetch("https://leetcode-helper-extension-firefox.onrender.com/solve", {
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
        <div className="popup">
            <h1>Leetcode Helper</h1>
            <button onClick={handleSolveClick} className="solve_button" disabled={isLoading}>
                {isLoading ? "Processing..." : "Help Me!!!"}
            </button>
        </div>
    )
}

export default App;