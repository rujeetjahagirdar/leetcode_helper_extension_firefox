// Content script loaded on the current URL
console.log("Content script loaded on", window.location.href);

/**
 * Extracts problem statement and code snippet from the DOM.
 * Uses optional chaining to avoid errors if elements are not found.
 */
const extractData = () => {
  const problemStatement = document.querySelector('.elfjS[data-track-load="description_content"]')?.innerText || "Problem not found.";
  const codeSnippet = document.querySelector('.view-lines.monaco-mouse-cursor-text')?.innerText || "Code snippet not found.";
  return { problemStatement, codeSnippet };
};

/**
 * Creates and displays the output widget on the page.
 * @param {string} output - The raw output string.
 * @param {object} outputJson - The parsed JSON object containing details.
 */
const createWidget = (output, outputJson) => {
  // Create main widget container
  const widget = document.createElement("div");
  widget.id = "output-widget";
  widget.className = "fixed bottom-4 right-4 w-[600px] h-[300px] bg-gray-100 text-black border border-gray-400 shadow-lg z-50 rounded-lg overflow-hidden flex flex-col";

  // Create the top button strip
  const buttonStrip = document.createElement("div");
  buttonStrip.className = "flex justify-between items-center bg-blue-500 p-2";
  buttonStrip.style.backgroundColor = '#2b7fff';

  // Copy button
  const copyButton = document.createElement("button");
  copyButton.innerText = "COPY";
  copyButton.className = "bg-blue-500 text-black font-bold py-2 px-6 rounded hover:bg-green-700 transition-all shadow-md";
  copyButton.style.backgroundColor = '#1447e6';
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(outputJson.code);
      widget.remove();
      alert("Code copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  });

  // Close button
  const closeButton = document.createElement("button");
  closeButton.innerText = "CLOSE";
  closeButton.className = "bg-red-500 text-black font-bold py-2 px-6 rounded hover:bg-red-700 transition-all shadow-md";
  closeButton.style.backgroundColor = "#c10007";
  closeButton.addEventListener("click", () => widget.remove());

  // Append buttons to the strip
  buttonStrip.appendChild(copyButton);
  buttonStrip.appendChild(closeButton);

  // Create the accordion container for output sections
  const accordionContainer = document.createElement("div");
  accordionContainer.className = "p-4 flex-1 overflow-auto";

  // Define sections to display in the widget
  const sections = [
    // { title: "Original Output", content: output },
    // { title: "outputJson Output", content: outputJson},
    { title: "Problem Intuition", content: outputJson.intuition },
    { title: "Algorithm", content: outputJson.algorithm },
    { title: "Code Solution", content: outputJson.code }
  ];

  // Create each accordion item
  sections.forEach((section, index) => {
    const accordionItem = document.createElement("div");
    accordionItem.className = "border border-gray-300 rounded mb-2";
    accordionItem.style.backgroundColor = '#2b7fff';

    const header = document.createElement("div");
    header.className = "bg-gray-300 px-4 py-2 cursor-pointer";
    header.innerHTML = `<span>${section.title}</span> <span id="icon-${index}" class="text-lg font-bold">+</span>`;

    const contentBlock = document.createElement("div");
    contentBlock.className = "hidden bg-gray-800 text-white p-4";
    contentBlock.style.backgroundColor = "#595756";
    contentBlock.style.color = "#ffffff";
    contentBlock.innerText = section.content;

    // Toggle accordion visibility on header click
    header.addEventListener("click", () => {
      contentBlock.classList.toggle("hidden");
      const icon = document.getElementById(`icon-${index}`);
      icon.innerText = contentBlock.classList.contains("hidden") ? "+" : "−";
    });

    accordionItem.appendChild(header);
    accordionItem.appendChild(contentBlock);
    accordionContainer.appendChild(accordionItem);
  });

  // Assemble the widget and add it to the DOM
  widget.appendChild(buttonStrip);
  widget.appendChild(accordionContainer);
  document.body.appendChild(widget);
};

// Listen for messages from the extension's runtime
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extractData") {
    console.log("Message received in content script:", message);
    const data = extractData();
    sendResponse(data);
  } else if (message.action === "updateData") {
    console.log("UpdateData action received in content script.");

    const output = message.outputCode;
    if (!output) {
      console.error("Received empty output.");
      return;
    }

    // Clean and parse the output JSON
    let outputJsonStr = output.replace(/\n/g, "\\\\n");
    let outputJson;
    try {
      outputJson = JSON.parse(outputJsonStr);
    } catch (error) {
      console.error("Error parsing output JSON:", error);
      return;
    }

    // Remove any existing widget before creating a new one
    const existingWidget = document.getElementById("output-widget");
    if (existingWidget) {
      existingWidget.remove();
    }

    createWidget(output, outputJson);
  }
});
