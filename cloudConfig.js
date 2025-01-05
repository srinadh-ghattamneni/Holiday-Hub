const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'wanderlust_DEV', // Folder in Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png'], // Allowed file formats
    },
});

// File filter for multer
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG , JPEG, PNG files are allowed.'));
    }
};

// Multer upload setup
const upload = multer({
    storage: storage,
    limits: { fileSize: 1 * 1024 * 1024 }, // Limit file size to 1MB
    fileFilter: fileFilter,
});

module.exports = { cloudinary, storage, upload };
