const express = require('express');
const router = express.Router(); // 라우터로 활용 가능
const { addLike, removeLike } = require("../controller/LikeController");

router.use(express.json());


// 좋아요 추가
router.post('/:id', addLike);

// 좋아요 삭제
router.delete('/:id', removeLike);


module.exports = router;

