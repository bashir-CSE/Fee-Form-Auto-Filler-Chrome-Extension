// Content script for Student Fee Manager
(function() {
  let isAutomationRunning = false;
  let automationInterval = null;
  let processedRows = new Set();

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.action) {
      case 'startAutomation':
        startAutomation();
        sendResponse({success: true, message: 'Automation started!'});
        break;
      case 'stopAutomation':
        stopAutomation();
        sendResponse({success: true, message: 'Automation stopped!'});
        break;
      case 'checkStatus':
        sendResponse({success: true, message: `Automation is ${isAutomationRunning ? 'running' : 'stopped'}`});
        break;
    }
  });

  function startAutomation() {
    if (isAutomationRunning) {
      console.log('Automation already running');
      return;
    }

    isAutomationRunning = true;
    console.log('Starting automation...');

    // Check current page and handle accordingly
    if (window.location.href.includes('dispute-manage-student-fees')) {
      handleManageFeesPage();
    } else if (window.location.href.includes('dispute-fees-edit')) {
      handleEditFeesPage();
    } else {
      console.log('Not on a recognized page for automation');
    }
  }

  function stopAutomation() {
    isAutomationRunning = false;
    if (automationInterval) {
      clearInterval(automationInterval);
      automationInterval = null;
    }
    console.log('Automation stopped');
  }

  function handleManageFeesPage() {
    console.log('Handling manage fees page...');
    
    // Look for unpaid rows and click edit buttons
    automationInterval = setInterval(() => {
      if (!isAutomationRunning) return;

      const unpaidRow = findNextUnpaidRow();
      if (unpaidRow) {
        const editButton = unpaidRow.querySelector('button[style*="background-color: rgb(255, 193, 7)"], .btn[style*="background-color: rgb(255, 193, 7)"]');
        if (!editButton) {
          // Try to find yellow/orange edit button by looking for common edit button patterns
          const allButtons = unpaidRow.querySelectorAll('button, a');
          const editBtn = Array.from(allButtons).find(btn => {
            const style = window.getComputedStyle(btn);
            return style.backgroundColor.includes('255, 193, 7') || 
                   btn.classList.contains('btn-warning') ||
                   btn.style.backgroundColor.includes('orange') ||
                   btn.style.backgroundColor.includes('rgb(255, 193, 7)');
          });
          
          if (editBtn) {
            console.log('Clicking edit button for unpaid row');
            markRowAsProcessed(unpaidRow);
            editBtn.click();
            return;
          }
        } else {
          console.log('Clicking edit button for unpaid row');
          markRowAsProcessed(unpaidRow);
          editButton.click();
          return;
        }
      } else {
        console.log('No more unpaid rows found');
        stopAutomation();
      }
    }, 2000); // Check every 2 seconds
  }

  function findNextUnpaidRow() {
    const rows = document.querySelectorAll('tr');
    
    for (let row of rows) {
      // Skip if already processed
      if (processedRows.has(row)) continue;
      
      // Look for "Unpaid" status
      const statusCell = row.querySelector('td .badge, td span, td');
      if (statusCell && statusCell.textContent.trim().toLowerCase() === 'unpaid') {
        return row;
      }
      
      // Alternative: look for red background or specific unpaid styling
      const cells = row.querySelectorAll('td');
      for (let cell of cells) {
        if (cell.textContent.trim().toLowerCase() === 'unpaid' || 
            cell.querySelector('.badge-danger, .text-danger, [style*="background-color: rgb(220, 53, 69)"]')) {
          return row;
        }
      }
    }
    
    return null;
  }

  function markRowAsProcessed(row) {
    processedRows.add(row);
    // Add visual indicator
    row.style.opacity = '0.7';
    row.style.backgroundColor = '#f8f9fa';
  }

  function handleEditFeesPage() {
    console.log('Handling edit fees page...');
    
    // Add "Change Value" button
    addChangeValueButton();
    
    // Stop automation on edit page (will restart when returning to manage page)
    stopAutomation();
  }

  function addChangeValueButton() {
    // Check if button already exists
    if (document.getElementById('autoFillButton')) {
      return;
    }

    // Find a good place to insert the button (near form elements)
    const formContainer = document.querySelector('form, .form-container, .card-body, .container');
    if (!formContainer) {
      console.log('Could not find form container');
      return;
    }

    // Create the button
    const button = document.createElement('button');
    button.id = 'autoFillButton';
    button.type = 'button';
    button.textContent = 'Change Value';
    button.style.cssText = `
      background-color: #28a745;
      color: white;
      border: none;
      padding: 10px 20px;
      margin: 10px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
    `;

    // Add hover effect
    button.addEventListener('mouseenter', function() {
      this.style.backgroundColor = '#218838';
    });

    button.addEventListener('mouseleave', function() {
      this.style.backgroundColor = '#28a745';
    });

    // Add click handler
    button.addEventListener('click', autoFillForm);

    // Insert button at the top of the form
    formContainer.insertBefore(button, formContainer.firstChild);
  }

  function autoFillForm() {
    console.log('Auto-filling form...');
    
    // Get saved values from storage
    chrome.storage.local.get(['totalAmount', 'discountAmount', 'vatAmount', 'grandTotalAmount', 'receivedAmount'], function(result) {
      // Field mapping - try multiple selectors for each field
      const fieldMappings = {
        totalAmount: ['input[name*="total"], input[id*="total"], input[placeholder*="total"]', result.totalAmount || '0'],
        discountAmount: ['input[name*="discount"], input[id*="discount"], input[placeholder*="discount"]', result.discountAmount || '0'],
        vatAmount: ['input[name*="vat"], input[id*="vat"], input[placeholder*="vat"]', result.vatAmount || '0'],
        grandTotalAmount: ['input[name*="grand"], input[id*="grand"], input[placeholder*="grand"]', result.grandTotalAmount || '0'],
        receivedAmount: ['input[name*="received"], input[id*="received"], input[placeholder*="received"]', result.receivedAmount || '0']
      };

      // Fill each field
      Object.entries(fieldMappings).forEach(([fieldName, [selectors, value]]) => {
        const selectorList = selectors.split(', ');
        let field = null;
        
        // Try each selector until we find the field
        for (let selector of selectorList) {
          field = document.querySelector(selector);
          if (field) break;
        }

        if (field) {
          field.value = value;
          field.dispatchEvent(new Event('input', { bubbles: true }));
          field.dispatchEvent(new Event('change', { bubbles: true }));
          console.log(`Filled ${fieldName}: ${value}`);
        } else {
          console.log(`Could not find field for ${fieldName}`);
        }
      });

      // Show success message
      showNotification('Form auto-filled and submitting...', 'success');
      
      // Auto-click the "Update Fees" button after a short delay
      setTimeout(() => {
        clickUpdateFeesButton();
      }, 500);
    });
  }

  function clickUpdateFeesButton() {
    // Try multiple selectors to find the "Update Fees" button
    const buttonSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:contains("Update Fees")',
      'button:contains("Update")',
      'button:contains("Submit")',
      '.btn-primary',
      '.btn-success',
      'button[class*="btn"]'
    ];

    let updateButton = null;

    // First try to find button by text content
    const allButtons = document.querySelectorAll('button, input[type="submit"]');
    for (let button of allButtons) {
      const buttonText = button.textContent || button.value || '';
      if (buttonText.toLowerCase().includes('update fees') || 
          buttonText.toLowerCase().includes('update') ||
          buttonText.toLowerCase().includes('submit')) {
        updateButton = button;
        break;
      }
    }

    // If not found by text, try the selectors
    if (!updateButton) {
      for (let selector of buttonSelectors) {
        updateButton = document.querySelector(selector);
        if (updateButton) break;
      }
    }

    // If still not found, look for the last button in the form (usually submit button)
    if (!updateButton) {
      const form = document.querySelector('form');
      if (form) {
        const formButtons = form.querySelectorAll('button, input[type="submit"]');
        if (formButtons.length > 0) {
          updateButton = formButtons[formButtons.length - 1];
        }
      }
    }

    if (updateButton) {
      console.log('Clicking Update Fees button');
      updateButton.click();
      showNotification('Update Fees button clicked!', 'success');
    } else {
      console.log('Could not find Update Fees button');
      showNotification('Could not find Update Fees button - please click manually', 'error');
    }
  }

  function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: ${type === 'success' ? '#28a745' : '#dc3545'};
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 10000;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  // Initialize based on current page
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
  } else {
    initializePage();
  }

  function initializePage() {
    if (window.location.href.includes('dispute-fees-edit')) {
      // Add the change value button when on edit page
      setTimeout(addChangeValueButton, 1000);
    }
  }

  // Handle page navigation
  let currentUrl = window.location.href;
  const observer = new MutationObserver(() => {
    if (currentUrl !== window.location.href) {
      currentUrl = window.location.href;
      
      // Reset processed rows when returning to manage page
      if (currentUrl.includes('dispute-manage-student-fees')) {
        processedRows.clear();
      }
      
      // Re-initialize for new page
      setTimeout(initializePage, 1000);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

})();