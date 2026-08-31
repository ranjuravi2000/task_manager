const Task = require("../models/Task");

// -----------Create a new task-----------//

const createTask = async (req, res) => {
    try {
        const { title, description, status, priority, dueDate } = req.body;

        const task = await Task.create({
            title,
            description,
            status,
            priority,
            dueDate,
            createdBy: req.user._id,
        });

        res.status(201).json({
            message: "Task created successfully",
            task,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create task",
            error: error.message,
        });
    }
};


// ----------Get all tasks of logged-in user-----------

const getTasks = async (req, res) => {
    try {
        const {
            search,
            status,
            priority,
            page = 1,
            limit = 10,
            sort = "newest",
        } = req.query;

       
        const query = {
            createdBy: req.user._id,
        };

        // ------Search by title or description------------
        if (search) {
            query.$or = [
                {
                    title: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    description: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        // --------Filter by status--------
        if (status) {
            query.status = status;
        }

        // ----------Filter by priority--------
        if (priority) {
            query.priority = priority;
        }

        //------------ Pagination----------
        const currentPage = Math.max(Number(page), 1);
        const itemsPerPage = Math.max(Number(limit), 1);
        const skip = (currentPage - 1) * itemsPerPage;

        //------- Sorting---------
        let sortOption = { createdAt: -1 };

        if (sort === "oldest") {
            sortOption = { createdAt: 1 };
        }

        // -----Get total matching tasks---------
        const totalTasks = await Task.countDocuments(query);

        // ------Get paginated tasks----
        const tasks = await Task.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(itemsPerPage);

        // Calculate total pages--------
        const totalPages = Math.ceil(totalTasks / itemsPerPage);

        res.status(200).json({
            count: tasks.length,
            totalTasks,
            currentPage,
            totalPages,
            limit: itemsPerPage,
            hasNextPage: currentPage < totalPages,
            hasPreviousPage: currentPage > 1,
            sort,
            tasks,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch tasks",
            error: error.message,
        });
    }
};


// --------Get single task------------

const getTask = async (req, res) => {
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

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch task",
            error: error.message,
        });
    }
};


// Update task------

const updateTask = async (req, res) => {
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

        const { title, description, status, priority, dueDate } = req.body;

        task.title = title ?? task.title;
        task.description = description ?? task.description;
        task.status = status ?? task.status;
        task.priority = priority ?? task.priority;
        task.dueDate = dueDate ?? task.dueDate;

        const updatedTask = await task.save();

        res.status(200).json({
            message: "Task updated successfully",
            task: updatedTask,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update task",
            error: error.message,
        });
    }
};


//   ----------Delete task---------
const deleteTask = async (req, res) => {
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

        await task.deleteOne();

        res.status(200).json({
            message: "Task deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete task",
            error: error.message,
        });
    }
};


module.exports = {
    createTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask,
};