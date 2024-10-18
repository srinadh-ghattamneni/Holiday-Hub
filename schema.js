const Joi = require("joi");

//Schema for listings
module.exports.listingSchema = Joi.object({ 
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.object({
            filename: Joi.string().allow(null, ''),  // filename is optional
            url: Joi.string().allow(null, ''),       // url is optional and can be null or an empty string
        }).required(),  // image object is still required
    }).required(),
});


module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(0).max(5),
        comment: Joi.string().required(),
    }).required(),
});