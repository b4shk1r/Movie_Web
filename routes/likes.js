const express = require('express');
const { query, body, validationResult } = require('express-validator');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const MEDIA_TYPES = ['movie', 'tv'];

function getLikeCount(movieId, movieType) {
    return db.prepare('SELECT COUNT(*) AS count FROM likes WHERE movie_id = ? AND movie_type = ?')
        .get(movieId, movieType).count;
}

router.get('/',
    query('movieId').isInt({ min: 1 }).toInt(),
    query('mediaType').isIn(MEDIA_TYPES),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid movieId or mediaType' });

        const { movieId, mediaType } = req.query;
        const count = getLikeCount(movieId, mediaType);
        let liked = false;
        if (req.user) {
            liked = !!db.prepare('SELECT 1 FROM likes WHERE user_id = ? AND movie_id = ? AND movie_type = ?')
                .get(req.user.id, movieId, mediaType);
        }
        res.json({ count, liked });
    });

router.post('/toggle',
    requireAuth,
    body('movieId').isInt({ min: 1 }).toInt(),
    body('mediaType').isIn(MEDIA_TYPES),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid movieId or mediaType' });

        const { movieId, mediaType } = req.body;
        const existing = db.prepare('SELECT id FROM likes WHERE user_id = ? AND movie_id = ? AND movie_type = ?')
            .get(req.user.id, movieId, mediaType);

        let liked;
        if (existing) {
            db.prepare('DELETE FROM likes WHERE id = ?').run(existing.id);
            liked = false;
        } else {
            db.prepare('INSERT INTO likes (user_id, movie_id, movie_type) VALUES (?, ?, ?)')
                .run(req.user.id, movieId, mediaType);
            liked = true;
        }
        res.json({ liked, count: getLikeCount(movieId, mediaType) });
    });

module.exports = router;
