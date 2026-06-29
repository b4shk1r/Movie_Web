document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;

    function fetchTrendingMovies(page) {
        fetch(`/trending-movies?page=${page}`)
            .then(response => response.json())
            .then(data => {
                const trendingMovies = data.results.slice(0, 18);
                const trendingDiv = document.getElementById('Trending');
                trendingDiv.innerHTML = '';
                const moviesContainer = document.createElement('div');
                moviesContainer.classList.add('element-container');
                trendingMovies.forEach(movie => {
                    const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
                    const movieElement = document.createElement('div');
                    movieElement.classList.add('element');
                    movieElement.innerHTML = `
                        <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title} Poster">
                        <div class="card-overlay">
                            <div class="card-title">${movie.title}</div>
                            <div class="card-year">${releaseYear}</div>
                        </div>`;
                    movieElement.addEventListener('click', () => openModal(movie.id, 'movie'));
                    moviesContainer.appendChild(movieElement);
                });
                trendingDiv.appendChild(moviesContainer);
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    function fetchLatestMovie() {
        fetch(`/latest-movie`)
            .then(response => response.json())
            .then(data => {
                const latestDiv = document.getElementById('top');
                const releaseYear = data.release_date ? data.release_date.split('-')[0] : 'N/A';
                latestDiv.innerHTML = `
                    <div class="sidebar-label">Latest</div>
                    <div class="sidebar-title">${data.title}</div>
                    <div class="sidebar-year">${releaseYear}</div>
                    <img class="sidebar-poster" src="https://image.tmdb.org/t/p/w500/${data.poster_path}" alt="${data.title} Poster">`;
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    fetchTrendingMovies(currentPage);
    fetchLatestMovie();

    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchTrendingMovies(currentPage);
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        currentPage++;
        fetchTrendingMovies(currentPage);
    });
});
