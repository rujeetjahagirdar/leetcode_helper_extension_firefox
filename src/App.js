import React from "react";
import "./Popup.css";
import browser from "webextension-polyfill"

function App() {
    const handleSolveClick = () => {
        console.log("Button CLicked!!!!!!");
        browser.runtime.sendMessage({action: "extractData"}, (response) => {
            console.log("Data Extracted", response);

            fetch("http://localhost:5000/solve", {
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
            .catch(error => console.log("Error: ",error));
        });
    };
    return (
        <div className="popup">
            <h1>Leetcode Helper</h1>
            <button onClick={handleSolveClick} className="solve_button">Help Me!!!</button>
        </div>
    )
}

export default App;