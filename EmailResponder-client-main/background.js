// Background script for Chrome extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openPopupWithContext') {
    // Store context for popup to access
    chrome.storage.local.set({
      emailContext: request.emailContent,
      platform: request.platform
    });
    
    // Open popup (this will happen automatically when user clicks extension icon)
    chrome.action.openPopup();
    
    sendResponse({ success: true });
  }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Email Responder extension installed');
  
  // Set default configuration
  chrome.storage.sync.set({
    baseUrl: 'http://localhost:8080',
    currentUserId: ''
  });
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This will open the popup automatically due to manifest configuration
  // No additional code needed here
});

// Optional: Ad