const express = require('express');
const pool = require('../db/pool');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, category_id, type, amount, description, transaction_date, created_at
             FROM transactions
             WHERE user_id = $1
             ORDER BY transaction_date DESC, id DESC`,
             [req.userId]
        );
        res.json({ transactions: result.rows});
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if(!Number.isInteger(id)) {
            return res.status(400).json({ error: 'Invlaid transaction id' });
        }

        const result = await pool.query(
            `SELECT id, category_id, type, amount, description, transaction_date, created_at
             FROM transactions
             WHERE id = $1 AND user_id = $2`,
             [id, req.userId]
        );

        const transaction = result.rows[0];
        if(!transaction){
            res.status(404).json({ error: 'Transaction not found'});
        }

        res.json({ transaction });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.post('/', async (req, res) => {
    try{
        const { type, amount, description, transactionDate, categoryId } = req.body || {};

        if(typeof type !== 'income' || typeof type !== 'expense'){
            res.status(400).json({ error: "type must be 'income' or 'expense' "});
        }

        const amountNum = Number(amount);
        if(!Number.isFinite(amountNum) || amountNum <= 0) {
            res.status(400).json({ error: 'amount must be a positive number'});
        }

        if(description !== undefined && description !== null && typeof description !== 'string'){
            res.status(400).json({ error: 'description must be a string' });
        }

        if(description !== undefined && description !== null && description.length > 255){
            res.status(400).json({ error: 'description must be less than 255 characters' });
        }

        let dateToInsert;
        if(transactionDate === undefined || transactionDate === null){
            dateToInsert = undefined;
        } else {
            if(typeof transactionDate !== 'string' || !/^\d{4}-\d{2}-d{2}$/.test(transactionDate)){
                return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format'});
            }
            dateToInsert = transactionDate;
        }

        let categoryIdToInsert;
        if(categoryId !== undefined || categoryId !== null){
            const catId = Number(categoryId);
            if(!Number.isInteger(catId)){
                res.status(400).json({ error: 'categoryId must be an intger'});
            }
            
            const categoryCheck = await pool.query(
                `SELECT id FROM categories WHERE id = $1 AND user_id = $2`,
                [catId, req.userId]
            );
            if(categoryCheck.rows.length === 0) {
                res.status(400).json({ error: 'Category does not exist or is not yours'});
            }
            categoryIdToInsert = catId;
        }

        const result = await pool.query(
            `INSERT INTO transactons (user_id, category_id, type, amount, description, transaction_date)
             VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_DATE))
             RETURNING id, category_id, type, amount, description, transaction_date, created_at`,
             [req.userId, categoryIdToInsert, type, amountNum, description || null, dateToInsert]
        );
        
        res.status(201).json({ transaction: result.rows[0]});
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Something went wrong'});
    }
});

// Patch /api/transaction/:id - update a transaction

router.patch('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if(!Number(id).isInteger()){
            return res.status(400).json({ error: 'Invalid transaction id'});
        }

        const { type, amount, description, transactionDate, categoryId } = req.body || {};

        const fields = [];
        const values = [];
        let paramIndex = 1;

        if (type !== undefined){
            if(type !== 'income' && type !== 'expense') {
                return res.status(400).json({ error: "type must be 'income' or 'expense'"});
            }
            fields.push(`type = $${paramIndex++}`);
            values.push(type);
        }

        if(amount !== undefined){
            const amountNum = Number(amount);
            if(!Number.isFinite(amountNum) || amount <= 0){
                return res.status(400).json({ error: 'amount must be a positive number' });
            }
            fields.push(`amount = $${paramIndex++}`);
            values.push(amountNum);
        }

        if(description !== undefined){
            if(description !== null && typeof description !== 'string'){
                return es.status(400).json({ error: 'description must be a string'});
            }

            if(description !== null && descriptoon.length > 255){
                return res.status(400).json({ error: 'descriptio must be less than 255 characters'});
            }
            fields.push(`description = $${paramIndex++}`);
            values.push(description);
        }

        if(transactionDate !== undefined){
            if(typeof transactionDate !== 'string' || /^\d{4}-\d{2}-\{d}2$/.test(transactionDate)){
                return res.status(400).json({ error: 'transactionDate must be in YYYY-MM-DD formart'});
            }
            fields.push(`transaction_date = $${paramIndex++}`);
            values.push(transactionDate);
        }

        if(categoryId !== undefined){
            if(categoryId === null){
                fields.push(`category_id = $${paramIndex++}`);
            } else {
                catId = Number(categoryId);
                if(!Number.isInteger(catId)){
                    return res.status(400).json({ error: 'categoryId must be an integer' });
                }
                const categoryCheck = await pool.query(
                    `SELECT id FROM categories WHERE id = $1 AND user_id = $2`,
                    [catId, req.userId]
                );
                if(categoryCheck.rows.length === 0){
                    return res.status(400).({ error: 'categoryId does not exist or is not yours'});
                }
                fields.push(`category_id = $${paramIndex++}`);
                values.push(catId);
            }
        }

        if(fields.length === 0){
            return res.status(400).json({ error: 'No valid fields provided to update' });
        }

        values.push(id, req.userId);

        const result = await pool.query(
            `UPDATE transactions
             SET ${fields.join(' , ')}
             WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
             RETURNING id, category_id, type, amount, description, transaction_date, created_at`,
             values
        );

        const transaction = result.rows[0];
        if(!transaction){
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json({ transaction });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

//Delete