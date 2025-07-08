// Content script for Gmail and Outlook integration
(function() {
  let emailResponderButton;
  
  // Gmail specific selectors
  const gmailSelectors = {
    composeButton: '[role="button"][data-tooltip="Compose"]',
    composeWindow: '[role="dialog"]',
    emailBody: '[contenteditable="true"][role="textbox"]',
    replyButton: '[data-tooltip="Reply"]',
    subjectField: 'input[name="subjectbox"]'
  };
  
  // Outlook specific selectors
  const outlookSelectors = {
    composeButton: '[aria-label="New message"]',
    composeWindow: '[role="dialog"]',
    emailBody: '[contenteditable="true"]',
    replyButton: '[aria-label="Reply"]',
    subjectField: 'input[aria-label="Subject"]'
  };
  
  // Detect email platform
  function getEmailPlatform() {
    if (window.location.hostname.includes('mail.google.com')) {
      return 'gmail';
    } else if (window.location.hostname.includes('outlook.live.com')) {
      return 'outlook';
    }
    return null;
  }
  
  // Get appropriate selectors based on platform
  function getSelectors() {
    const platform = getEmailPlatform();
    return platform === 'gmail' ? gmailSelectors : outlookSelectors;
  }
  
  // Create AI responder button
  function createAIResponderButton() {
    const button = document.createElement('button');
    button.innerHTML = '🤖 AI Response';
    button.style.cssText = `
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      margin: 8px;
      transition: all 0.2s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;
    
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-1px)';
      button.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    });
    
    button.addEventListener('click', handleAIResponseClick);
    
    return button;
  }
  
  // Handle AI response button click
  function handleAIResponseClick() {
    const selectors = getSelectors();
    const emailBody = document.querySelector(selectors.emailBody);
    
    if (emailBody) {
      // Extract existing email content for context
      const existingContent = emailBody.textContent || emailBody.innerText || '';
      
      // Open extension popup with context
      chrome.runtime.sendMessage({
        action: 'openPopupWithContext',
        emailContent: existingContent,
        platform: getEmailPlatform()
      });
    }
  }
  
  // Insert AI response into email body
  function insertAIResponse(response) {
    const selectors = getSelectors();
    const emailBody = document.querySelector(selectors.emailBody);
    
    if (emailBody) {
      // Clear existing content and insert AI response
      emailBody.innerHTML = '';
      emailBody.textContent = response;
      
      // Trigger input event to notify email client
      const event = new Event('input', { bubbles: true });
      emailBody.dispatchEvent(event);
    }
  }
  
  // Add button to compose window
  function addButtonToComposeWindow() {
    const selectors = getSelectors();
    const composeWindow = document.querySelector(selectors.composeWindow);
    
    if (composeWindow && !composeWindow.querySelector('.ai-responder-button')) {
      const button = createAIResponderButton();
      button.classList.add('ai-responder-button');
      
      // Find a good place to insert the button
      const toolbar = composeWindow.querySelector('[role="toolbar"]') || 
                     composeWindow.querySelector('.nH') || 
                     composeWindow.querySelector('.ms-CompositeHeader');
      
      if (toolbar) {
        toolbar.appendChild(button);
      } else {
        // Fallback: append to compose window
        composeWindow.appendChild(button);
      }
    }
  }
  
  // Observer for dynamic content changes
  function setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if compose window appeared
              const selectors = getSelectors();
              if (node.querySelector && node.querySelector(selectors.composeWindow)) {
                setTimeout(addButtonToComposeWindow, 500);
              }
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Listen for messages from extension
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'insertResponse') {
      insertAIResponse(request.response);
      sendResponse({ success: true });
    }
  });
  
  // Initialize content script
  function init() {
    const platform = getEmailPlatform();
    if (!platform) return;
    
    // Setup mutation observer to detect compose windows
    setupMutationObserver();
    
    // Check for existing compose windows
    setTimeout(() => {
      addButtonToComposeWindow();
    }, 1000);
    
    // Add button when compose button is clicked
    const selectors = getSelectors();
    document.addEventListener('click', (e) => {
      if (e.target.matches(selectors.composeButton) || 
          e.target.matches(selectors.replyButton)) {
        setTimeout(addButtonToComposeWindow, 1000);
      }
    });
  }
  
  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();