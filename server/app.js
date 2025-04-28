const express = require('express');
const http = require('http');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const server = http.createServer(app);

// GitHub API configuration
const GITHUB_API_BASE = "https://api.github.com";
const REPO_OWNER = "Sanvir2028";
const REPO_NAME = "ComputerScience";

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// API Routes
// Get repository information
app.get("/api/github/repo", async (req, res) => {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({
        message: errorData.message || "Failed to fetch repository data"
      });
    }
    
    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("Error fetching repo data:", error);
    return res.status(500).json({
      message: "An error occurred while fetching repository data"
    });
  }
});

// Get repository contents (files)
app.get("/api/github/files", async (req, res) => {
  try {
    // Recursively fetch all files in the repo
    const response = await fetch(`${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/main?recursive=1`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({
        message: errorData.message || "Failed to fetch repository files"
      });
    }
    
    const data = await response.json();
    
    // Filter for blob (file) type items
    const files = await Promise.all(
      data.tree
        .filter(item => item.type === "blob")
        .map(async file => {
          // Get detailed file info
          try {
            const fileResponse = await fetch(`${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${file.path}`);
            if (fileResponse.ok) {
              const fileData = await fileResponse.json();
              return {
                ...fileData,
                // Extract file extension for syntax highlighting
                type: file.path.split('.').pop()?.toLowerCase() || 'txt'
              };
            }
            return null;
          } catch (error) {
            return null;
          }
        })
    );
    
    // Filter out nulls and send response
    return res.json(files.filter(Boolean));
  } catch (error) {
    console.error("Error fetching files:", error);
    return res.status(500).json({
      message: "An error occurred while fetching repository files"
    });
  }
});

// Get file content
app.get("/api/github/content", async (req, res) => {
  try {
    const { path } = req.query;
    
    if (!path) {
      return res.status(400).json({ message: "Path parameter is required" });
    }
    
    const response = await fetch(`${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({
        message: errorData.message || "Failed to fetch file content"
      });
    }
    
    const data = await response.json();
    
    // Content is Base64 encoded
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return res.send(content);
  } catch (error) {
    console.error("Error fetching file content:", error);
    return res.status(500).json({
      message: "An error occurred while fetching file content"
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!"
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };