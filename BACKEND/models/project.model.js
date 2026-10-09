import { Schema, model } from "mongoose";

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      default: ""
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: "User"
    }],
    deadline: Date
  },
  { timestamps: true }
);

export default model("Project", projectSchema);