// Catalog page functionality
document.addEventListener('DOMContentLoaded', () => {
    const catalogGrid = document.getElementById('catalogGrid');
    
    if (catalogGrid) {
        catalogGrid.innerHTML = GAMES.map(game => `
            <div class="game__card" onclick="window.location.href='juego.html?id=${game.id}'">
                <img src="${game.image}" alt="${game.title}" class="game__image" onerror="this.src='https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=200&fit=crop'">
                <div class="game__info">
                    <h3 class="game__title">${game.title}</h3>
                    <p class="game__genre">${game.genre}</p>
                    <p class="game__price">${formatPrice(game.price)}</p>
                    <div class="game__actions">
                        <button class="btn btn--primary" onclick="event.stopPropagation(); addToCart(${game.id})">Añadir al Carrito</button>
                        <button class="btn btn--secondary" onclick="event.stopPropagation(); window.location.href='juego.html?id=${game.id}'">Ver Detalles</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
});
