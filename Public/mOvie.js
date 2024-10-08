const fetch = require('node-fetch');
const readline = require('readline');

const apiKey = 'a7de75d65d48cc545e8d1a0db6497c72';
const baseUrl = 'https://api.themoviedb.org/3/search/movie';
const apiKeyParam = `api_key=${apiKey}`;
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter the name of the movie you want to search for: ', (movieName) => {
    const encodedMovieName = encodeURIComponent(movieName);
    const searchUrl = `${baseUrl}?query=${encodedMovieName}&${apiKeyParam}`;

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhN2RlNzVkNjVkNDhjYzU0NWU4ZDFhMGRiNjQ5N2M3MiIsInN1YiI6IjY2MDBkZWNiMzc4MDYyMDE2MjM5YmQ0YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sBjU3nj04RMz68-T3tYQ-E9CgwcBujRil-cNf-6BECQ'
        }
    };

    fetch(searchUrl, options)
        .then(res => res.json())
        .then(json => {
            json.results.forEach(movie => {
                const { title, release_date, original_language, overview } = movie;
                console.log("Name:", title);
                console.log("Release Date:", release_date);
                console.log("Original Language:", original_language);
                console.log("Overview:", overview);
                console.log("----------------------------------------");
            });
            rl.close();
        })
        .catch(err => {
            console.error('error:' + err);
            rl.close();
        });
});

