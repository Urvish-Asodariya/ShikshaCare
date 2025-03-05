const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "ShikshaCare",
        format: async (req, file) => {
            const Formats = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp', 'svg'];
            const extension = file.mimetype.split('/')[1].toLowerCase();
            return Formats.includes(extension) ? extension : 'png';
        },
        public_id: (req, file) => file.originalname.split('.')[0],
    },
});

exports.getFileUrl = (public_id) => {
    const fileUrl = cloudinary.url(public_id)
    return fileUrl;
};

exports.upload = multer({ storage: storage });