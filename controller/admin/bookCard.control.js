const BookCard = require("../../models/bookCard.model");
const { status } = require("http-status");
const { getFileUrl } = require("../../utils/CloudinaryConfig");

exports.allBookCard = async (req, res) => {
    try {
        const bookCard = await BookCard.find();
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
            data: bookCard
        })
    }
    catch (err) {
        res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};

exports.singleBookCard = async (req, res) => {
    try {
        const id= req.params.id;
        const bookCard = await BookCard.findById(id);
        if (!bookCard) {
            return res.status(status.NOT_FOUND).json({
                message: "Book card not found"
            });
        }
        bookCard.image = getFileUrl(bookCard.image);
        return res.status(status.OK).json({
            message: "Book card found",
            data: bookCard
        });
     }
    catch (err) {
        res.status(status.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
};