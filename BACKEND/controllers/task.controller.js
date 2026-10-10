import mongoose from 'mongoose';
import Project from '../models/project.model.js';
import Task from '../models/task.model.js';
import Activity from '../models/activity.model.js';

const validId = (id) => mongoose.isValidObjectId(id);

const canAccess = (project, userId) =>
  project &&
  (project.owner.toString() === userId ||
    project.members.some((member) => member.toString() === userId));

export const getMyTasks = async (req, res) => {
  const tasks = await Task.find({
    $or: [{ assignedTo: req.userId }, { createdBy: req.userId }],
  })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .populate('projectId', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, tasks });
};

export const getProjectTasks = async (req, res) => {
  const { projectId } = req.params;

  if (!validId(projectId)) {
    return res.status(400).json({ success: false, message: 'Invalid project ID' });
  }

  const project = await Project.findById(projectId);

  if (!canAccess(project, req.userId)) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  const tasks = await Task.find({ projectId })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.json({ success: true, tasks });
};

export const createTask = async (req, res) => {
  const { projectId } = req.params;
  const {
    title,
    description = '',
    assignedTo = null,
    status = 'todo',
    priority = 'medium',
    dueDate = null,
  } = req.body;

  if (!validId(projectId)) {
    return res.status(400).json({ success: false, message: 'Invalid project ID' });
  }

  if (!title?.trim()) {
    return res.status(400).json({ success: false, message: 'Task title is required' });
  }

  const project = await Project.findById(projectId);

  if (!canAccess(project, req.userId)) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  if (assignedTo && !project.members.some((member) => member.toString() === assignedTo)) {
    return res.status(400).json({
      success: false,
      message: 'Assignee must be a member of this project',
    });
  }

  const task = await Task.create({
    title: title.trim(),
    description,
    projectId,
    assignedTo: assignedTo || null,
    createdBy: req.userId,
    status,
    priority,
    dueDate: dueDate || null,
  });

  await Activity.create({
    projectId,
    taskId: task._id,
    userId: req.userId,
    action: 'task_created',
    description: `Created task "${task.title}"`,
  });

  const populatedTask = await Task.findById(task._id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  res.status(201).json({ success: true, task: populatedTask });
};

export const getTaskById = async (req, res) => {
  const { id } = req.params;

  if (!validId(id)) {
    return res.status(400).json({ success: false, message: 'Invalid task ID' });
  }

  const task = await Task.findById(id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const project = await Project.findById(task.projectId);

  if (!canAccess(project, req.userId)) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  res.json({ success: true, task });
};

export const updateTask = async (req, res) => {
  const { id } = req.params;

  if (!validId(id)) {
    return res.status(400).json({ success: false, message: 'Invalid task ID' });
  }

  const task = await Task.findById(id);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const project = await Project.findById(task.projectId);

  if (!canAccess(project, req.userId)) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const { title, description, status, priority, dueDate, assignedTo } = req.body;

  if (title !== undefined) {
    if (!title.trim()) {
      return res.status(400).json({ success: false, message: 'Task title cannot be empty' });
    }
    task.title = title.trim();
  }

  if (description !== undefined) task.description = description;

  if (status !== undefined) {
    if (!['todo', 'in_progress', 'review', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid task status' });
    }
    task.status = status;
  }

  if (priority !== undefined) {
    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ success: false, message: 'Invalid task priority' });
    }
    task.priority = priority;
  }

  if (dueDate !== undefined) task.dueDate = dueDate || null;

  if (assignedTo !== undefined) {
    if (
      assignedTo &&
      !project.members.some((member) => member.toString() === assignedTo)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Assignee must be a member of this project',
      });
    }

    task.assignedTo = assignedTo || null;
  }

  await task.save();

  await Activity.create({
    projectId: task.projectId,
    taskId: task._id,
    userId: req.userId,
    action: 'task_updated',
    description: `Updated task "${task.title}"`,
  });

  const updatedTask = await Task.findById(task._id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  res.json({ success: true, task: updatedTask });
};