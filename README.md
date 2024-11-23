# LeetCode Helper Browser Extension 🧩

## ✍️ Description

This project is a browser extension designed to assist users in solving LeetCode problems efficiently. It extracts problem statements and code from the LeetCode interface, sends them to an AI-powered backend, and provides suggested solutions.

## 🛠️ How to Install and Use

### 1️. Clone the Repository

Run the following command to clone the project repository:

```
git clone <repository_url>
```

### 2️. Navigate to the Project Directory

```
cd project_name
```

### 3️. Install Dependencies

For the backend:

```
pip install -r requirements.txt
```

### 4️. Create a `.env` File

In the `backend` directory, create 🆕 a file named `.env` and add ➕ your OpenAI API key:

```plaintext
OPENAI_API_KEY=<your_openai_api_key>
```

### 5️. Start the Backend Server

Run the following command to start the backend server:

```
python backend/app.py
```

### 6️. Install the Extension in Firefox

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.

2. Click **Load Temporary Add-on** ➕.

3. Select the `manifest.json` file located in the "build" directory.

### 7️. Use the Extension

1. Open a LeetCode problem page.
2. Click on the extension icon in the browser toolbar.
3. Click the "Help Me" button.

## 🖥️ Technologies Used

- **Frontend**: JavaScript, React.js, WebExtension API
- **Backend**: Python, Flask
- **AI Integration**: OpenAI API
- **Environment Management**: `.env` files

