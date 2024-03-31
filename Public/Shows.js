//When Html is first called in
document.addEventListener('DOMContentLoaded',()=>{
    let currentPage=1;
    function fetchPopularShows(page){
        fetch(`/popular-shows?page=${page}`)
            .then(response =>response.json() )
            .then(data=>{
                console.log(data);
            const popularShow=data.results;
            const popularDiv=document.getElementById('popular');
            popularDiv.innerHTML='';
            const showContainer=document.createElement('div');
            showContainer.classList.add('shows-container');
            popularShow.forEach(show=>{
                const releaseYear = show.first_air_date ? show.first_air_date.split('-')[0] : 'N/A';
                const showElement=document.createElement('div');
                showElement.classList.add('show');
                const fontSize = calculateFontSize(show.name);
                showElement.innerHTML = `
                    <div>
                        <div id="title" style="font-size: ${fontSize}px;">${show.name}</div>
                        <p>Release Year: ${releaseYear}</p>
                        <img src="https://image.tmdb.org/t/p/w500/${show.poster_path}" alt="${show.name} Poster">
                    </div>`;
                showContainer.appendChild(showElement);
            })
            popularDiv.appendChild(showContainer);
        })
            .catch(error => console.error('Error fetching data:', error));
    }
    fetchPopularShows(currentPage);
    document.getElementById('nextPage').addEventListener("click", ()=>{
        currentPage++;
        fetchPopularShows(currentPage);
    })
    document.getElementById('prevPage').addEventListener("click",()=>{
        currentPage--;
        fetchPopularShows(currentPage)
    })
    function calculateFontSize(title) {
        const maxLength = 25; // Maximum length before reducing font size
        const baseFontSize = 25; // Base font size
        // Calculate font size based on title length
        if (title.length <= maxLength) {
            return baseFontSize;
        } else {
            return Math.floor((maxLength / (title ? title.length : 1)) * baseFontSize);
        }
    }
});