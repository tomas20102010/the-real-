// Game detail page functionality
let currentGameId = null;
let currentRating = 0;

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentGameId = parseInt(urlParams.get('id'));
    
    const gameDetail = document.getElementById('gameDetail');
    
    if (gameDetail && currentGameId) {
        const game = GAMES.find(g => g.id === currentGameId);
        
        if (game) {
            gameDetail.innerHTML = `
                <div>
                    <img src="${game.image}" alt="${game.title}" class="game__detail-image" onerror="this.src='https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=400&fit=crop'">
                </div>
                <div class="game__detail-info">
                    <h1>${game.title}</h1>
                    <div class="game__detail-meta">
                        <span>🎮 ${game.genre}</span>
                    </div>
                    <p class="game__detail-price">${formatPrice(game.price)}</p>
                    <p class="game__detail-description">${game.description}</p>
                    <button class="btn btn--primary btn--large" onclick="addToCart(${game.id})">🛒 Añadir al Carrito</button>
                    <a href="carrito.html" class="btn btn--secondary btn--large" style="margin-left: 0.5rem;">Ver Carrito</a>
                </div>
            `;
            
            // Check auth for reviews
            const session = await checkAuth();
            const reviewFormContainer = document.getElementById('reviewFormContainer');
            const loginToReview = document.getElementById('loginToReview');
            
            if (session && session.user) {
                if (reviewFormContainer) reviewFormContainer.style.display = 'block';
                if (loginToReview) loginToReview.style.display = 'none';
            } else {
                if (reviewFormContainer) reviewFormContainer.style.display = 'none';
                if (loginToReview) loginToReview.style.display = 'block';
            }
            
            // Load reviews
            loadReviews();
        } else {
            gameDetail.innerHTML = '<p>Juego no encontrado</p>';
        }
    }
    
    // Star rating
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            currentRating = rating;
            document.getElementById('ratingValue').value = rating;
            
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });
    
    // Submit review
    const submitReviewBtn = document.getElementById('submitReview');
    if (submitReviewBtn) {
        submitReviewBtn.addEventListener('click', submitReview);
    }
});

async function submitReview() {
    const session = await checkAuth();
    if (!session || !session.user) {
        alert('Debes iniciar sesión para escribir una reseña');
        return;
    }
    
    const comment = document.getElementById('reviewComment').value;
    const rating = currentRating;
    const reviewAlert = document.getElementById('reviewAlert');
    
    if (rating === 0) {
        if (reviewAlert) {
            reviewAlert.innerHTML = '<div class="alert alert--error">Por favor selecciona una calificación</div>';
        }
        return;
    }
    
    if (!comment.trim()) {
        if (reviewAlert) {
            reviewAlert.innerHTML = '<div class="alert alert--error">Por favor escribe un comentario</div>';
        }
        return;
    }
    
    // Check if user already reviewed this game
    const client = window.supabaseClient || window.supabase;
    if (!client) {
        alert('Error de conexión con Supabase');
        return;
    }
    
    const { data: existingReview } = await client
        .from('reviews')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('game_id', currentGameId)
        .maybeSingle();
    
    if (existingReview) {
        if (reviewAlert) {
            reviewAlert.innerHTML = '<div class="alert alert--error">Ya has escrito una reseña para este juego</div>';
        }
        return;
    }
    
    const { error } = await client
        .from('reviews')
        .insert([
            {
                user_id: session.user.id,
                game_id: currentGameId,
                rating: rating,
                comment: comment.trim()
            }
        ]);
    
    if (error) {
        if (reviewAlert) {
            reviewAlert.innerHTML = `<div class="alert alert--error">Error: ${error.message}</div>`;
        }
    } else {
        if (reviewAlert) {
            reviewAlert.innerHTML = '<div class="alert alert--success">¡Reseña enviada correctamente!</div>';
        }
        document.getElementById('reviewComment').value = '';
        currentRating = 0;
        document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
        document.getElementById('ratingValue').value = 0;
        loadReviews();
    }
}

async function loadReviews() {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList || !currentGameId) return;
    
    const client = window.supabaseClient || window.supabase;
    if (!client) {
        reviewsList.innerHTML = '<p style="color: var(--text-secondary);">No se pudo cargar Supabase</p>';
        return;
    }
    
    const { data: reviews, error } = await client
        .from('reviews')
        .select(`
            *,
            profiles:user_id (username)
        `)
        .eq('game_id', currentGameId)
        .order('created_at', { ascending: false });
    
    if (error) {
        reviewsList.innerHTML = '<p style="color: var(--text-secondary);">Error al cargar reseñas</p>';
        return;
    }
    
    if (!reviews || reviews.length === 0) {
        reviewsList.innerHTML = '<p style="color: var(--text-secondary);">Aún no hay reseñas para este juego. ¡Sé el primero en escribir una!</p>';
        return;
    }
    
    reviewsList.innerHTML = reviews.map(review => {
        const username = review.profiles?.username || 'Usuario';
        const date = new Date(review.created_at).toLocaleDateString('es-ES');
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        
        return `
            <div class="review__item">
                <div class="review__header">
                    <div class="review__user">
                        <div class="review__avatar">${username.charAt(0).toUpperCase()}</div>
                        <div>
                            <div class="review__username">${username}</div>
                            <div class="review__date">${date}</div>
                        </div>
                    </div>
                    <div class="review__rating">${stars}</div>
                </div>
                <p class="review__comment">${escapeHtml(review.comment)}</p>
            </div>
        `;
    }).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
