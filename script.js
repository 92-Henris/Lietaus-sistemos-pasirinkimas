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
const quantityInput = document.getElementById('quantity');
const itemSizeSelect = document.getElementById('itemSize');
const addToCartBtn = document.getElementById('addToCartBtn');
const cancelBtn = document.getElementById('cancelBtn');

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

    // Check if this item supports size selection
    const sizeEnabledItems = ['Latakas', 'Latakas 2', 'Lietvamzdis 1m'];
    const sizeSelection = document.querySelector('.size-selection');
    
    if (sizeEnabledItems.includes(dataName)) {
        sizeSelection.style.display = 'block';
        if (imageData[imageId]) {
            quantityInput.value = imageData[imageId].quantity || 1;
            itemSizeSelect.value = imageData[imageId].size || 'small';
        } else {
            quantityInput.value = 1;
            itemSizeSelect.value = 'small';
            imageData[imageId] = { quantity: 1, size: 'small' };
        }
    } else {
        sizeSelection.style.display = 'none';
        if (imageData[imageId]) {
            quantityInput.value = imageData[imageId].quantity || 1;
        } else {
            quantityInput.value = 1;
            imageData[imageId] = { quantity: 1 };
        }
    }

    if (imageModal) imageModal.style.display = 'block';
}

quantityInput.addEventListener('input', () => {
    // Quantity input handling if needed
});

addToCartBtn.addEventListener('click', () => {
    if (!selectedImage) return;
    
    const imageId = selectedImage.dataset.imageId;
    const quantity = parseInt(quantityInput.value) || 1;
    const dataName = selectedImage.dataset.name || '';
    
    if (quantity <= 0) {
        alert('Please enter valid quantity');
        return;
    }
    
    const name = selectedImage.dataset.name || '';
    const sizeEnabledItems = ['Latakas', 'Latakas 2', 'Lietvamzdis 1m'];
    
    let cartItem = {
        imageId,
        name,
        quantity
    };
    
    if (sizeEnabledItems.includes(dataName)) {
        const size = itemSizeSelect.value;
        const sizeText = itemSizeSelect.options[itemSizeSelect.selectedIndex].text;
        cartItem.size = size;
        cartItem.sizeText = sizeText;
        
        // Save quantity and size to imageData
        imageData[imageId] = { quantity, size };
        
        cart.push(cartItem);
        
        if (imageModal) imageModal.style.display = 'none';
        alert(`Added to cart: ${quantity} items (${sizeText})`);
    } else {
        // Save only quantity to imageData
        imageData[imageId] = { quantity };
        
        cart.push(cartItem);
        
        if (imageModal) imageModal.style.display = 'none';
        alert(`Added to cart: ${quantity} items`);
    }
    
    console.log('Cart:', cart);
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
});
