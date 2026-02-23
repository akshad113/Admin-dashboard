const express = require('express')
const router = express.Router();
const validate = require('../../middleware/validate');
const { categorySchemas } = require('../../validation/schemas');
const {
  createCategorie,
  getCategories,
  updateCategorie,
  deleteCategorie,
} = require('../controller/categorieController')


//create the categorie

router.get('/', getCategories)
router.post('/create', validate(categorySchemas.createCategory), createCategorie)
router.put('/:id', validate(categorySchemas.updateCategory), updateCategorie)
router.delete('/:id', validate(categorySchemas.deleteCategory), deleteCategorie)




module.exports = router;
