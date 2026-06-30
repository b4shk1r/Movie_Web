const express = require('express');
const { query, body, param, validationResult } = require('express-validator');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const MEDIA_TYPES = ['movie', 'tv'];

router.get('/',
    query('movieId').isInt({ min: 1 }).toInt(),
    query('mediaType').isIn(MEDIA_TYPES),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid movieId or mediaType' });

        const { movieId, mediaType } = req.query;
        const rows = db.prepare(`
            SELECT comments.id, comments.text, comments.created_at AS createdAt,
                   comments.user_id AS userId, users.email AS author
            FROM comments
            JOIN users ON users.id = comments.user_id
            WHERE comments.movie_id = ? AND comments.movie_type = ?
            ORDER BY comments.created_at DESC
        `).all(movieId, mediaType);

        const comments = rows.map(row => ({
            id: row.id,
            text: row.text,
            createdAt: row.createdAt,
            author: row.author,
            isOwner: req.user ? req.user.id === row.userId : false,
        }));
        res.json({ comments });
    });

router.post('/',
    requireAuth,
    body('movieId').isInt({ min: 1 }).toInt(),
    body('mediaType').isIn(MEDIA_TYPES),
    body('text').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be 1-1000 characters'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

        const { movieId, mediaType, text } = req.body;
        const result = db.prepare('INSERT INTO comments (user_id, movie_id, movie_type, text) VALUES (?, ?, ?, ?)')
            .run(req.user.id, movieId, mediaType, text);

        res.status(201).json({
            comment: {
                id: result.lastInsertRowid,
                text,
                createdAt: new Date().toISOString(),
                author: req.user.email,
                isOwner: true,
            },
        });
    });

router.delete('/:id',
    requireAuth,
    param('id').isInt({ min: 1 }).toInt(),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid comment id' });

        const comment = db.prepare('SELECT user_id AS userId FROM comments WHERE id = ?').get(req.params.id);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        if (comment.userId !== req.user.id) {
            return res.status(403).json({ error: 'You can only delete your own comments' });
        }

        db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
        res.json({ message: 'Deleted' });
    });

module.exports = router;
