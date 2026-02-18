const express = require('express')
const router = express.Router();
const {
  createCategorie,
  getCategories,
  updateCategorie,
  deleteCategorie,
} = require('../controller/categorieController')


//create the categorie

router.get('/', getCategories)
router.post('/create', createCategorie)
router.put('/:id', updateCategorie)
router.delete('/:id', deleteCategorie)




module.exports = router;
