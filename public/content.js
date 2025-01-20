// import browser from "webextension-polyfill";
console.log("Content script loaded on", window.location.href);

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if(message.action === "extractData") {
        const problemStatement = document.querySelector('.elfjS[data-track-load="description_content"]').innerText;
        const codeSnippet = document.querySelector('.view-lines.monaco-mouse-cursor-text').innerText;
        console.log("Message received in content script:", message);
        // console.log("Extracted Problem:",problemStatement);
        // console.log("Extracted Code:",codeSnippet);

        sendResponse({problemStatement, codeSnippet});
    }

    if (message.action === "updateData") {
        console.log("Output received in content.js....");
        let output = message.outputCode;
        // Function to remove the first and last line
        const removeFirstAndLastLine = (input) => {
            const lines = input.split("\n");
            return lines.slice(1, -1).join("\n");
        };

        // Clean up the output
        output = removeFirstAndLastLine(output);
        // Create a floating widget
        let widget = document.getElementById("output-widget");
        if (!widget) {
            widget = document.createElement("div");
            widget.id = "output-widget";
            widget.style.position = "fixed";
            widget.style.bottom = "10px";
            widget.style.right = "10px";
            widget.style.width = "500px";
            widget.style.height = "200px";
            widget.style.backgroundColor = "#f9f9f9"; // Light background
            widget.style.color = "#000"; // Black text for contrast
            widget.style.border = "1px solid #ccc";
            widget.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.2)";
            widget.style.zIndex = 1000;
            widget.style.padding = "10px";
            widget.style.overflowY = "auto";
            widget.style.fontFamily = "monospace"; // Monospace font for code
            widget.style.fontSize = "14px";

            // Add a Close button
            const closeButton = document.createElement("button");
            closeButton.innerText = "Close";
            closeButton.style.position = "absolute";
            closeButton.style.top = "5px";
            closeButton.style.right = "5px";
            closeButton.style.backgroundColor = "#f44336";
            closeButton.style.color = "white";
            closeButton.style.border = "none";
            closeButton.style.padding = "5px 10px";
            closeButton.style.cursor = "pointer";
            closeButton.style.borderRadius = "4px";
            closeButton.addEventListener("click", () => {
                widget.remove(); // Remove the widget from the DOM
            });

            // Add a Copy button
            const copyButton = document.createElement("button");
            copyButton.innerText = "Copy";
            copyButton.style.position = "absolute";
            copyButton.style.top = "5px";
            copyButton.style.right = "60px";
            copyButton.style.backgroundColor = "#4CAF50";
            copyButton.style.color = "white";
            copyButton.style.border = "none";
            copyButton.style.padding = "5px 10px";
            copyButton.style.cursor = "pointer";
            copyButton.style.borderRadius = "4px";
            copyButton.addEventListener("click", () => {
                navigator.clipboard.writeText(output).then(() => {
                    alert("Code copied to clipboard!");
                }).catch((err) => {
                    console.error("Failed to copy text:", err);
                });
            });

            // Append buttons to the widget
            widget.appendChild(closeButton);
            widget.appendChild(copyButton);

            // Add the widget to the DOM
            document.body.appendChild(widget);
        }

        // Display the output in the widget
        const content = document.createElement("pre");
        content.style.marginTop = "40px";
        content.style.whiteSpace = "pre-wrap"; // Handle long lines gracefully
        content.style.color = "#000"; // Ensure text is visible
        content.style.backgroundColor = "#f4f4f4"; // Light gray for code block
        content.style.padding = "10px";
        content.style.borderRadius = "4px";
        content.style.overflowX = "auto"; // Horizontal scrolling for long lines

        const codeBlock = document.createElement("code");
        codeBlock.style.fontFamily = "monospace";
        codeBlock.innerText = output;

        content.appendChild(codeBlock);
        widget.appendChild(content);
    }

});

