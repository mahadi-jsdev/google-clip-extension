// Load and display saved items
function loadItems() {
  chrome.storage.local.get(['savedItems'], (result) => {
    const savedItems = result.savedItems || [];
    displayItems(savedItems);
  });
}

// Display items in the popup
function displayItems(items) {
  const container = document.getElementById('itemsContainer');

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No items saved yet</h3>
        <p>Right-click on any image or selected text on a webpage and choose "Save to extension"</p>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => {
    const date = new Date(item.timestamp).toLocaleString();

    if (item.type === 'image') {
      const noteSection = item.note ? `
        <div class="item-note">
          <div class="item-note-text">${item.note}</div>
        </div>
      ` : '';

      return `
        <div class="item">
          <div class="item-header">
            <span class="item-type">Image</span>
            <div class="item-actions">
              <button class="edit-note-btn" data-id="${item.id}">
                ${item.note ? 'Edit Note' : 'Add Note'}
              </button>
              <button class="delete-btn" data-id="${item.id}">Delete</button>
            </div>
          </div>
          <img src="${item.content}" class="item-image" alt="Saved image">
          ${noteSection}
          <div class="item-timestamp">${date}</div>
        </div>
      `;
    } else {
      return `
        <div class="item">
          <div class="item-header">
            <span class="item-type">Text</span>
            <div class="item-actions">
              <button class="copy-btn" data-text="${item.content.replace(/"/g, '&quot;')}">Copy</button>
              <button class="delete-btn" data-id="${item.id}">Delete</button>
            </div>
          </div>
          <div class="item-text">${item.content}</div>
          <div class="item-timestamp">${date}</div>
        </div>
      `;
    }
  }).join('');

  // Add event listeners for delete buttons
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      deleteItem(id);
    });
  });

  // Add event listeners for edit note buttons
  document.querySelectorAll('.edit-note-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      openNoteModal(id);
    });
  });

  // Add event listeners for copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const text = e.target.dataset.text;
      navigator.clipboard.writeText(text).then(() => {
        const originalText = e.target.textContent;
        e.target.textContent = 'Copied!';
        setTimeout(() => {
          e.target.textContent = originalText;
        }, 1500);
      });
    });
  });
}

// Delete a specific item
function deleteItem(id) {
  chrome.storage.local.get(['savedItems'], (result) => {
    const savedItems = result.savedItems || [];
    const updatedItems = savedItems.filter(item => item.id !== id);

    chrome.storage.local.set({ savedItems: updatedItems }, () => {
      loadItems();
    });
  });
}

// Clear all items
function clearAll() {
  if (confirm('Are you sure you want to delete all saved items?')) {
    chrome.storage.local.set({ savedItems: [] }, () => {
      loadItems();
    });
  }
}

// Modal functions
const modal = document.getElementById('addModal');
const addManualBtn = document.getElementById('addManualBtn');
const saveManualBtn = document.getElementById('saveManualBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const manualTextInput = document.getElementById('manualTextInput');

// Note modal elements
const noteModal = document.getElementById('noteModal');
const noteModalTitle = document.getElementById('noteModalTitle');
const noteTextInput = document.getElementById('noteTextInput');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const cancelNoteBtn = document.getElementById('cancelNoteBtn');
let currentEditingItemId = null;

addManualBtn.addEventListener('click', () => {
  modal.classList.add('active');
  manualTextInput.value = '';
  manualTextInput.focus();
});

cancelModalBtn.addEventListener('click', () => {
  modal.classList.remove('active');
});

saveManualBtn.addEventListener('click', () => {
  const text = manualTextInput.value.trim();

  if (text) {
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
        modal.classList.remove('active');
        loadItems();
      });
    });
  }
});

// Note modal functions
function openNoteModal(itemId) {
  chrome.storage.local.get(['savedItems'], (result) => {
    const savedItems = result.savedItems || [];
    const item = savedItems.find(i => i.id === itemId);

    if (item) {
      currentEditingItemId = itemId;
      noteTextInput.value = item.note || '';
      noteModalTitle.textContent = item.note ? 'Edit Note' : 'Add Note';
      noteModal.classList.add('active');
      noteTextInput.focus();
    }
  });
}

saveNoteBtn.addEventListener('click', () => {
  const noteText = noteTextInput.value.trim();

  if (currentEditingItemId !== null) {
    chrome.storage.local.get(['savedItems'], (result) => {
      const savedItems = result.savedItems || [];
      const itemIndex = savedItems.findIndex(i => i.id === currentEditingItemId);

      if (itemIndex !== -1) {
        savedItems[itemIndex].note = noteText;

        chrome.storage.local.set({ savedItems }, () => {
          noteModal.classList.remove('active');
          currentEditingItemId = null;
          loadItems();
        });
      }
    });
  }
});

cancelNoteBtn.addEventListener('click', () => {
  noteModal.classList.remove('active');
  currentEditingItemId = null;
});

// Close modals when clicking outside
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
  }
});

noteModal.addEventListener('click', (e) => {
  if (e.target === noteModal) {
    noteModal.classList.remove('active');
    currentEditingItemId = null;
  }
});

// Event listeners
document.getElementById('clearAllBtn').addEventListener('click', clearAll);

// Load items when popup opens
loadItems();
