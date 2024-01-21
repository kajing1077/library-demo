const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');

dotenv.config();

const ensureAuthorization = (req, res) => {
    try {
        let accessToken = req.cookies.token;
        console.log("received Access Token:", accessToken);

        if (!accessToken) {
            throw new ReferenceError("Access Token must be provided");
        }

        let decodedAccessToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        console.log("decoded Access Token:", decodedAccessToken);

        return decodedAccessToken;

    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            // 액세스 토큰이 만료된 경우
            console.error("Access Token expired");

            // 여기에서 리프레시 토큰을 검증하고 새로운 액세스 토큰을 발급
            const refreshToken = req.cookies.refreshToken;

            if (refreshToken) {
                try {
                    let decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

                    // 리프레시 토큰이 유효할 때의 처리
                    // 여기에서 새로운 액세스 토큰을 발급하고 클라이언트에게 전달하는 등의 작업 수행
                    const newAccessToken = jwt.sign({
                        id: decodedRefreshToken.id,
                        email: decodedRefreshToken.email,
                    }, process.env.ACCESS_TOKEN_SECRET, {
                        expiresIn: '2m',
                        issuer: "kim"
                    });

                    // 액세스 토큰을 클라이언트에게 전달
                    res.cookie("token", newAccessToken, {
                        httpOnly: true,
                    });

                    console.log("New Access Token:!!!!!!!!!!!!!!!", newAccessToken);

                    // 리프레시 토큰이 유효한 경우 반환
                    return decodedRefreshToken;
                } catch (refreshTokenError) {
                    // 리프레시 토큰 검증 오류
                    if (refreshTokenError instanceof jwt.TokenExpiredError) {
                        console.error("다시 로그인 해주세요.");
                        throw new Error("Refresh Token has expired");
                    } else {
                        console.error("Error during refresh token verification:", refreshTokenError.name, "-", refreshTokenError.message);
                        throw new Error("Refresh Token verification failed");
                    }
                }
            } else {
                // 리프레시 토큰이 없을 때의 처리
                throw new ReferenceError("Refresh Token must be provided");
            }
        } else {
            console.error("Error during JWT verification:", err.name, "-", err.message);
            return { error: true, message: err.message };
        }
    }
}


module.exports = ensureAuthorization;
