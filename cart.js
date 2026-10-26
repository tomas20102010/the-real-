// Cart functionality
let cart = JSON.parse(localStorage.getItem('ludopati_cart')) || [];

function updateCartBadge() {
    const cartBadge = document.getElementById('cartBadge');
    if (cartBadge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;
    }
}

function addToCart(gameId) {
    const game = GAMES.find(g => g.id === gameId);
    if (!game) return;
    
    const existingItem = cart.find(item => item.id === gameId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: game.id,
            title: game.title,
            price: game.price,
            image: game.image,
            quantity: 1
        });
    }
    
    localStorage.setItem('ludopati_cart', JSON.stringify(cart));
    updateCartBadge();
    
    // Show feedback
    alert('¡Juego añadido al carrito!');
}

function removeFromCart(gameId) {
    cart = cart.filter(item => item.id !== gameId);
    localStorage.setItem('ludopati_cart', JSON.stringify(cart));
    updateCartBadge();
    if (typeof renderCart === 'function') {
        renderCart();
    }
}

function updateQuantity(gameId, change) {
    const item = cart.find(item => item.id === gameId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(gameId);
            return;
        }
        localStorage.setItem('ludopati_cart', JSON.stringify(cart));
        updateCartBadge();
        if (typeof renderCart === 'function') {
            renderCart();
        }
    }
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Initialize cart badge on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
});
