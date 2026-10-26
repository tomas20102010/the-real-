// Community page functionality
document.addEventListener('DOMContentLoaded', async () => {
    const usersGrid = document.getElementById('usersGrid');
    const communityStats = document.getElementById('communityStats');
    const loginToCommunity = document.getElementById('loginToCommunity');
    const client = window.supabaseClient || window.supabase;
    
    const session = await checkAuth();
    
    if (!session || !session.user || !client) {
        if (usersGrid) usersGrid.style.display = 'none';
        if (loginToCommunity) loginToCommunity.style.display = 'block';
        if (communityStats) communityStats.textContent = '';
        return;
    }
    
    if (loginToCommunity) loginToCommunity.style.display = 'none';
    if (usersGrid) usersGrid.style.display = 'grid';
    
    // Load all users except current user
    const { data: profiles, error } = await client
        .from('profiles')
        .select('*')
        .neq('id', session.user.id)
        .order('created_at', { ascending: false });
    
    if (error) {
        if (communityStats) communityStats.textContent = 'Error al cargar usuarios';
        if (usersGrid) {
            usersGrid.innerHTML = '<p style="color: var(--text-secondary);">Error al cargar la comunidad</p>';
        }
        return;
    }
    
    if (communityStats) {
        communityStats.textContent = `${profiles ? profiles.length : 0} jugadores registrados`;
    }
    
    if (!profiles || profiles.length === 0) {
        if (usersGrid) {
            usersGrid.innerHTML = '<p style="color: var(--text-secondary);">No hay otros usuarios registrados aún.</p>';
        }
        return;
    }
    
    // Load current user's friends
    const { data: friendships } = await client
        .from('friendships')
        .select('friend_id, status')
        .eq('user_id', session.user.id);
    
    const friendIds = new Map();
    if (friendships) {
        friendships.forEach(f => {
            friendIds.set(f.friend_id, f.status);
        });
    }
    
    usersGrid.innerHTML = profiles.map(profile => {
        const username = profile.username || profile.email.split('@')[0];
        const status = friendIds.get(profile.id);
        const initial = username.charAt(0).toUpperCase();
        
        let buttonHTML = '';
        if (status === 'accepted') {
            buttonHTML = '<button class="btn btn--secondary" disabled>Amigos ✓</button>';
        } else if (status === 'pending') {
            buttonHTML = '<button class="btn btn--secondary" disabled>Solicitud enviada</button>';
        } else {
            buttonHTML = `<button class="btn btn--primary" onclick="addFriend('${profile.id}', this)">Añadir Amigo</button>`;
        }
        
        return `
            <div class="user__card">
                <div class="user__avatar">${initial}</div>
                <div class="user__info">
                    <div class="user__name">${escapeHtml(username)}</div>
                    <div class="user__email">${profile.email}</div>
                </div>
                <div class="user__actions">
                    ${buttonHTML}
                </div>
            </div>
        `;
    }).join('');
});

async function addFriend(friendId, button) {
    const session = await checkAuth();
    const client = window.supabaseClient || window.supabase;
    if (!session || !session.user || !client) {
        alert('Debes iniciar sesión');
        return;
    }
    
    button.disabled = true;
    button.textContent = 'Enviando...';
    
    const { error } = await client
        .from('friendships')
        .insert([
            {
                user_id: session.user.id,
                friend_id: friendId,
                status: 'pending'
            }
        ]);
    
    if (error) {
        alert('Error al enviar solicitud de amistad');
        button.disabled = false;
        button.textContent = 'Añadir Amigo';
        button.classList.remove('btn--secondary');
        button.classList.add('btn--primary');
    } else {
        button.textContent = 'Solicitud enviada';
        button.classList.remove('btn--primary');
        button.classList.add('btn--secondary');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
