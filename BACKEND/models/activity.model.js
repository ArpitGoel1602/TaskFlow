
import { Schema, model } from "mongoose";

const activitySchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      default: null
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

export default model("Activity", activitySchema);