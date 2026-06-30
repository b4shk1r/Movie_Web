let currentUser = null;

function getCurrentUser() {
    return currentUser;
}

function renderAuthArea() {
    const area = document.getElementById('authArea');
    if (!area) return;
    if (currentUser) {
        area.innerHTML = '';
        const emailSpan = document.createElement('span');
        emailSpan.className = 'auth-email';
        emailSpan.textContent = currentUser.email;
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'auth-logout-btn';
        logoutBtn.textContent = 'Log Out';
        logoutBtn.addEventListener('click', logout);
        area.appendChild(emailSpan);
        area.appendChild(logoutBtn);
    } else {
        area.innerHTML = '';
        const loginBtn = document.createElement('button');
        loginBtn.className = 'auth-login-btn';
        loginBtn.textContent = 'Log In';
        loginBtn.addEventListener('click', () => openAuthModal('login'));
        area.appendChild(loginBtn);
    }
}

function openAuthModal(mode) {
    setAuthMode(mode);
    document.getElementById('authError').hidden = true;
    document.getElementById('authForm').reset();
    document.getElementById('authModal').removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
    document.getElementById('authModal').setAttribute('hidden', '');
    document.body.style.overflow = document.getElementById('movieModal').hidden ? '' : 'hidden';
}

function setAuthMode(mode) {
    const isLogin = mode === 'login';
    document.getElementById('loginTab').classList.toggle('active', isLogin);
    document.getElementById('signupTab').classList.toggle('active', !isLogin);
    document.getElementById('authSubmit').textContent = isLogin ? 'Log In' : 'Sign Up';
    const pwInput = document.getElementById('authPassword');
    pwInput.autocomplete = isLogin ? 'current-password' : 'new-password';
}

function logout() {
    fetch('/api/auth/logout', { method: 'POST' })
        .then(() => {
            currentUser = null;
            renderAuthArea();
            document.dispatchEvent(new CustomEvent('authchange'));
        })
        .catch(err => console.error('Logout error:', err));
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/auth/me')
        .then(r => r.ok ? r.json() : { user: null })
        .then(data => {
            currentUser = data.user || null;
            renderAuthArea();
        })
        .catch(() => { currentUser = null; renderAuthArea(); });

    document.getElementById('loginTab').addEventListener('click', () => setAuthMode('login'));
    document.getElementById('signupTab').addEventListener('click', () => setAuthMode('signup'));
    document.getElementById('authModalClose').addEventListener('click', closeAuthModal);
    document.getElementById('authModal').addEventListener('click', e => {
        if (e.target === document.getElementById('authModal')) closeAuthModal();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !document.getElementById('authModal').hidden) closeAuthModal();
    });

    document.getElementById('commentLoginLink')?.addEventListener('click', e => {
        e.preventDefault();
        openAuthModal('login');
    });

    document.getElementById('authForm').addEventListener('submit', async e => {
        e.preventDefault();
        const mode = document.getElementById('loginTab').classList.contains('active') ? 'login' : 'signup';
        const email = document.getElementById('authEmail').value.trim();
        const password = document.getElementById('authPassword').value;
        const errorEl = document.getElementById('authError');
        errorEl.hidden = true;

        try {
            const r = await fetch(`/api/auth/${mode}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await r.json();
            if (!r.ok) throw new Error(data.error || 'Something went wrong');
            currentUser = data.user;
            renderAuthArea();
            closeAuthModal();
            document.dispatchEvent(new CustomEvent('authchange'));
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.hidden = false;
        }
    });
});
