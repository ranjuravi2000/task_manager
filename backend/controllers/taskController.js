const Task = require("../models/Task");
const User = require("../models/User");
const Notification = require("../models/Notification");

//----------------creating task------------//
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            status,
            priority,
            dueDate,
            category,
            progress,
            assignedTo,
            participants,
        } = req.body;

       
        //-------- VALIDATE ASSIGNED USER-----//
        
        if (assignedTo) {
            const assignedUser = await User.findById(
                assignedTo
            );

            if (!assignedUser) {
                return res.status(404).json({
                    message: "Assigned user not found",
                });
            }
        }

       
        //----validating participants--------//
       
        if (
            participants &&
            participants.length > 0
        ) {
            const participantUsers =
                await User.find({
                    _id: {
                        $in: participants,
                    },
                });

            if (
                participantUsers.length !==
                participants.length
            ) {
                return res.status(404).json({
                    message:
                        "One or more participants not found",
                });
            }
        }

        // create Task  //
        const task = await Task.create({
            title,
            description,
            status,
            priority,
            dueDate,
            category,
            progress,
            assignedTo: assignedTo || null,
            participants: participants || [],
            createdBy: req.user._id,
        });

        //------- CREATE NOTIFICATION FOR ASSIGNED USER---------//
       
        if (
            assignedTo &&
            assignedTo.toString() !==
                req.user._id.toString()
        ) {
            await Notification.create({
                recipient: assignedTo,
                sender: req.user._id,
                task: task._id,
                type: "task_assigned",
                message: `You have been assigned a new task: ${title}`,
            });
        }

       
        // CREATE NOTIFICATIONS FOR PARTICIPANTS //
       
        if (
            participants &&
            participants.length > 0
        ) {
            const participantNotifications =
                participants
                    .filter(
                        (participantId) =>
                            participantId.toString() !==
                            req.user._id.toString()
                    )
                    .filter(
                        (participantId) =>
                            !assignedTo ||
                            participantId.toString() !==
                                assignedTo.toString()
                    )
                    .map(
                        (participantId) => ({
                            recipient:
                                participantId,
                            sender:
                                req.user._id,
                            task: task._id,
                            type:
                                "task_participant",
                            message: `You have been added as a participant to task: ${title}`,
                        })
                    );

            if (
                participantNotifications.length >
                0
            ) {
                await Notification.insertMany(
                    participantNotifications
                );
            }
        }

        
        // POPULATE TASK
     
        const populatedTask =
            await Task.findById(task._id)
                .populate(
                    "createdBy",
                    "username email"
                )
                .populate(
                    "assignedTo",
                    "username email"
                )
                .populate(
                    "participants",
                    "username email"
                );

       
        // response----------//
      
        res.status(201).json({
            message:
                "Task created successfully",
            task: populatedTask,
        });
    } catch (error) {
        console.error(
            "Create task error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to create task",
            error: error.message,
        });
    }
};



// GET ALL TASKS   -----.//

const getTasks = async (req, res) => {
    try {
        const {
            search,
            status,
            priority,
            category,
            page = 1,
            limit = 10,
            sort = "newest",
        } = req.query;

        const userId = req.user._id;

       
        // USER ACCESS------//
       
        const query = {
            $or: [
                {
                    createdBy: userId,
                },
                {
                    assignedTo: userId,
                },
                {
                    participants: userId,
                },
            ],
        };

       
        //--------- SEARCH-------------//
      
        if (search) {
            query.$and = [
                {
                    $or: [
                        {
                            title: {
                                $regex:
                                    search,
                                $options:
                                    "i",
                            },
                        },
                        {
                            description: {
                                $regex:
                                    search,
                                $options:
                                    "i",
                            },
                        },
                    ],
                },
            ];
        }

       
        // STATUS FILTER
   
        if (status) {
            query.status = status;
        }

      
        // PRIORITY FILTER
    
        if (priority) {
            query.priority = priority;
        }

      
        // CATEGORY FILTER
      
        if (category) {
            query.category = category;
        }

      
        // PAGINATION
     
        const currentPage = Math.max(
            Number(page),
            1
        );

        const itemsPerPage = Math.max(
            Number(limit),
            1
        );

        const skip =
            (currentPage - 1) *
            itemsPerPage;

      
        // SORTING
      
        let sortOption = {
            createdAt: -1,
        };

        if (sort === "oldest") {
            sortOption = {
                createdAt: 1,
            };
        }

    
        // COUNT TASKS
        
        const totalTasks =
            await Task.countDocuments(query);

       
        // GET TASKS
        
        const tasks =
            await Task.find(query)
                .populate(
                    "createdBy",
                    "username email"
                )
                .populate(
                    "assignedTo",
                    "username email"
                )
                .populate(
                    "participants",
                    "username email"
                )
                .sort(sortOption)
                .skip(skip)
                .limit(itemsPerPage);

        const totalPages =
            Math.ceil(
                totalTasks /
                    itemsPerPage
            );

        res.status(200).json({
            count: tasks.length,
            totalTasks,
            currentPage,
            totalPages,
            limit: itemsPerPage,
            hasNextPage:
                currentPage <
                totalPages,
            hasPreviousPage:
                currentPage > 1,
            sort,
            tasks,
        });
    } catch (error) {
        console.error(
            "Get tasks error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch tasks",
            error: error.message,
        });
    }
};



// GET SINGLE TASK------------//

const getTask = async (req, res) => {
    try {
        const task =
            await Task.findOne({
                _id: req.params.id,
                $or: [
                    {
                        createdBy:
                            req.user._id,
                    },
                    {
                        assignedTo:
                            req.user._id,
                    },
                    {
                        participants:
                            req.user._id,
                    },
                ],
            })
                .populate(
                    "createdBy",
                    "username email"
                )
                .populate(
                    "assignedTo",
                    "username email"
                )
                .populate(
                    "participants",
                    "username email"
                );

        if (!task) {
            return res.status(404).json({
                message:
                    "Task not found",
            });
        }

        res.status(200).json(task);
    } catch (error) {
        console.error(
            "Get task error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch task",
            error: error.message,
        });
    }
};



//----------- UPDATE TASK--------------//

const updateTask = async (req, res) => {
    try {
        const task =
            await Task.findOne({
                _id: req.params.id,
                createdBy: req.user._id,
            });

        if (!task) {
            return res.status(404).json({
                message:
                    "Task not found",
            });
        }

        const {
            title,
            description,
            status,
            priority,
            dueDate,
            category,
            progress,
            assignedTo,
            participants,
        } = req.body;

      
        // STORE OLD VALUES   ///
       
        const oldAssignedTo =
            task.assignedTo
                ? task.assignedTo.toString()
                : null;

        const oldParticipants =
            task.participants.map(
                (participant) =>
                    participant.toString()
            );

       
        // VALIDATE ASSIGNED USER          //
     
        if (assignedTo) {
            const assignedUser =
                await User.findById(
                    assignedTo
                );

            if (!assignedUser) {
                return res.status(404).json({
                    message:
                        "Assigned user not found",
                });
            }
        }

        
        // --------VALIDATE PARTICIPANTS----------------//
       
        if (participants) {
            const participantUsers =
                await User.find({
                    _id: {
                        $in: participants,
                    },
                });

            if (
                participantUsers.length !==
                participants.length
            ) {
                return res.status(404).json({
                    message:
                        "One or more participants not found",
                });
            }
        }

        
        // UPDATE FIELDS--------//
       
        task.title =
            title ?? task.title;

        task.description =
            description ??
            task.description;

        task.status =
            status ?? task.status;

        task.priority =
            priority ?? task.priority;

        task.dueDate =
            dueDate ?? task.dueDate;

        task.category =
            category ?? task.category;

        task.progress =
            progress ?? task.progress;

        if (
            assignedTo !== undefined
        ) {
            task.assignedTo =
                assignedTo || null;
        }

        if (
            participants !==
            undefined
        ) {
            task.participants =
                participants;
        }

       
        // SYNCHRONIZE STATUS & PROGRESS-----//
       
        if (
            task.progress === 100
        ) {
            task.status =
                "completed";
        }

        if (
            task.progress < 100 &&
            task.status ===
                "completed"
        ) {
            task.status =
                "pending";
        }

      
        // SAVE TASK
     
        const updatedTask =
            await task.save();

       
        // NOTIFICATION FOR NEW ASSIGNEE
        
        const newAssignedTo =
            updatedTask.assignedTo
                ? updatedTask.assignedTo.toString()
                : null;

        if (
            newAssignedTo &&
            newAssignedTo !==
                oldAssignedTo &&
            newAssignedTo !==
                req.user._id.toString()
        ) {
            await Notification.create({
                recipient:
                    newAssignedTo,
                sender:
                    req.user._id,
                task:
                    updatedTask._id,
                type:
                    "task_assigned",
                message: `You have been assigned a new task: ${updatedTask.title}`,
            });
        }

       
        // NOTIFICATIONS FOR NEW PARTICIPANTS
       
        const newParticipants =
            updatedTask.participants.map(
                (participant) =>
                    participant.toString()
            );

        const addedParticipants =
            newParticipants.filter(
                (participantId) =>
                    !oldParticipants.includes(
                        participantId
                    ) &&
                    participantId !==
                        req.user._id.toString() &&
                    participantId !==
                        newAssignedTo
            );

        if (
            addedParticipants.length >
            0
        ) {
            const participantNotifications =
                addedParticipants.map(
                    (
                        participantId
                    ) => ({
                        recipient:
                            participantId,
                        sender:
                            req.user._id,
                        task:
                            updatedTask._id,
                        type:
                            "task_participant",
                        message: `You have been added as a participant to task: ${updatedTask.title}`,
                    })
                );

            await Notification.insertMany(
                participantNotifications
            );
        }

       
        // POPULATE UPDATED TASK
     
        const populatedTask =
            await Task.findById(
                updatedTask._id
            )
                .populate(
                    "createdBy",
                    "username email"
                )
                .populate(
                    "assignedTo",
                    "username email"
                )
                .populate(
                    "participants",
                    "username email"
                );

        
        // RESPONSE
       
        res.status(200).json({
            message:
                "Task updated successfully",
            task: populatedTask,
        });
    } catch (error) {
        console.error(
            "Update task error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to update task",
            error: error.message,
        });
    }
};



// DELETE TASK

const deleteTask = async (req, res) => {
    try {
        const task =
            await Task.findOne({
                _id: req.params.id,
                createdBy: req.user._id,
            });

        if (!task) {
            return res.status(404).json({
                message:
                    "Task not found",
            });
        }

        await task.deleteOne();

       
        // DELETE RELATED NOTIFICATIONS
       
        await Notification.deleteMany({
            task: task._id,
        });

        res.status(200).json({
            message:
                "Task deleted successfully",
        });
    } catch (error) {
        console.error(
            "Delete task error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to delete task",
            error: error.message,
        });
    }
};



// TASK STATISTICS

const getTaskStats = async (req, res) => {
    try {
        const userId =
            req.user._id;

        const totalTasks =
            await Task.countDocuments({
                createdBy: userId,
            });

        const pendingTasks =
            await Task.countDocuments({
                createdBy: userId,
                status: "pending",
            });

        const inProgressTasks =
            await Task.countDocuments({
                createdBy: userId,
                status: "in-progress",
            });

        const completedTasks =
            await Task.countDocuments({
                createdBy: userId,
                status: "completed",
            });

        const highPriorityTasks =
            await Task.countDocuments({
                createdBy: userId,
                priority: "high",
            });

        res.status(200).json({
            totalTasks,
            pendingTasks,
            inProgressTasks,
            completedTasks,
            highPriorityTasks,
        });
    } catch (error) {
        console.error(
            "Get task stats error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch task statistics",
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
    getTaskStats,
};