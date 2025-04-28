# GitHub Code Viewer

A futuristic website that displays computer science projects from GitHub with file navigation panels and code viewing capabilities.

## Features

- Browse files from the GitHub repository
- Special section for CodeHS files
- View code with syntax highlighting
- Copy code to clipboard
- Download code files
- Toggle between light and dark theme
- Futuristic animations and UI
- Mobile responsive design

## Files Structure

- `index.html` - Main HTML file
- `styles.css` - CSS styles and animations
- `script.js` - Frontend JavaScript code
- `server.js` - Entry point for the server
- `server/` - Server-side code
  - `index.js` - Express server implementation

## Installation

1. Make sure you have Node.js installed (version 14 or higher)
2. Clone or download this repository
3. Open a terminal in the project directory
4. Install dependencies:

```bash
npm install
```

## Running the Website

Start the server with:

```bash
npm start
```

The website will be available at http://localhost:5000

## Customization

To display your own GitHub repository:

1. Open `server/index.js`
2. Find the GitHub API configuration section
3. Change the `REPO_OWNER` and `REPO_NAME` variables to your desired repository

## Credits

- Created by Sanvir
- Uses highlight.js for syntax highlighting
- Uses GitHub API to fetch repository data