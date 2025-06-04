# manage student fees - Chrome-Extension for Aloha SDM
A Chrome extension that automatically fills and submits fee update forms with predefined values.

## Features

- **Persistent Popup Window**: Stays open until manually closed
- **Double-Click Prevention**: Prevents duplicate form submissions
- **Persistent Storage**: Values are saved using Chrome's local storage
- **Smart Field Detection**: Automatically detects form fields using multiple strategies
- **One-Click Operation**: Fill form and submit with a single click
- **User-Friendly Interface**: Simple popup with clear controls
- **Flexible**: Works with various form field naming conventions

## Installation Instructions

### Method 1: Developer Mode (Recommended)

1. **Download the Extension Files**
   - Create a new folder called `fee-form-auto-filler`
   - Save all the provided files in this folder:
     - `manifest.json`
     - `popup.html`
     - `popup.js`
     - `content.js`
     - `background.js`

2. **Create Simple Icons** (Optional but recommended)
   - Create three simple square PNG files:
     - `icon16.png` (16x16 pixels)
     - `icon48.png` (48x48 pixels) 
     - `icon128.png` (128x128 pixels)
   - Or remove the "icons" section from manifest.json if you don't want icons

3. **Load Extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `fee-form-auto-filler` folder
   - The extension should now appear in your extensions list

4. **Pin the Extension**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "Fee Form Auto Filler" and pin it for easy access

## How to Use

### Setting Up Values

1. **Open the Extension Popup**
   - Click the extension icon in your Chrome toolbar
   - The popup will show input fields for all fee amounts

2. **Enter Your Values**
   - Total Amount
   - Discount Amount  
   - VAT Amount
   - Grand Total Amount
   - Received Amount

3. **Save Values**
   - Click "Save Values" to store them permanently
   - Values will persist until you change them

### Using the Extension

1. **Open Persistent Window**
   - Click the extension icon in your Chrome toolbar
   - A separate window will open and stay visible

2. **Navigate to Fee Form Page**
   - Go to the webpage with your fee update form (in any tab)

3. **Fill and Submit**
   - In the persistent extension window, click "Fill & Submit"
   - The extension will work on the currently active tab
   - Window remains open for multiple operations

4. **Close When Done**
   - Click "Close Popup" button or close the window manually

### Additional Options

- **Clear All**: Removes all saved values
- **Save Values**: Saves current values without filling form
- **Fill & Submit**: Fills form with saved values and submits

## Field Detection Strategy

The extension uses multiple strategies to find form fields:

1. **Name/ID/Placeholder attributes** containing keywords like:
   - "total", "discount", "vat", "grand", "received"

2. **Flexible matching** for various naming conventions:
   - `totalAmount`, `total_amount`, `Total Amount`, etc.

3. **Fallback detection** scans all input fields for keyword matches

## Troubleshooting

### Extension Not Working?

1. **Check Permissions**
   - Make sure the extension has access to the current tab
   - Refresh the page and try again

2. **Form Fields Not Detected?**
   - Check if field names contain expected keywords
   - Try manually inspecting field names/IDs in browser developer tools

3. **Submit Button Not Found?**
   - The extension looks for buttons containing text like "Update", "Submit", "Save"
   - Make sure such a button exists on the form

### Common Issues

- **Values Not Saving**: Check if Chrome storage permissions are enabled
- **Fields Not Filling**: Form might use non-standard field naming
- **Auto-Submit Failing**: Submit button might have an unusual selector

## File Structure

```
fee-form-auto-filler/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for persistent window
├── popup.html            # Extension popup interface  
├── popup.js              # Popup functionality
├── content.js            # Content script for form manipulation
├── icon16.png            # Small icon (optional)
├── icon48.png            # Medium icon (optional)
└── icon128.png           # Large icon (optional)
```

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: storage, activeTab, scripting
- **Storage**: Uses `chrome.storage.local` for data persistence
- **Compatibility**: Works with Chrome/Chromium-based browsers

## Security & Privacy

- Extension only accesses the current active tab when needed
- No data is sent to external servers
- All values are stored locally in your browser
- Extension only activates when you click the "Fill & Submit" button

---

**Need Help?** Check the browser console for any error messages if the extension isn't working as expected.
