let currentMovieId = null;
let currentMediaType = null;

function openModal(id, type) {
    currentMovieId = id;
    currentMediaType = type;

    fetch(`/movie-details?id=${id}&type=${type}`)
        .then(r => r.json())
        .then(data => {
            const title = data.title || data.name;
            const year = (data.release_date || data.first_air_date || '').split('-')[0];
            const rating = data.vote_average ? data.vote_average.toFixed(1) : null;
            const runtime = data.runtime
                ? `${data.runtime} min`
                : data.episode_run_time?.[0] ? `${data.episode_run_time[0]} min/ep` : null;

            document.getElementById('modalTitle').textContent = title;
            document.getElementById('modalPoster').src = `https://image.tmdb.org/t/p/w500/${data.poster_path}`;
            document.getElementById('modalPoster').alt = title;
            document.getElementById('modalOverview').textContent = data.overview || 'No overview available.';

            document.getElementById('modalMeta').innerHTML = [
                year ? `<span>${year}</span>` : '',
                rating ? `<span>&#9733; ${rating}</span>` : '',
                runtime ? `<span>${runtime}</span>` : '',
            ].join('');

            document.getElementById('modalGenres').innerHTML =
                (data.genres || []).map(g => `<span class="genre-pill">${g.name}</span>`).join('');

            const backdrop = document.getElementById('modalBackdrop');
            backdrop.style.backgroundImage = data.backdrop_path
                ? `url(https://image.tmdb.org/t/p/w1280/${data.backdrop_path})`
                : 'none';

            document.getElementById('movieModal').removeAttribute('hidden');
            document.body.style.overflow = 'hidden';
        })
        .catch(err => console.error('Error fetching movie details:', err));

    loadLikeState(id, type);
    loadComments(id, type);
    updateCommentFormVisibility();
}

function closeModal() {
    document.getElementById('movieModal').setAttribute('hidden', '');
    document.body.style.overflow = '';
}

// === Likes ===

function loadLikeState(id, type) {
    fetch(`/api/likes?movieId=${id}&mediaType=${type}`)
        .then(r => r.json())
        .then(data => renderLikeButton(data.liked, data.count))
        .catch(err => console.error('Error fetching likes:', err));
}

function renderLikeButton(liked, count) {
    const btn = document.getElementById('likeButton');
    btn.classList.toggle('liked', liked);
    btn.querySelector('.like-icon').innerHTML = liked ? '&#9829;' : '&#9825;';
    document.getElementById('likeCount').textContent = count;
}

function toggleLike() {
    if (!getCurrentUser()) {
        openAuthModal('login');
        return;
    }
    fetch('/api/likes/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId: currentMovieId, mediaType: currentMediaType }),
    })
        .then(async r => {
            const data = await r.json();
            if (!r.ok) throw new Error(data.error || 'Could not update like');
            return data;
        })
        .then(data => renderLikeButton(data.liked, data.count))
        .catch(err => console.error('Error toggling like:', err));
}

// === Comments ===

function loadComments(id, type) {
    fetch(`/api/comments?movieId=${id}&mediaType=${type}`)
        .then(r => r.json())
        .then(data => renderComments(data.comments))
        .catch(err => console.error('Error fetching comments:', err));
}

function renderComments(comments) {
    const list = document.getElementById('commentsList');
    list.innerHTML = '';

    if (!comments || comments.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'no-comments';
        empty.textContent = 'No comments yet. Be the first!';
        list.appendChild(empty);
        return;
    }

    comments.forEach(comment => {
        const item = document.createElement('div');
        item.className = 'comment-item';

        const header = document.createElement('div');
        header.className = 'comment-header';

        const author = document.createElement('span');
        author.className = 'comment-author';
        author.textContent = comment.author;
        header.appendChild(author);

        const date = document.createElement('span');
        date.className = 'comment-date';
        date.textContent = new Date(comment.createdAt).toLocaleDateString();
        header.appendChild(date);

        if (comment.isOwner) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'comment-delete';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => deleteComment(comment.id));
            header.appendChild(deleteBtn);
        }

        const text = document.createElement('p');
        text.className = 'comment-text';
        text.textContent = comment.text;

        item.appendChild(header);
        item.appendChild(text);
        list.appendChild(item);
    });
}

function deleteComment(id) {
    fetch(`/api/comments/${id}`, { method: 'DELETE' })
        .then(async r => {
            const data = await r.json();
            if (!r.ok) throw new Error(data.error || 'Could not delete comment');
        })
        .then(() => loadComments(currentMovieId, currentMediaType))
        .catch(err => console.error('Error deleting comment:', err));
}

function updateCommentFormVisibility() {
    const loggedIn = !!getCurrentUser();
    document.getElementById('commentForm').hidden = !loggedIn;
    document.getElementById('commentLoginHint').hidden = loggedIn;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('movieModal').addEventListener('click', e => {
        if (e.target === document.getElementById('movieModal')) closeModal();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !document.getElementById('movieModal').hidden) closeModal();
    });

    document.getElementById('likeButton').addEventListener('click', toggleLike);

    document.getElementById('commentForm').addEventListener('submit', e => {
        e.preventDefault();
        const input = document.getElementById('commentInput');
        const text = input.value.trim();
        if (!text) return;
        input.value = '';

        fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movieId: currentMovieId, mediaType: currentMediaType, text }),
        })
            .then(async r => {
                const data = await r.json();
                if (!r.ok) throw new Error(data.error || 'Could not post comment');
            })
            .then(() => loadComments(currentMovieId, currentMediaType))
            .catch(err => console.error('Error posting comment:', err));
    });

    document.addEventListener('authchange', () => {
        updateCommentFormVisibility();
        if (currentMovieId) loadComments(currentMovieId, currentMediaType);
    });
});
