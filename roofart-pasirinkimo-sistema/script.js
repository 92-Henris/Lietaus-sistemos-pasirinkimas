let imageCount = 0;
const maxImages = 10;
let draggedElement = null;
let offsetX = 0;
let offsetY = 0;
let selectedImage = null;
let imageData = {};
let cart = [];

const imageUpload = document.getElementById('imageUpload');
const resetBtn = document.getElementById('resetBtn');
const imageContainer = document.getElementById('imageContainer');
const imageModal = document.getElementById('imageModal');
const itemSizeSelect = document.getElementById('itemSize');
const modalSizeSelect = document.getElementById('modalSize');
const modalColorSelect = document.getElementById('modalColor');
const comboWarning = document.getElementById('comboWarning');
const cancelBtn = document.getElementById('cancelBtn');
const itemUrlEl = document.getElementById('itemUrl');
const welcomeModal = document.getElementById('welcomeModal');
const welcomeCloseBtn = document.getElementById('welcomeCloseBtn');

function checkCombination() {
    if (!comboWarning || !selectedImage) return;
    const len = itemSizeSelect ? itemSizeSelect.value : '';
    const size = modalSizeSelect ? modalSizeSelect.value : '';
    // only warn for 2m (small) + 150/100 (large) on specified items
    if ((selectedImage.dataset.name === 'Latakas' || selectedImage.dataset.name === 'Latakas 2') &&
        len === 'small' && size === 'large') {
        comboWarning.style.display = 'block';
    } else {
        comboWarning.style.display = 'none';
    }
}

function updateProductUrlBySize() {
    if (!itemUrlEl || !selectedImage) return;

    const length = itemSizeSelect ? (itemSizeSelect.value || '').trim().toLowerCase() : '';
    const size = modalSizeSelect ? (modalSizeSelect.value || '').trim().toLowerCase() : '';
    const color = modalColorSelect ? (modalColorSelect.value || '').trim().toLowerCase() : '';

    // Use the base URL by default (if any), but later override with the most specific match.
    let url = selectedImage.dataset.url || '#';

    const sizeEnabledItems = ['Latakas', 'Latakas 2', 'Lietvamzdis'];
    const isLengthEnabled = sizeEnabledItems.includes(selectedImage.dataset.name);

    const buildDataKey = (...parts) => `data-url-${parts.filter(Boolean).join('-')}`;

    const dataKeys = [];
    if (isLengthEnabled && length && size && color) dataKeys.push(buildDataKey(length, size, color));
    if (isLengthEnabled && length && size) dataKeys.push(buildDataKey(length, size));
    if (isLengthEnabled && length) dataKeys.push(buildDataKey(length));
    if (size && color) dataKeys.push(buildDataKey(size, color));
    if (size) dataKeys.push(buildDataKey(size));

    const getDatasetValue = (key) => {
        // Convert a data- attribute key like "data-url-small-tamsiruda" to a dataset property name.
        const datasetKey = key
            .replace(/^data-/, '')
            .split('-')
            .map((segment, index) => index === 0 ? segment : segment.charAt(0).toUpperCase() + segment.slice(1))
            .join('');
        return selectedImage.dataset[datasetKey];
    };

    for (const key of dataKeys) {
        const candidate = getDatasetValue(key);
        if (candidate) {
            url = candidate;
            break;
        }
    }

    itemUrlEl.href = url;
    checkCombination();
}

if (imageUpload) {
    imageUpload.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        
        files.forEach(file => {
            if (imageCount >= maxImages) {
                alert(`Maximum ${maxImages} images allowed!`);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageItem = document.createElement('div');
                imageItem.className = 'image-item';
                const imageId = 'img-' + Date.now() + '-' + Math.random();
                imageItem.dataset.imageId = imageId;
                imageItem.style.left = (Math.random() * 400) + 'px';
                imageItem.style.top = (Math.random() * 300) + 'px';
                
                const img = document.createElement('img');
                img.src = event.target.result;
                img.alt = file.name;
                
                imageItem.appendChild(img);
                imageContainer.appendChild(imageItem);
                
                // Make draggable
                makeImageDraggable(imageItem);
                imageCount++;
            };
            reader.readAsDataURL(file);
        });
    });
}

function makeImageDraggable(element) {
    let isClickOnly = true;
    
    element.addEventListener('mousedown', (e) => {
        isClickOnly = true;
        draggedElement = element;
        const rect = element.getBoundingClientRect();
        const containerRect = imageContainer.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        element.style.zIndex = 1000;
    });
    
    element.addEventListener('mousemove', () => {
        isClickOnly = false;
    });
    
    element.addEventListener('click', (e) => {
        if (isClickOnly) {
            e.stopPropagation();
            openImageModal(element);
        }
    });
}

document.addEventListener('mousemove', (e) => {
    if (draggedElement) {
        const containerRect = imageContainer.getBoundingClientRect();
        let x = e.clientX - containerRect.left - offsetX;
        let y = e.clientY - containerRect.top - offsetY;
        
        // Keep within bounds
        x = Math.max(0, Math.min(x, containerRect.width - draggedElement.offsetWidth));
        y = Math.max(0, Math.min(y, containerRect.height - draggedElement.offsetHeight));
        
        draggedElement.style.left = x + 'px';
        draggedElement.style.top = y + 'px';
    }
});

document.addEventListener('mouseup', () => {
    if (draggedElement) {
        draggedElement.style.zIndex = 1;
        draggedElement = null;
    }
});

if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        const images = document.querySelectorAll('.image-item');
        images.forEach(img => {
            img.style.left = (Math.random() * 400) + 'px';
            img.style.top = (Math.random() * 300) + 'px';
        });
    });
}

function openImageModal(element) {
    selectedImage = element;
    const imageId = element.dataset.imageId;
    const dataName = element.dataset.name || '';
    const itemNameEl = document.getElementById('itemName');
    if (itemNameEl) itemNameEl.textContent = dataName;

    baseProductUrl = element.dataset.url || '#';
    if (itemUrlEl) itemUrlEl.href = baseProductUrl;

    // Check if this item supports size selection
    const sizeEnabledItems = ['Latakas', 'Latakas 2', 'Lietvamzdis'];
    const sizeSelection = document.querySelector('.size-selection');
    
    if (sizeEnabledItems.includes(dataName)) {
        sizeSelection.style.display = 'block';
        
        // Set size options based on item
        itemSizeSelect.innerHTML = '';
        if (dataName === 'Lietvamzdis') {
            itemSizeSelect.innerHTML = '<option value="small">1 m.</option><option value="medium">3 m.</option>';
        } else {
            itemSizeSelect.innerHTML = '<option value="small">2 m.</option><option value="medium">3 m.</option><option value="large">4 m.</option>';
        }
        
        if (imageData[imageId]) {
            itemSizeSelect.value = imageData[imageId].size || 'small';
        } else {
            itemSizeSelect.value = 'small';
            imageData[imageId] = { size: 'small' };
        }
    } else {
        sizeSelection.style.display = 'none';
        if (!imageData[imageId]) {
            imageData[imageId] = {};
        }
    }

    // Always update the catalog link based on current selections and the active item
    updateProductUrlBySize();
    checkCombination();

    if (imageModal) imageModal.style.display = 'block';
}

modalSizeSelect.addEventListener('change', updateProductUrlBySize);
modalColorSelect.addEventListener('change', updateProductUrlBySize);
itemSizeSelect.addEventListener('change', updateProductUrlBySize);

// Add validation for catalog button click
itemUrlEl.addEventListener('click', (e) => {
    const size = modalSizeSelect ? modalSizeSelect.value : '';
    const color = modalColorSelect ? modalColorSelect.value : '';

    // Always require explicit size + color selection.
    if (!size || !color) {
        e.preventDefault(); // Prevent navigation
        alert('Prašome pasirinkti sistemos dydį ir spalvą prieš peržiūrint kataloge.');
        return false;
    }

    const hrefAttr = itemUrlEl.getAttribute('href') || '';
    const hrefProp = itemUrlEl.href || '';

    // If there is no valid URL set (or it is still '#'), also block navigation.
    if (!hrefProp || hrefAttr === '#' || hrefProp.endsWith('#')) {
        e.preventDefault();
        alert('Prašome pasirinkti sistemos dydį ir spalvą prieš peržiūrint kataloge.');
        return false;
    }
});

cancelBtn.addEventListener('click', () => {
    imageModal.style.display = 'none';
    selectedImage = null;
});

window.addEventListener('click', (e) => {
    if (e.target === imageModal) {
        imageModal.style.display = 'none';
        selectedImage = null;
    }
});

function initPlaceholders() {
    const placeholders = document.querySelectorAll('.image-placeholder');
    placeholders.forEach(el => {
        const name = el.dataset.name || '';
        const price = parseFloat(el.dataset.price) || 0;
        const label = document.createElement('div');
        label.className = 'placeholder-label';
        /*label.innerHTML = `<div class="ph-name">${name}</div><div class="ph-price">$${price.toFixed(2)}</div>`; */
        el.appendChild(label);

        el.addEventListener('click', (e) => {
            e.stopPropagation();
            openImageModal(el);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initPlaceholders();
    
    // Show welcome modal on page load
    if (welcomeModal) {
        welcomeModal.style.display = 'block';
    }
    
    // Close welcome modal
    if (welcomeCloseBtn) {
        welcomeCloseBtn.addEventListener('click', () => {
            if (welcomeModal) {
                welcomeModal.style.display = 'none';
            }
        });
    }
    
    // Close welcome modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === welcomeModal) {
            welcomeModal.style.display = 'none';
        }
    });
});
