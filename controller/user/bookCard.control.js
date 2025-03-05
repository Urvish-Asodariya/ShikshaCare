const BookCard = require("../../models/bookCard.model");
const { status } = require("http-status");
const { getFileUrl } = require("../../utils/CloudinaryConfig");

exports.allBookCard = async (req, res) => {
    try {
        const limit = 6;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;
        const total = await BookCard.countDocuments();
        const bookCard = await BookCard.aggregate([
            { $skip: skip },
            { $limit: limit }
        ]);
        if (bookCard.length == 0) {
            return res.status(status.NOT_FOUND).json({
                message: "No book card found"
            });
        }
        bookCard.map((card) => {
            card.image = getFileUrl(card.image);
        });
        return res.status(status.OK).json({
            message: "Books card found",
            data: bookCard,
            total: total,
        })
    }
    catch (err) {
        res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};
