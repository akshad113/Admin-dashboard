const express = require('express')
const router = express.Router();
const { createCategorie, getCategories } = require('../controller/categorieController')


//create the categorie

router.get('/', getCategories)
router.post('/create', createCategorie)




module.exports = router;
