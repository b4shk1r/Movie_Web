document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1; // Initialize current page

    // Function to fetch trending movies based on page number
    function fetchTrendingMovies(page) {
        fetch(`/trending-movies?page=${page}`)
            .then(response => response.json())
            .then(data => {
                const trendingMovies = data.results;
                const trendingDiv = document.getElementById('Trending');
                trendingDiv.innerHTML = '';
                const moviesContainer = document.createElement('div');
                moviesContainer.classList.add('element-container'); // Add a class for styling
                trendingMovies.forEach(movie => {
                    const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
                    const movieElement = document.createElement('div');
                    movieElement.classList.add('element');
                    // Adjust font size based on the length of the title
                    const fontSize = calculateFontSize(movie.title);

                    movieElement.innerHTML = `
                        <div>
                            <div id="title" style="font-size: ${fontSize}px;">${movie.title}</div>
                            <p>Release Year: ${releaseYear}</p>
                            <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title} Poster">
                        </div>`;
                    moviesContainer.appendChild(movieElement);
                });

                trendingDiv.appendChild(moviesContainer);
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    fetchTrendingMovies(currentPage);

    // Event listener for previous page button
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchTrendingMovies(currentPage);
        }
    });

    // Event listener for next page button
    document.getElementById('nextPage').addEventListener('click', () => {
        currentPage++;
        fetchTrendingMovies(currentPage);
    });

    function calculateFontSize(title) {
        const maxLength = 25; // Maximum length before reducing font size
        const baseFontSize = 25; // Base font size
        // Calculate font size based on title length
        if (title||title.length <= maxLength) {
            return baseFontSize;
        } else {
            return Math.floor((maxLength / title.length) * baseFontSize);
        }
    }
});
