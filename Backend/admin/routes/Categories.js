const express = require('express')
const router = express.Router();
const {
  createCategorie,
  getCategories,
  updateCategorie,
  deleteCategorie,
} = require('../controller/categorieController')
const { validateBody, validateParams } = require('../../middleware/validate');
const { categorySchema, idParamSchema } = require('../../validation/schemas');


//create the categorie

router.get('/', getCategories)
router.post('/create', validateBody(categorySchema), createCategorie)
router.put('/:id', validateParams(idParamSchema), validateBody(categorySchema), updateCategorie)
router.delete('/:id', validateParams(idParamSchema), deleteCategorie)




module.exports = router;
