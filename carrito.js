// Cart page functionality
function renderCart() {
    const cartContainer = document.getElementById('cartContainer');
    if (!cartContainer) return;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="cart__empty">
                <div class="cart__empty-icon">🛒</div>
                <h2 style="margin-bottom: 1rem;">Tu carrito está vacío</h2>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">Añade algunos juegos para empezar tu compra</p>
                <a href="catalogo.html" class="btn btn--primary">Ver Catálogo</a>
            </div>
        `;
        return;
    }
    
    const cartItemsHTML = cart.map(item => `
        <div class="cart__item">
            <img src="${item.image}" alt="${item.title}" class="cart__item-image" onerror="this.src='https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=200&fit=crop'">
            <div class="cart__item-info">
                <h3 class="cart__item-title">${item.title}</h3>
                <p class="cart__item-price">${formatPrice(item.price)}</p>
            </div>
            <div class="cart__item-actions">
                <button class="btn btn--secondary" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span style="padding: 0 1rem;">${item.quantity}</span>
                <button class="btn btn--secondary" onclick="updateQuantity(${item.id}, 1)">+</button>
                <button class="btn btn--danger" onclick="removeFromCart(${item.id})">Eliminar</button>
            </div>
        </div>
    `).join('');
    
    const total = getCartTotal();
    
    cartContainer.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h2 style="margin-bottom: 1rem;">Productos en el carrito (${cart.reduce((sum, item) => sum + item.quantity, 0)})</h2>
            ${cartItemsHTML}
        </div>
        <div class="cart__total">
            <h3>Total</h3>
            <div class="cart__total-amount">${formatPrice(total)}</div>
            <button class="btn btn--primary btn--large" onclick="checkout()">Finalizar Compra</button>
            <p style="color: var(--text-secondary); margin-top: 0.5rem; font-size: 0.9rem;">* Compra simulada</p>
        </div>
    `;
}

function checkout() {
    const session = checkAuth();
    session.then(s => {
        if (!s || !s.user) {
            alert('Debes iniciar sesión para finalizar la compra');
            window.location.href = 'login.html';
            return;
        }
        
        alert('¡Compra realizada con éxito! Gracias por tu compra en Ludopati.');
        cart = [];
        localStorage.setItem('ludopati_cart', JSON.stringify(cart));
        updateCartBadge();
        renderCart();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});
