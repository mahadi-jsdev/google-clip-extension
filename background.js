// Create context menu items when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  // Context menu for images
  chrome.contextMenus.create({
    id: "saveImage",
    title: "Save image to extension",
    contexts: ["image"]
  });

  // Context menu for selected text
  chrome.contextMenus.create({
    id: "saveText",
    title: "Save text to extension",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveImage") {
    saveImage(info.srcUrl);
  } else if (info.menuItemId === "saveText") {
    saveText(info.selectionText);
  }
});

// Save image to storage
function saveImage(imageUrl) {
  chrome.storage.local.get(['savedItems'], (result) => {
    const savedItems = result.savedItems || [];

    const newItem = {
      type: 'image',
      content: imageUrl,
      timestamp: Date.now(),
      id: Date.now()
    };

    savedItems.unshift(newItem);

    chrome.storage.local.set({ savedItems }, () => {
      console.log('Image saved');
    });
  });
}

// Save text to storage
function saveText(text) {
  chrome.storage.local.get(['savedItems'], (result) => {
    const savedItems = result.savedItems || [];

    const newItem = {
      type: 'text',
      content: text,
      timestamp: Date.now(),
      id: Date.now()
    };

    savedItems.unshift(newItem);

    chrome.storage.local.set({ savedItems }, () => {
      console.log('Text saved');
    });
  });
}
