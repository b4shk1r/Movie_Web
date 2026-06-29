function openModal(id, type) {
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

            const meta = document.getElementById('modalMeta');
            meta.innerHTML = [
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
}

function closeModal() {
    document.getElementById('movieModal').setAttribute('hidden', '');
    document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('movieModal').addEventListener('click', e => {
        if (e.target === document.getElementById('movieModal')) closeModal();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
    });
});
