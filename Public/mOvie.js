require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fetch = require('node-fetch');
const readline = require('readline');

const apiKey = process.env.TMDB_API_KEY;
const baseUrl = 'https://api.themoviedb.org/3/search/movie';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Enter the name of the movie you want to search for: ', (movieName) => {
    const searchUrl = `${baseUrl}?query=${encodeURIComponent(movieName)}&api_key=${apiKey}`;

    fetch(searchUrl)
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
