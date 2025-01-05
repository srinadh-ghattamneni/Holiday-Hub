const rateLimit = require("express-rate-limit");
const ExpressError = require("./ExpressError.js"); // Adjust the path if needed

// Custom Rate Limiter Function
const customRateLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        keyGenerator: (req) => req.ip, // Rate limit based on IP address
        handler: (req, res, next) => {
            const error = new ExpressError(429, message);
            next(error);
        }
    });
};

module.exports = customRateLimiter;
