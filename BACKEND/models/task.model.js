import { Schema, model } from "mongoose";

const taskSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },
        description: {
            type: String,
            default: ""
        },
        projectId: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        status: {
            type: String,
            enum: ["todo", "in_progress", "review", "completed"],
            default: "todo"
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium"
        },
        dueDate: Date
    },
    { timestamps: true }
);

const Task = model("Task", taskSchema);
export default Task