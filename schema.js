const Joi = require("joi");

//Schema for listings
module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().max(60).required(),
        description: Joi.string().max(600).required(),
        location: Joi.string().max(100).required(),
        country: Joi.string().max(60).required(),
        price: Joi.number().min(0).max(100000000).required(),
        image: Joi.object({
            filename: Joi.string().allow(null, ''),  // filename is optional
            url: Joi.string().allow(null, ''),       // url is optional and can be null or an empty string
        }), 
    }).required(),
});


module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(0).max(5),
        comment: Joi.string().max(350).required(),
    }).required(),
});

module.exports.userSchema = Joi.object({
    username: Joi.string().trim().min(4).max(30).pattern(new RegExp('^[a-zA-Z0-9 ]+$')).required(),
    email: Joi.string().email().max(60).required(),
    password: Joi.string().min(5).max(60).pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9]).+$')).required(),
});

