const Task = require("../models/Task");
const User = require("../models/User");
const Notification = require("../models/Notification");

// CREATE TASK
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


        // CHECK USER
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }


        // GET USER PLAN------------------
        const userPlan =
            user.subscription?.plan || "free";


        // TASK LIMITS
        const taskLimits = {
            free: 5,
            pro: 50,
            ultimate: Infinity,
        };

        const taskLimit =
            taskLimits[userPlan] ?? 5;

       
        // COUNT TASKS CREATED BY USER
      const currentTaskCount =
            await Task.countDocuments({
                createdBy: user._id,
            });

        console.log(
            "tASK LIMIT CHECK"
        );

        console.log(
            "User:",
            user.email
        );

        console.log(
            "User ID:",
            user._id
        );

        console.log(
            "Plan:",
            userPlan
        );

        console.log(
            "Task Limit:",
            taskLimit
        );

        console.log(
            "Current Task Count:",
            currentTaskCount
        );

        console.log(
            "  "
        );

        // CHECK TASK LIMIT
      

        if (
            taskLimit !== Infinity &&
            currentTaskCount >= taskLimit
        ) {
            console.log(
                "TASK CREATION BLOCKED - LIMIT REACHED"
            );

            return res.status(403).json({
                success: false,

                message:
                    userPlan === "free"
                        ? "Free plan allows only 5 tasks. Please upgrade your plan to create more tasks."
                        : `${userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} plan allows only ${taskLimit} tasks. Please upgrade your plan.`,

                plan: userPlan,

                taskLimit,

                currentTaskCount,
            });
        }

        // VALIDATE TITLE
       if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Task title is required",
            });
        }

        // VALIDATE ASSIGNED USER
       

        if (assignedTo) {
            const assignedUser =
                await User.findById(assignedTo);

            if (!assignedUser) {
                return res.status(404).json({
                    message:
                        "Assigned user not found",
                });
            }
        }

       
        // VALIDATE PARTICIPANTS
        

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

        // CREATE TASK
       

        const task = await Task.create({
            title: title.trim(),

            description:
                description?.trim() || "",

            status:
                status || "pending",

            priority:
                priority || "medium",

            dueDate,

            category:
                category?.trim() || "General",

            progress:
                progress ?? 0,

            assignedTo:
                assignedTo || null,

            participants:
                participants || [],

            createdBy:
                user._id,
        });

        console.log(
            "TASK CREATED SUCCESSFULLY:",
            task._id
        );

    
        // NOTIFICATIONS
      

        try {
            

            if (
                assignedTo &&
                assignedTo.toString() !==
                user._id.toString()
            ) {
                await Notification.create({
                    recipient:
                        assignedTo,

                    sender:
                        user._id,

                    task:
                        task._id,

                    type:
                        "task_assigned",

                    message:
                        `You have been assigned a new task: ${title}`,
                });

                console.log(
                    "Assigned user notification created."
                );
            }

            // PARTICIPANT NOTIFICATIONS
          

            if (
                participants &&
                participants.length > 0
            ) {
                const participantNotifications =
                    participants

                       
                        .filter(
                            (participantId) =>
                                participantId.toString() !==
                                user._id.toString()
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
                                    user._id,

                                task:
                                    task._id,

                               
                                type:
                                    "participant_added",

                                message:
                                    `You have been added as a participant to task: ${title}`,
                            })
                        );

                if (
                    participantNotifications.length >
                    0
                ) {
                    await Notification.insertMany(
                        participantNotifications
                    );

                    console.log(
                        "Participant notifications created."
                    );
                }
            }
        } catch (notificationError) {
            console.error(
                "Notification error while creating task:",
                notificationError
            );

            // Task has already been created.
           
        }

       
        // POPULATE TASK
    

        let populatedTask;

        try {
            populatedTask =
                await Task.findById(
                    task._id
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
        } catch (populateError) {
            console.error(
                "Task populate error:",
                populateError
            );

            populatedTask = task;
        }

        
        // SUCCESS RESPONSE
       

        console.log(
            "TASK CREATION COMPLETED SUCCESSFULLY"
        );

        return res.status(201).json({
            success: true,

            message:
                "Task created successfully",

            task:
                populatedTask,
        });

    } catch (error) {
        console.error(
            "Create task error:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Failed to create task",

            error:
                error.message,
        });
    }
};


// GET ALL TASKS


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

        const userId =
            req.user._id;

      
        // USER ACCESS
        

        const query = {
            $or: [
                {
                    createdBy:
                        userId,
                },
                {
                    assignedTo:
                        userId,
                },
                {
                    participants:
                        userId,
                },
            ],
        };

       
        // SEARCH
        

        if (search) {
            query.$and = [
                {
                    $or: [
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
                    ],
                },
            ];
        }

       

        if (status) {
            query.status = status;
        }

        

        if (priority) {
            query.priority = priority;
        }

        

        if (category) {
            query.category = category;
        }

        

        const currentPage =
            Math.max(
                Number(page),
                1
            );

        const itemsPerPage =
            Math.max(
                Number(limit),
                1
            );

        const skip =
            (currentPage - 1) *
            itemsPerPage;

    

        let sortOption = {
            createdAt: -1,
        };

        if (sort === "oldest") {
            sortOption = {
                createdAt: 1,
            };
        }

      

        const totalTasks =
            await Task.countDocuments(
                query
            );

       
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

       
        // RESPONSE
        

        return res.status(200).json({
            count:
                tasks.length,

            totalTasks,

            currentPage,

            totalPages,

            limit:
                itemsPerPage,

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

        return res.status(500).json({
            message:
                "Failed to fetch tasks",

            error:
                error.message,
        });
    }
};


// GET SINGLE TASK


const getTask = async (req, res) => {
    try {
        const task =
            await Task.findOne({
                _id:
                    req.params.id,

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

        return res.status(200).json(task);

    } catch (error) {
        console.error(
            "Get task error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch task",

            error:
                error.message,
        });
    }
};


// UPDATE TASK


const updateTask = async (req, res) => {
    try {
        const task =
            await Task.findOne({
                _id:
                    req.params.id,

                createdBy:
                    req.user._id,
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

        // STORE OLD VALUES
     

        const oldAssignedTo =
            task.assignedTo
                ? task.assignedTo.toString()
                : null;

        const oldParticipants =
            task.participants.map(
                (participant) =>
                    participant.toString()
            );

        
        // VALIDATE ASSIGNED USER
      

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

       
        // VALIDATE PARTICIPANTS
       

        if (participants) {
            const participantUsers =
                await User.find({
                    _id: {
                        $in:
                            participants,
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

        // UPDATE FIELDS
       

        task.title =
            title ??
            task.title;

        task.description =
            description ??
            task.description;

        task.status =
            status ??
            task.status;

        task.priority =
            priority ??
            task.priority;

        task.dueDate =
            dueDate ??
            task.dueDate;

        task.category =
            category ??
            task.category;

        task.progress =
            progress ??
            task.progress;

        if (
            assignedTo !==
            undefined
        ) {
            task.assignedTo =
                assignedTo ||
                null;
        }

        if (
            participants !==
            undefined
        ) {
            task.participants =
                participants;
        }

      // STATUS & PROGRESS
        

        if (
            task.progress ===
            100
        ) {
            task.status =
                "completed";
        }

        if (
            task.progress <
            100 &&
            task.status ===
            "completed"
        ) {
            task.status =
                "pending";
        }

        

        const updatedTask =
            await task.save();

        

        try {
            const newAssignedTo =
                updatedTask.assignedTo
                    ? updatedTask.assignedTo.toString()
                    : null;

            
            // NEW ASSIGNEE
        

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

                    message:
                        `You have been assigned a new task: ${updatedTask.title}`,
                });
            }

          
            // NEW PARTICIPANTS
            

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
                        (participantId) => ({
                            recipient:
                                participantId,

                            sender:
                                req.user._id,

                            task:
                                updatedTask._id,

                            
                            type:
                                "participant_added",

                            message:
                                `You have been added as a participant to task: ${updatedTask.title}`,
                        })
                    );

                await Notification.insertMany(
                    participantNotifications
                );
            }
        } catch (notificationError) {
            console.error(
                "Notification error while updating task:",
                notificationError
            );

           
        }

     
        // POPULATE UPDATED TASK
      

        let populatedTask;

        try {
            populatedTask =
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
        } catch (populateError) {
            console.error(
                "Task populate error:",
                populateError
            );

            populatedTask =
                updatedTask;
        }

       
        // RESPONSE
       

        return res.status(200).json({
            message:
                "Task updated successfully",

            task:
                populatedTask,
        });

    } catch (error) {
        console.error(
            "Update task error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to update task",

            error:
                error.message,
        });
    }
};


// DELETE TASK


const deleteTask = async (req, res) => {
    try {
        const task =
            await Task.findOne({
                _id:
                    req.params.id,

                createdBy:
                    req.user._id,
            });

        if (!task) {
            return res.status(404).json({
                message:
                    "Task not found",
            });
        }

        await task.deleteOne();

        

        try {
            await Notification.deleteMany({
                task:
                    task._id,
            });
        } catch (notificationError) {
            console.error(
                "Notification cleanup error:",
                notificationError
            );
        }

        return res.status(200).json({
            message:
                "Task deleted successfully",
        });

    } catch (error) {
        console.error(
            "Delete task error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to delete task",

            error:
                error.message,
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
                createdBy:
                    userId,
            });

        const pendingTasks =
            await Task.countDocuments({
                createdBy:
                    userId,

                status:
                    "pending",
            });

        const inProgressTasks =
            await Task.countDocuments({
                createdBy:
                    userId,

                status:
                    "in-progress",
            });

        const completedTasks =
            await Task.countDocuments({
                createdBy:
                    userId,

                status:
                    "completed",
            });

        const highPriorityTasks =
            await Task.countDocuments({
                createdBy:
                    userId,

                priority:
                    "high",
            });

        return res.status(200).json({
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

        return res.status(500).json({
            message:
                "Failed to fetch task statistics",

            error:
                error.message,
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