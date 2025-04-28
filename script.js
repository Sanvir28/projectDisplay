const apiUrl = 'https://api.github.com/repos/Sanvir2028/ComputerScience/contents/';
const statusElement = document.getElementById('status');
const contentElement = document.getElementById('content');
const searchInput = document.getElementById('search-input');

let allFiles = []; // Store all files for searching

// Function to fetch and display files
async function fetchFiles() {
    try {
        statusElement.textContent = 'Fetching files...';  // Show fetching status

        const response = await fetch(apiUrl);
        const files = await response.json();

        if (Array.isArray(files)) {
            allFiles = files; // Store all files
            displayFiles(files); // Display all files initially
            statusElement.textContent = 'Files Fetched Successfully';  // Show styled status message
        } else {
            statusElement.textContent = 'Error fetching files';  // Show error message
        }
    } catch (error) {
        fileListElement.innerHTML = '';
        statusElement.textContent = 'Error fetching files';  // Show error message
    }
}

// Function to display files in the appropriate lists
function displayFiles(files) {
    const regularFilesElement = document.getElementById('regular-files');
    const codehsFilesElement = document.getElementById('codehs-files');
    
    // Clear both lists
    regularFilesElement.innerHTML = '';
    codehsFilesElement.innerHTML = '';
    
    if (files.length === 0) {
        statusElement.textContent = 'No matching files found.';
        return;
    }
    
    files.forEach(file => {
        const listItem = document.createElement('li');
        listItem.textContent = file.name;
        
        // Add a cyber-looking icon before the file name
        const fileIcon = document.createElement('span');
        fileIcon.textContent = '〔';
        fileIcon.style.color = '#00ff6a';
        fileIcon.style.marginRight = '8px';
        listItem.prepend(fileIcon);
        
        // Add a closing bracket after the file name
        const fileIconClose = document.createElement('span');
        fileIconClose.textContent = '〕';
        fileIconClose.style.color = '#00ff6a';
        fileIconClose.style.marginLeft = '8px';
        listItem.appendChild(fileIconClose);
        
        listItem.addEventListener('click', () => {
            // Highlight the selected file
            const allItems = document.querySelectorAll('li');
            allItems.forEach(item => item.classList.remove('selected'));
            listItem.classList.add('selected');
            
            fetchFileContent(file.path);  // Fetch content when clicked
        });
        
        // Determine which list to add the file to
        if (file.name.toLowerCase().includes('codehs')) {
            codehsFilesElement.appendChild(listItem);
        } else {
            regularFilesElement.appendChild(listItem);
        }
    });
}

// Function to fetch and display the content of a file
async function fetchFileContent(filePath) { // Add filePath parameter
    try {
        // Add loading animation class
        const fileContentSection = document.getElementById('file-content');
        fileContentSection.classList.add('loading');
        contentElement.textContent = 'Importing File From GitHub...';
        
        // Add slide-out animation
        fileContentSection.classList.add('slide-out');
        
        const response = await fetch(`https://api.github.com/repos/Sanvir2028/ComputerScience/contents/${filePath}`);
        const fileData = await response.json();

        if (fileData.content) {
            const decodedContent = atob(fileData.content);  // Decode the base64 content
            
            // Prepare for slide-in animation
            setTimeout(() => {
                // Remove slide-out and add slide-in
                fileContentSection.classList.remove('slide-out');
                fileContentSection.classList.add('slide-in');
                
                // Remove loading and add content-loaded class
                fileContentSection.classList.remove('loading');
                fileContentSection.classList.add('content-loaded');
                contentElement.textContent = ''; // Clear the content
                contentElement.style.opacity = '0';
                
                // Update the source code heading to show current file
                const contentHeading = document.querySelector('#file-content h2');
                contentHeading.textContent = 'Source: ' + filePath;
                
                // Set content and fade it in
                contentElement.textContent = decodedContent;
                
                // Extended fade-in animation with longer duration
                setTimeout(() => {
                    contentElement.style.transition = 'opacity 2.5s ease-in-out';
                    contentElement.style.opacity = '1';
                    
                    // Remove animation classes after animation completes
                    setTimeout(() => {
                        fileContentSection.classList.remove('content-loaded');
                        fileContentSection.classList.remove('slide-in');
                    }, 2500);
                }, 400);
            }, 300); // Slight delay for the slide effect
        } else {
            fileContentSection.classList.remove('loading');
            contentElement.textContent = 'Error fetching file content.';
        }
    } catch (error) {
        const fileContentSection = document.getElementById('file-content');
        fileContentSection.classList.remove('loading');
        contentElement.textContent = 'Error fetching file content.';
    }
}

// Search functionality
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    
    if (!searchTerm) {
        displayFiles(allFiles); // If search is empty, show all files
        return;
    }
    
    // Filter files based on search term
    const filteredFiles = allFiles.filter(file => 
        file.name.toLowerCase().includes(searchTerm)
    );
    
    displayFiles(filteredFiles);
});

// Add typing animation for search input placeholder
let searchPlaceholder = 'Search files...';
let placeholderIndex = 0;
let direction = 'typing'; // typing or deleting

function animateSearchPlaceholder() {
    if (direction === 'typing') {
        placeholderIndex++;
        if (placeholderIndex > searchPlaceholder.length) {
            // Hold the complete text for a second before starting to delete
            setTimeout(() => {
                direction = 'deleting';
                animateSearchPlaceholder();
            }, 1000);
            return;
        }
    } else {
        placeholderIndex--;
        if (placeholderIndex < 0) {
            // Hold the empty state for a second before starting to type again
            setTimeout(() => {
                direction = 'typing';
                animateSearchPlaceholder();
            }, 500);
            return;
        }
    }
    
    let currentText = searchPlaceholder.substring(0, placeholderIndex);
    if (direction === 'typing' && placeholderIndex < searchPlaceholder.length) {
        currentText += '|';
    }
    
    searchInput.setAttribute('placeholder', currentText);
    
    // Animation speed: typing is faster than deleting
    const speed = direction === 'typing' ? 100 : 50;
    setTimeout(animateSearchPlaceholder, speed);
}

// Start the animation when not focused
searchInput.addEventListener('focus', () => {
    searchInput.setAttribute('placeholder', '');
});

searchInput.addEventListener('blur', () => {
    // Only restart animation if the input is empty
    if (!searchInput.value) {
        placeholderIndex = 0;
        direction = 'typing';
        animateSearchPlaceholder();
    }
});

// Start the animation
animateSearchPlaceholder();

// Fetch files on page load
fetchFiles();

// Update the file list every 25 minutes (1500000ms)
//To get *ms* add three zeros to the end of the amount of seconds
setInterval(fetchFiles, 15000000);