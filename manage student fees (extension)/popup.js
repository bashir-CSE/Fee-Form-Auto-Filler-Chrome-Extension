// Popup script for Student Fee Manager
document.addEventListener('DOMContentLoaded', function() {
  const saveValuesBtn = document.getElementById('saveValues');
  const startAutomationBtn = document.getElementById('startAutomation');
  const stopAutomationBtn = document.getElementById('stopAutomation');
  const checkStatusBtn = document.getElementById('checkStatus');
  const statusDiv = document.getElementById('status');

  // Load saved values on popup open
  loadSavedValues();

  // Save values to chrome storage
  saveValuesBtn.addEventListener('click', function() {
    const values = {
      totalAmount: document.getElementById('totalAmount').value || '0',
      discountAmount: document.getElementById('discountAmount').value || '0',
      vatAmount: document.getElementById('vatAmount').value || '0',
      grandTotalAmount: document.getElementById('grandTotalAmount').value || '0',
      receivedAmount: document.getElementById('receivedAmount').value || '0'
    };

    chrome.storage.local.set(values, function() {
      showStatus('Values saved successfully!', 'success');
    });
  });

  // Start automation
  startAutomationBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'startAutomation'}, function(response) {
        if (chrome.runtime.lastError) {
          showStatus('Error: ' + chrome.runtime.lastError.message, 'error');
        } else if (response) {
          showStatus(response.message, response.success ? 'success' : 'error');
        }
      });
    });
  });

  // Stop automation
  stopAutomationBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'stopAutomation'}, function(response) {
        if (chrome.runtime.lastError) {
          showStatus('Error: ' + chrome.runtime.lastError.message, 'error');
        } else if (response) {
          showStatus(response.message, response.success ? 'success' : 'info');
        }
      });
    });
  });

  // Check status
  checkStatusBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'checkStatus'}, function(response) {
        if (chrome.runtime.lastError) {
          showStatus('Error: ' + chrome.runtime.lastError.message, 'error');
        } else if (response) {
          showStatus(response.message, 'info');
        }
      });
    });
  });

  function loadSavedValues() {
    chrome.storage.local.get(['totalAmount', 'discountAmount', 'vatAmount', 'grandTotalAmount', 'receivedAmount'], function(result) {
      document.getElementById('totalAmount').value = result.totalAmount || '';
      document.getElementById('discountAmount').value = result.discountAmount || '';
      document.getElementById('vatAmount').value = result.vatAmount || '';
      document.getElementById('grandTotalAmount').value = result.grandTotalAmount || '';
      document.getElementById('receivedAmount').value = result.receivedAmount || '';
    });
  }

  function showStatus(message, type) {
    statusDiv.className = 'status ' + type;
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(function() {
      statusDiv.style.display = 'none';
    }, 10000);
  }
});