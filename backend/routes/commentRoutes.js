const express = require("express");

const {
    addComment,
    getComments,
    deleteComment,
} = require("../controllers/commentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

// Add comment
router.post("/:id/comments", addComment);

// Get comments
router.get("/:id/comments", getComments);

// Delete comment
router.delete(
    "/:id/comments/:commentId",
    deleteComment
);

module.exports = router;