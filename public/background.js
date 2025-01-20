// Import browser polyfill for cross-browser compatibility
// Improvement: Ensure compatibility with both Chrome and Firefox
// import browser from "webextension-polyfill";
console.log("Background script loaded.");

// Improvement: Use arrow function for better readability
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "extractData") {
        console.log("Message received in background:", message);
        console.log("Forwarding to content script...");

        // Improvement: Use Promises instead of callbacks for better readability
        browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
            browser.tabs.sendMessage(tabs[0].id, message)
                .then((response) => {
                    sendResponse(response);
                })
                .catch((error) => console.error("Error sending message:", error));
        });

        return true; // Required to use async sendResponse
    }

    if (message.action === "updateData") {
        console.log("Output received in background:", message);


        // Improvement: Use async/await for clarity
        (async () => {
            try {
                let tabs = await browser.tabs.query({ active: true, currentWindow: true });
                let response = await browser.tabs.sendMessage(tabs[0].id, message);
                sendResponse(response);
            } catch (error) {
                console.error("Error forwarding updateData:", error);
            }
        })();

        return true; // Required to use async sendResponse
    }

    return false; // Default response
});

// Improvement: Add a listener for when extension is installed or updated
browser.runtime.onInstalled.addListener((details) => {
    console.log("Extension installed or updated:", details.reason);
});
