const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();

require('./db');
const { attachUser } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const likesRoutes = require('./routes/likes');
const commentsRoutes = require('./routes/comments');

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set');

app.use(express.static(path.join(__dirname, 'Public')));
app.use(express.json());
app.use(cookieParser());
app.use(attachUser);
const apiKey = process.env.TMDB_API_KEY;

app.use('/api/auth', authRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/comments', commentsRoutes);

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

app.get('/movie-details', async (req, res) => {
    try {
        const id = req.query.id;
        const type = req.query.type === 'tv' ? 'tv' : 'movie';
        const url = `https://api.themoviedb.org/3/${type}/${id}?api_key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/discover', async (req, res) => {
    try {
        const type = req.query.type === 'tv' ? 'tv' : 'movie';
        const genre = req.query.genre || '';
        const page = req.query.page || 1;
        let url = `https://api.themoviedb.org/3/discover/${type}?api_key=${apiKey}&page=${page}&sort_by=popularity.desc`;
        if (genre) url += `&with_genres=${genre}`;
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
