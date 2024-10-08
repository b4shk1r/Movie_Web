document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;

    function fetchSearchResults(query, page, type) {
        fetch(`/search?query=${encodeURIComponent(query)}&page=${page}&type=${type}`)
            .then(response => response.json())
            .then(data => {
                const searchResults = data.results;
                const resultsDiv = document.getElementById('Results');
                resultsDiv.innerHTML = '';
                const container = document.createElement('div');
                container.classList.add('element-container');
                searchResults.forEach(item => {
                    const releaseYear = item.release_date || item.first_air_date ?
                        (item.release_date || item.first_air_date).split('-')[0] : 'N/A';
                    const fontSize = calculateFontSize(item.title || item.name);
                    container.innerHTML += `
                        <div class="element">
                            <div id="title" style="font-size: ${fontSize}px;">${item.title || item.name}</div>
                            <p>Release Year: ${releaseYear}</p>
                            <img src="https://image.tmdb.org/t/p/w500/${item.poster_path}" alt="${item.title || item.name} Poster">
                        </div>`;
                });
                resultsDiv.appendChild(container);
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    document.getElementById('searchButton').addEventListener('click', () => {
        const query = document.getElementById('searchInput').value;
        const type = document.querySelector('input[name="type"]:checked').value; // Get the selected type (movie or tv)
        fetchSearchResults(query, currentPage, type);
    });

    function calculateFontSize(title) {
        const maxLength = 25;
        const baseFontSize = 25;
        if (title.length <= maxLength) {
            return baseFontSize;
        } else {
            return Math.floor((maxLength / (title.length || 1)) * baseFontSize);
        }
    }
});
