const express = require('express');
const pool = require('../db/pool');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name
             FROM categories
             WHERE user_id = $1
             ORDER BY name`,
             [req.userId]
        );
        res.json({ categories: result.rows});
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name } = req.body || {};

        if(name === null || name === undefined){
            return res.status(400).json({ error: 'name must not be null or undefined'});
        }

        if(name !== null && name !== undefined && typeof name !== 'string'){
            return res.status(400).json({ error: 'name must be a string' });
        }

        if(name !== null && name !== undefined && name.length > 100){
            return res.status(400).json({ error: 'name must be shorter then 100 characters'});
        }

        const result = await pool.query(
            `INSERT INTO categories (user_id, name)
            VALUES($1, $2)
            RETURNING id, name`,
            [req.userId, name]
        );
        
        res.status(201).json({ category: result.rows[0] });
    } catch (err) {
        if(err.code === '23505'){
            return res.status(409).json({ error: 'Category name already exists'})
        }
        console.error(err);
        res.status(500).json({ error: 'Something went wrong'});
    }
});

router.patch('/:id', async (req, res) => {
    try{ 
        const id = Number(req.params.id);
        if(!Number.isInteger(id)){
            return res.status(400).json({ error: 'Invalid category id'});
        }

        const { name } = req.body || {};

        const fields = [];
        const values = [];
        let paramIndex = 1;

        if(name === null || name === undefined){
            return res.status(400).json({ error: 'name must not be null or undefined'});
        }

        if(name !== null && name !== undefined && typeof name !== 'string'){
            return res.status(400).json({ error: 'name must be a string'});
        }

        if(name !== null && name !== undefined && name.length > 100){
            return res.status(400).json({ error: 'name must be less then 100 characters'});
        }

        fields.push(`name = $${paramIndex++}`);
        values.push(name);

        values.push(id, req.userId);

        const result = await pool.query(
            `UPDATE categories
            SET ${fields.join(', ')}
            WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
            RETURNING id, name`,
            values

        );

        const category = result.rows[0];
        if(!category){
            return res.status(404).json({ error: 'Category not found'});
        }

        res.json({ category });
    } catch (err) {
        if(err.code === '23505'){
            return res.status(409).json({ error: 'Category name already exists'});
        }
        console.error(err);
        return res.status(500).json({ error: 'Something went wrong' });
    }
})