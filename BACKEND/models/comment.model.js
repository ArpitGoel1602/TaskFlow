
import { Schema, model } from "mongoose";

const commentSchema = new Schema(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

const Comment = model("Comment", commentSchema);
export default Comment