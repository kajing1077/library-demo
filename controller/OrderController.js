const { StatusCodes } = require("http-status-codes");
const mariadb = require("mysql2/promise");
const { orderQueries } = require("../utils/dbQueries");
const ensureAuthorization = require('../auth');
const jwt = require("jsonwebtoken");
const { sendResponse } = require("../utils/responseHandler");


const order = async (req, res) => {
    const conn = await mariadb.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'Bookshop',
        dateStrings: true,
    });

    let authorization = ensureAuthorization(req, res);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            'message': '로그인 세션이 만료되었습니다.'
        });
    } else if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            'message': '잘못된 토큰입니다.'
        });
    } else { // 유효한 토큰이면
        const { items, delivery, totalQuantity, totalPrice, firstBookTitle } = req.body;


        // delivery 테이블 삽입
        let sql = orderQueries.insertNewDeliveryInfo;
        let values = [delivery.address, delivery.receiver, delivery.contact];
        let [results] = await conn.execute(sql, values);

        let delivery_id = results.insertId;


        // orders 테이블 삽입
        sql = orderQueries.insertNewOrder;
        values = [firstBookTitle, totalQuantity, totalPrice, authorization.id, delivery_id];
        [results] = await conn.execute(sql, values);
        let order_id = results.insertId;



        // items를 가지고, 장바구니에서 book_id, quantity 조회
        sql = orderQueries.selectCartItemsForOrder;
        let [orderItems, fields] = await conn.query(sql, [items]);

        // orderedBook 테이블 삽입
        sql = orderQueries.insertOrderedBooks;

        values = []; // 초기화.
        orderItems.forEach((item) => {
            values.push([order_id, item.book_id, item.quantity]);
        })

        //results = await conn.query(sql, [values]);
        let result = await deleteCartItems(conn, items);

        return sendResponse(res, StatusCodes.OK, result);
    }
};
const deleteCartItems = async (conn, items) => {
    let sql = orderQueries.removeAllSelectedCartItems;

    let result = await conn.query(sql, [items]);
    return result;

}

const getOrders = async (req, res) => {
    const authorization = ensureAuthorization(req, res);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            'message': '로그인 세션이 만료되었습니다.'
        });
    } else if (authorization instanceof jwt.JsonWebTokenError || authorization instanceof ReferenceError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            'message': '잘못된 토큰입니다.'
        });
    } else { // 유효한 토큰이면
        const conn = await mariadb.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'Bookshop',
            dateStrings: true,
        });

        let sql = orderQueries.fetchOrdersByUserId;


        //let sql = orderQueries.fetchOrdersByUserId;
        let [rows, field] = await conn.query(sql, [authorization.id]);

        rows = rows.map(result => convertSnakeToCamel(result));

        return sendResponse(res, StatusCodes.OK, rows);
    }
};
const getOrderDetail = async (req, res) => {

    const authorization = ensureAuthorization(req, res);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            'message': '로그인 세션이 만료되었습니다.'
        });
    } else if (authorization instanceof jwt.JsonWebTokenError || authorization instanceof ReferenceError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            'message': '잘못된 토큰입니다.'
        });
    } else { // 유효한 토큰이면
        const orderId = req.params.id;
        const conn = await mariadb.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'Bookshop',
            dateStrings: true,
        });

        let sql = orderQueries.fetchOrderDetailsByIdAndUserId;
        let values = [orderId, authorization.id];
        let [rows, fields] = await conn.query(sql, values);


        rows = rows.map(result => convertSnakeToCamel(result));
        console.log(rows);

        return sendResponse(res, StatusCodes.OK, rows);
    }
}


const convertSnakeToCamel = (obj) => {
    const camelObj = {};
    for (const key in obj) {
        const camelKey = key.replace(/_(\w)/g, (_, letter) => letter.toUpperCase());
        camelObj[camelKey] = obj[key];
    }
    return camelObj;
};

module.exports = {
    order,
    getOrders,
    getOrderDetail
}