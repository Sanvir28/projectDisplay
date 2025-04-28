document.addEventListener('DOMContentLoaded', function() {
  // Constants
  const GITHUB_API = '/api/github';
  const REPO_OWNER = 'Sanvir2028';
  const REPO_NAME = 'ComputerScience';
  
  // DOM Elements
  const sidePanel = document.getElementById('sidePanel');
  const mobileNavButton = document.getElementById('mobileNavButton');
  const closePanelButton = document.getElementById('closePanelButton');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const allFilesList = document.getElementById('allFilesList');
  const codeHSFilesList = document.getElementById('codeHSFilesList');
  const allFilesLoading = document.getElementById('allFilesLoading');
  const codeHSLoading = document.getElementById('codeHSLoading');
  const fileSearchInput = document.getElementById('fileSearch');
  const welcomeScreen = document.getElementById('welcomeScreen');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const codeContainer = document.getElementById('codeContainer');
  const codeDisplay = document.getElementById('codeDisplay');
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  const tryAgainButton = document.getElementById('tryAgainButton');
  const currentFilePath = document.getElementById('currentFilePath');
  const fileInfo = document.getElementById('fileInfo');
  const fileType = document.getElementById('fileType');
  const fileSize = document.getElementById('fileSize');
  const lineCount = document.getElementById('lineCount');
  const rawFileLink = document.getElementById('rawFileLink');
  const errorToast = document.getElementById('errorToast');
  const errorToastMessage = document.getElementById('errorToastMessage');
  const copyButton = document.getElementById('copyButton');
  const copyButtonFooter = document.getElementById('copyButtonFooter');
  const downloadButton = document.getElementById('downloadButton');
  const themeToggle = document.querySelector('.theme-toggle');
  const watchersCount = document.getElementById('watchersCount');
  const starsCount = document.getElementById('starsCount');
  const forksCount = document.getElementById('forksCount');

  // State
  let allFiles = [];
  let codeHSFiles = [];
  let filteredFiles = [];
  let selectedFile = null;
  let fileContent = null;
  let repoInfo = null;
  let isDarkTheme = true; // Default to dark theme

  // Initialize
  init();

  // Functions
  function init() {
    // Add event listeners
    mobileNavButton.addEventListener('click', toggleSidePanel);
    closePanelButton.addEventListener('click', closeSidePanel);
    mobileOverlay.addEventListener('click', closeSidePanel);
    fileSearchInput.addEventListener('input', handleFileSearch);
    tryAgainButton.addEventListener('click', handleTryAgain);
    copyButton.addEventListener('click', copyCode);
    copyButtonFooter.addEventListener('click', copyCode);
    downloadButton.addEventListener('click', downloadCode);
    themeToggle.addEventListener('click', toggleTheme);

    // Load saved theme
    loadTheme();
    
    // Load repository data
    fetchRepoInfo();
    fetchFiles();
  }
  
  // Theme switching functions
  function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    applyTheme();
    // Save theme preference to localStorage
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
  }
  
  function loadTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      isDarkTheme = savedTheme === 'dark';
      applyTheme();
    }
  }
  
  function applyTheme() {
    if (isDarkTheme) {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      // Update theme toggle icon
      themeToggle.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      `;
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      // Update theme toggle icon
      themeToggle.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      `;
    }
    
    // If syntax highlighting is active, update theme
    updateSyntaxHighlightingTheme();
  }
  
  function updateSyntaxHighlightingTheme() {
    // Remove existing theme stylesheet
    const existingThemeLink = document.querySelector('link[href*="highlight.js"]');
    if (existingThemeLink) {
      existingThemeLink.remove();
    }
    
    // Add new theme stylesheet
    const theme = isDarkTheme ? 'atom-one-dark' : 'atom-one-light';
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://cdn.jsdelivr.net/npm/highlight.js@11.7.0/styles/${theme}.min.css`;
    document.head.appendChild(link);
    
    // Re-highlight code if needed
    if (selectedFile && fileContent && window.hljs) {
      window.hljs.highlightElement(codeDisplay);
    }
  }

  function toggleSidePanel() {
    sidePanel.classList.toggle('open');
    document.body.classList.toggle('overflow-hidden');
    mobileOverlay.style.display = sidePanel.classList.contains('open') ? 'block' : 'none';
  }

  function closeSidePanel() {
    sidePanel.classList.remove('open');
    document.body.classList.remove('overflow-hidden');
    mobileOverlay.style.display = 'none';
  }

  async function fetchRepoInfo() {
    try {
      const response = await fetch(`${GITHUB_API}/repo`);
      if (!response.ok) {
        throw new Error(`Failed to fetch repository info: ${response.status}`);
      }
      
      repoInfo = await response.json();
      updateRepoInfo();
    } catch (error) {
      showErrorToast(error.message);
      console.error('Error fetching repo info:', error);
    }
  }

  function updateRepoInfo() {
    if (repoInfo) {
      watchersCount.textContent = repoInfo.watchers_count || 0;
      starsCount.textContent = repoInfo.stargazers_count || 0;
      forksCount.textContent = repoInfo.forks_count || 0;
    }
  }

  async function fetchFiles() {
    allFilesLoading.style.display = 'flex';
    codeHSLoading.style.display = 'flex';
    allFilesList.innerHTML = '';
    codeHSFilesList.innerHTML = '';

    try {
      const response = await fetch(`${GITHUB_API}/files`);
      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.status}`);
      }
      
      allFiles = await response.json();
      
      // Filter codeHS files
      codeHSFiles = allFiles.filter(file => 
        file.path.toLowerCase().includes('codehs')
      );
      
      // Update UI
      renderAllFiles();
      renderCodeHSFiles();
    } catch (error) {
      showErrorToast(error.message);
      console.error('Error fetching files:', error);
    } finally {
      allFilesLoading.style.display = 'none';
      codeHSLoading.style.display = 'none';
    }
  }

  function renderAllFiles() {
    allFilesList.innerHTML = '';
    
    filteredFiles = allFiles.filter(file => 
      file.path.toLowerCase().includes(fileSearchInput.value.toLowerCase())
    );
    
    if (filteredFiles.length === 0) {
      const noFilesItem = document.createElement('li');
      noFilesItem.className = 'py-2 px-2 text-text-secondary';
      noFilesItem.textContent = 'No files found';
      allFilesList.appendChild(noFilesItem);
      return;
    }
    
    filteredFiles.forEach(file => {
      const fileItem = createFileItem(file);
      allFilesList.appendChild(fileItem);
    });
  }

  function renderCodeHSFiles() {
    codeHSFilesList.innerHTML = '';
    
    if (codeHSFiles.length === 0) {
      const noFilesItem = document.createElement('li');
      noFilesItem.className = 'py-2 px-2 text-text-secondary';
      noFilesItem.textContent = 'No CodeHS files found';
      codeHSFilesList.appendChild(noFilesItem);
      return;
    }
    
    codeHSFiles.forEach(file => {
      const fileItem = createFileItem(file);
      codeHSFilesList.appendChild(fileItem);
    });
  }

  function createFileItem(file) {
    const fileItem = document.createElement('li');
    fileItem.className = `file-item ${selectedFile && selectedFile.path === file.path ? 'selected' : ''}`;
    fileItem.dataset.path = file.path;
    fileItem.dataset.name = file.name;
    fileItem.dataset.downloadUrl = file.download_url;
    fileItem.dataset.size = file.size;
    fileItem.dataset.type = file.type;
    
    // Get file extension for color
    const fileType = getFileExtension(file.path);
    let iconColorClass = '';
    
    switch (fileType) {
      case 'java':
        iconColorClass = 'file-java';
        break;
      case 'py':
        iconColorClass = 'file-py';
        break;
      case 'js':
        iconColorClass = 'file-js';
        break;
      case 'html':
        iconColorClass = 'file-html';
        break;
      case 'css':
        iconColorClass = 'file-css';
        break;
      case 'json':
        iconColorClass = 'file-json';
        break;
      case 'md':
      case 'txt':
        iconColorClass = 'file-md';
        break;
      default:
        iconColorClass = '';
    }
    
    // Add codehs class if it's a codehs file
    if (file.path.toLowerCase().includes('codehs')) {
      iconColorClass = 'file-codehs';
    }
    
    fileItem.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="file-icon ${iconColorClass}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span>${file.name}</span>
    `;
    
    fileItem.addEventListener('click', () => selectFile(file));
    
    return fileItem;
  }

  function handleFileSearch() {
    renderAllFiles();
  }

  async function selectFile(file) {
    // Update selected file
    selectedFile = file;
    
    // Update UI
    updateSelectedFileUI();
    
    // Close mobile panel
    if (window.innerWidth < 1024) {
      closeSidePanel();
    }
    
    // Hide welcome screen
    welcomeScreen.style.display = 'none';
    
    // Show loading indicator
    loadingIndicator.style.display = 'flex';
    codeContainer.style.display = 'none';
    errorMessage.style.display = 'none';
    
    // Update file info
    currentFilePath.textContent = file.path;
    fileType.textContent = getFileExtension(file.path).toUpperCase();
    fileSize.textContent = formatBytes(file.size);
    rawFileLink.href = file.download_url;
    fileInfo.style.display = 'flex';
    
    try {
      // Fetch file content
      const content = await fetchFileContent(file.path);
      fileContent = content;
      
      // Update line count
      lineCount.textContent = `${content.split('\n').length} lines`;
      
      // Display code
      codeDisplay.textContent = content;
      codeDisplay.className = `language-${getFileExtension(file.path)}`;
      
      // Apply syntax highlighting
      if (window.hljs) {
        window.hljs.highlightElement(codeDisplay);
      }
      
      // Show code container with animation
      codeContainer.style.display = 'block';
      codeContainer.style.animation = 'slideIn 0.3s ease-out forwards';
      
      // Reset animation after it completes
      codeContainer.addEventListener('animationend', function resetAnimation() {
        codeContainer.style.animation = '';
        codeContainer.removeEventListener('animationend', resetAnimation);
      });
    } catch (error) {
      // Show error message
      errorText.textContent = error.message;
      errorMessage.style.display = 'flex';
    } finally {
      // Hide loading indicator
      loadingIndicator.style.display = 'none';
    }
  }

  function updateSelectedFileUI() {
    // Update file items
    document.querySelectorAll('.file-item').forEach(item => {
      if (selectedFile && item.dataset.path === selectedFile.path) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
  }

  async function fetchFileContent(path) {
    try {
      const response = await fetch(`${GITHUB_API}/content?path=${encodeURIComponent(path)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load file content');
      }
      
      return await response.text();
    } catch (error) {
      throw error;
    }
  }

  function handleTryAgain() {
    if (selectedFile) {
      selectFile(selectedFile);
    }
  }

  function copyCode() {
    if (fileContent) {
      navigator.clipboard.writeText(fileContent)
        .then(() => {
          showCopiedMessage();
        })
        .catch(err => {
          console.error('Failed to copy text:', err);
        });
    }
  }

  function showCopiedMessage() {
    const copiedToast = document.createElement('div');
    copiedToast.className = 'copied-toast';
    copiedToast.textContent = 'Copied to clipboard!';
    copiedToast.style.position = 'fixed';
    copiedToast.style.bottom = '1rem';
    copiedToast.style.left = '50%';
    copiedToast.style.transform = 'translateX(-50%)';
    copiedToast.style.backgroundColor = 'var(--space-light)';
    copiedToast.style.color = 'var(--text-primary)';
    copiedToast.style.padding = '0.5rem 1rem';
    copiedToast.style.borderRadius = '0.375rem';
    copiedToast.style.zIndex = '100';
    document.body.appendChild(copiedToast);
    
    setTimeout(() => {
      copiedToast.style.opacity = '0';
      copiedToast.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => {
        document.body.removeChild(copiedToast);
      }, 300);
    }, 1500);
  }

  function downloadCode() {
    if (selectedFile && fileContent) {
      const blob = new Blob([fileContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  function showErrorToast(message) {
    errorToastMessage.textContent = message;
    errorToast.style.display = 'block';
    
    setTimeout(() => {
      errorToast.style.opacity = '0';
      errorToast.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => {
        errorToast.style.display = 'none';
        errorToast.style.opacity = '1';
      }, 300);
    }, 3000);
  }

  // Utility functions
  function getFileExtension(filePath) {
    return filePath.split('.').pop()?.toLowerCase() || '';
  }

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // Add decorative circuit lines
  function addCircuitLines() {
    const circuitLines = [
      { top: '10%', left: '0', width: '30%' },
      { top: '30%', right: '0', width: '20%' },
      { bottom: '15%', left: '10%', width: '40%' }
    ];
    
    circuitLines.forEach(line => {
      const circuitLine = document.createElement('div');
      circuitLine.className = 'circuit-line';
      if (line.top) circuitLine.style.top = line.top;
      if (line.bottom) circuitLine.style.bottom = line.bottom;
      if (line.left) circuitLine.style.left = line.left;
      if (line.right) circuitLine.style.right = line.right;
      circuitLine.style.width = line.width;
      document.querySelector('.app-container').appendChild(circuitLine);
    });
  }
  
  // Add circuit lines
  addCircuitLines();
});