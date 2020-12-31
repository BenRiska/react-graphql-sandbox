const { AuthenticationError } = require('apollo-server');

const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

module.exports = (context) => {
  // get token from request header
  const authHeader = context.req.headers.authorization;

  // check auth is correct
  if (authHeader) {
    // Bearer ....
    const token = authHeader.split('Bearer ')[1];

    // if token is valid return user, otherwise throw error
    if (token) {
      try {
        const user = jwt.verify(token, SECRET_KEY);
        return user;
      } catch (err) {
        throw new AuthenticationError('Invalid/Expired token');
      }
    }

    throw new Error("Authentication token must be 'Bearer [token]");
  }

  throw new Error('Authorization header must be provided');
};