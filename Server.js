const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();
const port = 3000;
require('dotenv').config();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
const apiKey = process.env.TMDB_API_KEY;

// Search for movies and TV shows
app.get('/search', async (req, res) => {
    try {
        const query = req.query.query || ''; // Get the search query from request parameters
        const page = req.query.page || 1; // Get the page number from request parameters, default to page 1
        const type = req.query.type || 'movie'; // Get the type of search (movie or tv), default to 'movie'

        let url = '';
        if (type === 'movie') {
            url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=${page}`;
        } else if (type === 'tv') {
            url = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=${page}`;
        } else {
            return res.status(400).json({ error: 'Invalid type parameter' });
        }

        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/trending-movies', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const url = `https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}&page=${page}`;
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/latest-movie', async (req, res) => {
    try {
        const url = `https://api.themoviedb.org/3/movie/latest?api_key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/airing-today', async (req, res) => {
    try {
        const url = `https://api.themoviedb.org/3/tv/airing_today?api_key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/popular-shows', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const url = `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&page=${page}`;
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'Main.html'));
});

app.get('/Shows.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'Shows.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
