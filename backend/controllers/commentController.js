const Task = require("../models/Task");

// add comment--------------//
const addComment = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({
                message: "Comment text is required",
            });
        }

        const task = await Task.findOne({
            _id: req.params.id,
            createdBy: req.user._id,
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        task.comments.push({
            user: req.user._id,
            text: text.trim(),
        });

        await task.save();

        const updatedTask = await Task.findById(task._id)
            .populate("createdBy", "username email")
            .populate("assignedTo", "username email")
            .populate("participants", "username email")
            .populate("comments.user", "username email");

        res.status(201).json({
            message: "Comment added successfully",
            comment:
                updatedTask.comments[
                    updatedTask.comments.length - 1
                ],
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to add comment",
            error: error.message,
        });
    }
};


// get comments-------------
const getComments = async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            createdBy: req.user._id,
        }).populate(
            "comments.user",
            "username email"
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        res.status(200).json({
            count: task.comments.length,
            comments: task.comments,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch comments",
            error: error.message,
        });
    }
};


// deleting comments--------//
const deleteComment = async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            createdBy: req.user._id,
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const comment = task.comments.id(
            req.params.commentId
        );

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found",
            });
        }

        // Only the comment creator can delete it-------//
        if (
            comment.user.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message:
                    "You can only delete your own comments",
            });
        }

        comment.deleteOne();

        await task.save();

        res.status(200).json({
            message:
                "Comment deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message:
                "Failed to delete comment",
            error: error.message,
        });
    }
};


module.exports = {
    addComment,
    getComments,
    deleteComment,
};