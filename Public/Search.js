document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;
    let activeGenreId = null;

    const MOVIE_GENRES = [
        { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' },
        { id: 16, name: 'Animation' }, { id: 35, name: 'Comedy' },
        { id: 80, name: 'Crime' }, { id: 99, name: 'Documentary' },
        { id: 18, name: 'Drama' }, { id: 10751, name: 'Family' },
        { id: 14, name: 'Fantasy' }, { id: 27, name: 'Horror' },
        { id: 9648, name: 'Mystery' }, { id: 10749, name: 'Romance' },
        { id: 878, name: 'Sci-Fi' }, { id: 53, name: 'Thriller' },
        { id: 37, name: 'Western' },
    ];

    const TV_GENRES = [
        { id: 10759, name: 'Action & Adventure' }, { id: 16, name: 'Animation' },
        { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' },
        { id: 99, name: 'Documentary' }, { id: 18, name: 'Drama' },
        { id: 10751, name: 'Family' }, { id: 9648, name: 'Mystery' },
        { id: 10764, name: 'Reality' }, { id: 10765, name: 'Sci-Fi & Fantasy' },
        { id: 37, name: 'Western' },
    ];

    function getSelectedType() {
        return document.querySelector('input[name="type"]:checked').value;
    }

    function renderGenreTags() {
        const type = getSelectedType();
        const genres = type === 'tv' ? TV_GENRES : MOVIE_GENRES;
        const container = document.getElementById('genreTags');
        container.innerHTML = '';
        genres.forEach(genre => {
            const btn = document.createElement('button');
            btn.className = 'genre-tag' + (activeGenreId === genre.id ? ' active' : '');
            btn.textContent = genre.name;
            btn.addEventListener('click', () => {
                if (activeGenreId === genre.id) {
                    activeGenreId = null;
                    renderGenreTags();
                    document.getElementById('Results').innerHTML = '';
                } else {
                    activeGenreId = genre.id;
                    currentPage = 1;
                    renderGenreTags();
                    fetchDiscoverResults(genre.id, currentPage, type);
                }
            });
            container.appendChild(btn);
        });
    }

    function renderResults(items, type) {
        const resultsDiv = document.getElementById('Results');
        resultsDiv.innerHTML = '';
        const container = document.createElement('div');
        container.classList.add('element-container');
        items.forEach(item => {
            const releaseDate = item.release_date || item.first_air_date;
            const releaseYear = releaseDate ? releaseDate.split('-')[0] : 'N/A';
            const name = item.title || item.name;
            const card = document.createElement('div');
            card.classList.add('element');
            card.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500/${item.poster_path}" alt="${name} Poster">
                <div class="card-overlay">
                    <div class="card-title">${name}</div>
                    <div class="card-year">${releaseYear}</div>
                </div>`;
            card.addEventListener('click', () => openModal(item.id, type));
            container.appendChild(card);
        });
        resultsDiv.appendChild(container);
    }

    function fetchSearchResults(query, page, type) {
        fetch(`/search?query=${encodeURIComponent(query)}&page=${page}&type=${type}`)
            .then(response => response.json())
            .then(data => renderResults(data.results, type))
            .catch(error => console.error('Error fetching data:', error));
    }

    function fetchDiscoverResults(genreId, page, type) {
        fetch(`/discover?type=${type}&genre=${genreId}&page=${page}`)
            .then(response => response.json())
            .then(data => renderResults(data.results, type))
            .catch(error => console.error('Error fetching data:', error));
    }

    document.getElementById('searchButton').addEventListener('click', () => {
        const query = document.getElementById('searchInput').value.trim();
        if (!query) return;
        activeGenreId = null;
        currentPage = 1;
        renderGenreTags();
        fetchSearchResults(query, currentPage, getSelectedType());
    });

    document.getElementById('searchInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('searchButton').click();
    });

    document.querySelectorAll('input[name="type"]').forEach(radio => {
        radio.addEventListener('change', () => {
            activeGenreId = null;
            currentPage = 1;
            renderGenreTags();
            document.getElementById('Results').innerHTML = '';
        });
    });

    renderGenreTags();
});
