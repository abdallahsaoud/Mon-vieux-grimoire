const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const multer = require('../middleware/multer-config');
const resizeImage = require('../middleware/sharp-config');


const bookCtrl = require('../controllers/books')

router.get('/', bookCtrl.getAllBook)
router.get('/bestrating', bookCtrl.getBestrating)
router.get('/:id', bookCtrl.getOneBook);
router.post('/', auth, multer, resizeImage, bookCtrl.postNewBook)
router.put('/:id', auth, multer, resizeImage, bookCtrl.modifyBook)
router.delete('/:id', auth, bookCtrl.deleteBook)
router.post('/:id/rating', auth, bookCtrl.ratingBook)

module.exports = router;