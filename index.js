const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const axios = require("axios");


const apiKey = 'a7de75d65d48cc545e8d1a0db6497c72';
const baseUrl = 'https://api.themoviedb.org/3/search/movie';
const apiKeyParam = `api_key=${apiKey}`;
const telegramBotToken = '6913484281:AAG_ETSb2O-h5dulAvxaAJVXyqQgUXt9ZHw';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));

app.post("/new-message", function(req, res) {
    const { message } = req.body;
    console.log("Received message:", message); // Log the received message

    if (!message || !message.text) {
        console.log("Invalid message or no text field");
        return res.end();
    }

    const chatId = message.chat.id;
    const movieName = message.text;
    console.log("Searching for movie:", movieName); // Log the movie name being searched

    const encodedMovieName = encodeURIComponent(movieName);
    const searchUrl = `${baseUrl}?query=${encodedMovieName}&${apiKeyParam}`;

    axios.get(searchUrl)
        .then(response => {
            const movies = response.data.results;
            if (movies.length > 0) {
                const movie = movies[0];
                sendMovieDetails(chatId, movie);
            } else {
                axios.post(
                    `https://api.telegram.org/bot6913484281:AAG_ETSb2O-h5dulAvxaAJVXyqQgUXt9ZHw/sendMessage`,
                    {
                        chat_id: chatId,
                        text: "Sorry, no movie found with that name.",
                    }
                )
                    .then(() => console.log("No movie found message sent to user"))
                    .catch(error => console.error("Error sending 'no movie found' message:", error));
            }
            res.end();
        })
        .catch(error => {
            console.error("Error fetching movie details:", error);
            res.end();
        });
});

function sendMovieDetails(chatId, movie) {
    const { title, release_date, original_language, overview } = movie;
    const message = `
        Name: ${title}
        Release Date: ${release_date}
        Original Language: ${original_language}
        Overview: ${overview}
    `;
    axios.post(
        `https://api.telegram.org/bot6913484281:AAG_ETSb2O-h5dulAvxaAJVXyqQgUXt9ZHw/sendMessage`,
        {
            chat_id: chatId,
            text: message,
        }
    )
        .then(response => {
            console.log("Movie details sent to user");
        })
        .catch(error => {
            console.error("Error sending movie details:", error);
        });
}

app.listen(3000, function() {
    console.log("Telegram app listening on port 3000!");
});
