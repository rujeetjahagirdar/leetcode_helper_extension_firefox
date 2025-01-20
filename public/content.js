// Import browser polyfill for cross-browser compatibility
// import browser from "webextension-polyfill";
console.log("Content script loaded on", window.location.href);

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "extractData") {
        console.log("Message received in content script:", message);

        // Improvement: Check for null before accessing innerText to prevent errors
        const problemStatementElement = document.querySelector('.elfjS[data-track-load="description_content"]');
        const codeSnippetElement = document.querySelector('.view-lines.monaco-mouse-cursor-text');

        const problemStatement = problemStatementElement ? problemStatementElement.innerText : "Problem not found.";
        const codeSnippet = codeSnippetElement ? codeSnippetElement.innerText : "Code snippet not found.";

        sendResponse({ problemStatement, codeSnippet });
    }

    if (message.action === "updateData") {
        console.log("Output received in content.js....");

        let output = message.outputCode;

        // Improvement: Handle potential empty or undefined output
        if (!output) {
            console.error("Received empty output.");
            return;
        }



        // Clean up the output
        let outputJson = output.replace(/\n/g, "\\\\n");
        outputJson = JSON.parse(outputJson);


        // Improvement: Ensure no duplicate widget creation
        let widget = document.getElementById("output-widget");
        if (!widget) {
            widget = document.createElement("div");
            widget.id = "output-widget";
            widget.className = `
                fixed bottom-4 right-4 w-[600px] h-[300px] 
                bg-gray-100 text-black border border-gray-400 shadow-lg 
                z-50 rounded-lg overflow-hidden flex flex-col
            `;

            // Top strip for buttons
            const buttonStrip = document.createElement("div");
            buttonStrip.className = "flex justify-between items-center bg-cyan-400 p-2";
            buttonStrip.style.backgroundColor='#85caf2';

            // Copy button
            const copyButton = document.createElement("button");
            copyButton.innerText = "COPY";
            copyButton.className = `
                bg-green-500 text-black font-bold py-2 px-6 rounded 
                hover:bg-green-700 transition-all shadow-md
            `;
            copyButton.style.backgroundColor='#234520';
            copyButton.addEventListener("click", () => {
                navigator.clipboard.writeText(output).then(() => {
                    widget.remove();
                    alert("Code copied to clipboard!");
                }).catch((err) => {
                    console.error("Failed to copy text:", err);
                });
            });

            // Close button
            const closeButton = document.createElement("button");
            closeButton.innerText = "CLOSE";
            closeButton.className = `
                bg-red-500 text-black font-bold py-2 px-6 rounded 
                hover:bg-red-700 transition-all shadow-md
            `;
            closeButton.style.backgroundColor="#852e30";
            closeButton.addEventListener("click", () => widget.remove());

            // Append buttons to the strip
            buttonStrip.appendChild(copyButton);
            buttonStrip.appendChild(closeButton);


            const accordionContainer = document.createElement("div");
            accordionContainer.className = "p-4 flex-1 overflow-auto";

            const sections = [
                { title: "Original Output", content: output},
                { title: "outputJson Output", content: outputJson},
                { title: "Problem Intuition", content: outputJson.intuition},
                { title: "Algorithm", content: outputJson.algorithm},
                { title: "Code Solution", content: outputJson.code }
            ];

            sections.forEach((section, index) => {
                const accordionItem = document.createElement("div");
                accordionItem.className = "border border-gray-300 rounded mb-2";
                accordionItem.style.backgroundColor='#85caf2';


                const header = document.createElement("div");
                header.className = "bg-gray-300 px-4 py-2 cursor-pointer";
                header.innerHTML =`<span>${section.title}</span> <span id="icon-${index}" class="text-lg font-bold">+</span>`;
                header.onclick = () => {
                    contentBlock.classList.toggle("hidden");
                    const icon = document.getElementById(`icon-${index}`);
                    icon.innerText = contentBlock.classList.contains("hidden") ? "+" : "−";
                };

                const contentBlock = document.createElement("div");
                contentBlock.className = "hidden bg-gray-800 text-white p-4";
                contentBlock.style.backgroundColor = "#595756";
                contentBlock.style.color = "#ffffff";
                contentBlock.innerText = section.content;

                accordionItem.appendChild(header);
                accordionItem.appendChild(contentBlock);
                accordionContainer.appendChild(accordionItem);
            });


            widget.appendChild(buttonStrip);
            widget.appendChild(accordionContainer);
            document.body.appendChild(widget);
        } else {
            widget.innerHTML = ''; // Clear existing content
        }

    }
});
