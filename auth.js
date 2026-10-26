let authClient = null;

async function waitForClient() {
    let attempts = 0;
    while (attempts < 150) {
        authClient = window.supabaseClient || window.supabase;
        if (authClient && authClient.auth) return authClient;
        await new Promise(r => setTimeout(r, 50));
        attempts++;
    }
    return null;
}

async function updateHeader() {
    const client = await waitForClient();
    if (!client) return;

    const navAuth = document.getElementById('navAuth');
    const navUser = document.getElementById('navUser');
    const navUsername = document.getElementById('navUsername');
    const logoutBtn = document.getElementById('logoutBtn');

    const { data: { session } } = await client.auth.getSession();

    if (session && session.user) {
        if (navAuth) navAuth.style.display = 'none';
        if (navUser) {
            navUser.style.display = 'flex';
            try {
                const { data: profile } = await client
                    .from('profiles')
                    .select('username')
                    .eq('id', session.user.id)
                    .maybeSingle();

                if (profile && profile.username && navUsername) {
                    navUsername.textContent = profile.username;
                } else if (navUsername) {
                    navUsername.textContent = session.user.email.split('@')[0];
                }
            } catch (e) {
                if (navUsername) {
                    navUsername.textContent = session.user.email.split('@')[0];
                }
            }
        }
    } else {
        if (navAuth) navAuth.style.display = 'flex';
        if (navUser) navUser.style.display = 'none';
    }

    if (logoutBtn && !logoutBtn.dataset.bound) {
        logoutBtn.dataset.bound = 'true';
        logoutBtn.addEventListener('click', async () => {
            const c = await waitForClient();
            if (c) await c.auth.signOut();
            window.location.href = 'index.html';
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await updateHeader();

    const client = await waitForClient();
    if (client && client.auth && client.auth.onAuthStateChange) {
        client.auth.onAuthStateChange(() => {
            updateHeader();
        });
    }

    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu && !navToggle.dataset.bound) {
        navToggle.dataset.bound = 'true';
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
});

// LOGIN
const loginForm = document.getElementById('loginForm');
if (loginForm && !loginForm.dataset.bound) {
    loginForm.dataset.bound = 'true';
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const client = await waitForClient();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const alertDiv = document.getElementById('alert');
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        if (alertDiv) alertDiv.innerHTML = '';
        if (!client || !client.auth) {
            if (alertDiv) alertDiv.innerHTML = '<div class="alert alert--error">Supabase no está cargado. Recargá la página.</div>';
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Iniciando...';
        }

        try {
            const { data, error } = await client.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                if (alertDiv) alertDiv.innerHTML = '<div class="alert alert--error">' + error.message + '</div>';
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Iniciar Sesión';
                }
                return;
            }

            if (data.session) {
                if (alertDiv) alertDiv.innerHTML = '<div class="alert alert--success">¡Sesión iniciada! Entrando...</div>';
                setTimeout(() => {
                    window.location.replace('index.html');
                }, 800);
            } else {
                if (alertDiv) alertDiv.innerHTML = '<div class="alert alert--error">No se pudo iniciar sesión. Revisá tu correo/contraseña.</div>';
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Iniciar Sesión';
                }
            }
        } catch (err) {
            console.error(err);
            if (alertDiv) alertDiv.innerHTML = '<div class="alert alert--error">Error inesperado: ' + err.message + '</div>';
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Iniciar Sesión';
            }
        }
    });
}

// REGISTRO
const registerForm = document.getElementById('registerForm');
if (registerForm && !registerForm.dataset.bound) {
    registerForm.dataset.bound = 'true';
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const client = await waitForClient();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const username = document.getElementById('username').value.trim();
        const alertDiv = document.getElementById('alert');
        const submitBtn = registerForm.querySelector('button[type="submit"]');

        if (alertDiv) alertDiv.innerHTML = '';
        if (!client || !client.auth) {
            if (alertDiv) alertDiv.innerHTML = '<div class="alert alert--error">Supabase no está cargado. Recargá la página.</div>';
            return;
        }

        if (!username) {
            if (alertDiv) alertDiv.innerHTML = '<div class="alert alert--error">Ingresá un nombre de usuario</div>';
            return;
        }

        if (password.length < 6) {
            if (alertDiv) alertDiv.innerHTML = '<div class="alert alert--error">La contraseña debe tener al menos 6 caracteres</div>';
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Registrando...';
        }

        try {
            const { data, error } = await client.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: username
                    }
                }
            });

            if (error) {
                if (alertDiv) alertDiv.innerHTML = '<div class="alert alert--error">' + error.message + '</div>';
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Registrarse';
                }
                return;
            }

            if (alertDiv) alertDiv.innerHTML = '<div class="alert alert--success">¡Cuenta creada! Ya podés iniciar sesión.</div>';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } catch (err) {
            console.error(err);
            if (alertDiv) alertDiv.innerHTML = '<div class="alert alert--error">Error inesperado: ' + err.message + '</div>';
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Registrarse';
            }
        }
    });
}