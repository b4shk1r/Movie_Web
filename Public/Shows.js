document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;

    function fetchPopularShows(page) {
        fetch(`/popular-shows?page=${page}`)
            .then(response => response.json())
            .then(data => {
                const popularShow = data.results.slice(0, 18);
                const popularDiv = document.getElementById('popular');
                popularDiv.innerHTML = '';
                const showContainer = document.createElement('div');
                showContainer.classList.add('element-container');
                popularShow.forEach(show => {
                    const releaseYear = show.first_air_date ? show.first_air_date.split('-')[0] : 'N/A';
                    const showElement = document.createElement('div');
                    showElement.classList.add('element');
                    showElement.innerHTML = `
                        <img src="https://image.tmdb.org/t/p/w500/${show.poster_path}" alt="${show.name} Poster">
                        <div class="card-overlay">
                            <div class="card-title">${show.name}</div>
                            <div class="card-year">${releaseYear}</div>
                        </div>`;
                    showElement.addEventListener('click', () => openModal(show.id, 'tv'));
                    showContainer.appendChild(showElement);
                });
                popularDiv.appendChild(showContainer);
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    function fetchAiringToday() {
        fetch('/airing-today')
            .then(response => response.json())
            .then(data => {
                const airingDiv = document.getElementById('top');
                const show = data.results ? data.results[0] : null;
                if (show) {
                    const airDate = show.first_air_date ? show.first_air_date.split('-')[0] : 'N/A';
                    airingDiv.innerHTML = `
                        <div class="sidebar-label">Airing Today</div>
                        <div class="sidebar-title">${show.name}</div>
                        <div class="sidebar-year">${airDate}</div>
                        <img class="sidebar-poster" src="https://image.tmdb.org/t/p/w500/${show.poster_path}" alt="${show.name} Poster">`;
                    airingDiv.style.cursor = 'pointer';
                    airingDiv.onclick = () => openModal(show.id, 'tv');
                } else {
                    airingDiv.innerHTML = '<p style="padding: 14px; color: #9ca3af;">No shows available for today.</p>';
                }
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    fetchPopularShows(currentPage);
    fetchAiringToday();

    document.getElementById('nextPage').addEventListener('click', () => {
        currentPage++;
        fetchPopularShows(currentPage);
    });

    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchPopularShows(currentPage);
        }
    });
});
