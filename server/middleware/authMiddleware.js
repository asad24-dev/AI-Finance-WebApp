// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: `https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_b7ouuqkHr/.well-known/jwks.json`,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, getKey, {
    algorithms: ['RS256'],
    issuer: `https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_b7ouuqkHr`,
  }, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized', error: err.message });
    }
    // Extract userId from the token (Cognito uses 'sub' as the user ID)
    req.user = {
      ...decoded,
      userId: decoded.sub || decoded.userId
    };
    next();
  });
};

module.exports = { verifyToken };
