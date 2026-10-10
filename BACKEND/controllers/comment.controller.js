import mongoose from 'mongoose';
import Project from '../models/project.model.js';
import Task from '../models/task.model.js';
import Comment from '../models/comment.model.js';
import Activity from '../models/activity.model.js';

const validId = (id) => mongoose.isValidObjectId(id);

const canAccess = (project, userId) =>
  project &&
  (project.owner.toString() === userId ||
    project.members.some((member) => member.toString() === userId));

const getAccessibleTask = async (taskId, userId) => {
  if (!validId(taskId)) return null;

  const task = await Task.findById(taskId);
  if (!task) return null;

  const project = await Project.findById(task.projectId);
  if (!canAccess(project, userId)) return null;

  return task;
};

export const getTaskComments = async (req, res) => {
  const task = await getAccessibleTask(req.params.taskId, req.userId);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const comments = await Comment.find({ taskId: task._id })
    .populate('userId', 'name email')
    .sort({ createdAt: 1 });

  res.json({ success: true, comments });
};

export const createComment = async (req, res) => {
  const { text } = req.body;
  const task = await getAccessibleTask(req.params.taskId, req.userId);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  if (!text?.trim()) {
    return res.status(400).json({ success: false, message: 'Comment text is required' });
  }

  const comment = await Comment.create({
    taskId: task._id,
    userId: req.userId,
    text: text.trim(),
  });

  await Activity.create({
    projectId: task.projectId,
    taskId: task._id,
    userId: req.userId,
    action: 'comment_created',
    description: `Commented on task "${task.title}"`,
  });

  const populatedComment = await Comment.findById(comment._id)
    .populate('userId', 'name email');

  res.status(201).json({ success: true, comment: populatedComment });
};