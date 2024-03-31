const express = require('express');
const fetch = require('node-fetch');
const path = require('path'); // Import the path module
const app = express();
const port = 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/trending-movies', async (req, res) => {
    try {
        const apiKey = 'a7de75d65d48cc545e8d1a0db6497c72';
        const page = req.query.page || 1; // Get the page number from the request query parameters, defaulting to page 1
        const url = `https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}&page=${page}`;
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route handler for the root URL
app.get('/', (req, res) => {
    // Send the index.html file
    res.sendFile(path.join(__dirname, 'Public', 'Main.html'));
});
app.get('/Shows.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'Shows.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});