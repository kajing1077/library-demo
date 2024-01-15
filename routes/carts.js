const express = require('express');
const router = express.Router(); // 라우터로 활용 가능
const { addToCart, getCartItems, removeCartItem } = require("../controller/CartController");

router.use(express.json());

// 장바구니 담기
router.post('/', addToCart);


// 1. 장바구니 조회 / 2. 선택된 장바구니 아이템 목록 조회
router.get('/', getCartItems);


// 장바구니 도서 삭제
router.delete('/:id', removeCartItem);


module.exports = router;