import mongoose from 'mongoose';
import Project from '../models/project.model.js';
import Task from '../models/task.model.js';
import Comment from '../models/comment.model.js';
import Activity from '../models/activity.model.js';

const validId = (id) => mongoose.isValidObjectId(id);

const canAccess = (project, userId) =>
  project &&
  (project.owner._id.toString() === userId ||
    project.members.some((member) => member._id.toString() === userId));

export const getProjects = async (req, res) => {
  const projects = await Project.find({
    $or: [{ owner: req.userId }, { members: req.userId }],
  })
    .populate('owner', 'name email')
    .populate('members', 'name email')
    .sort({ createdAt: -1 });

  res.json({ success: true, projects });
};

export const createProject = async (req, res) => {
  const { name, description = '', deadline = null } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Project name is required',
    });
  }

  const project = await Project.create({
    name: name.trim(),
    description,
    deadline: deadline || null,
    owner: req.userId,
    members: [req.userId],
  });

  await Activity.create({
    projectId: project._id,
    userId: req.userId,
    action: 'project_created',
    description: `Created project "${project.name}"`,
  });

  res.status(201).json({ success: true, project });
};

export const getProjectById = async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid project ID' });
  }

  const project = await Project.findById(req.params.id)
    .populate('owner', 'name email')
    .populate('members', 'name email');

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  if (!canAccess(project, req.userId)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  res.json({ success: true, project });
};

export const updateProject = async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid project ID' });
  }

  const project = await Project.findById(req.params.id);

  if (!project || project.owner.toString() !== req.userId) {
    return res.status(404).json({
      success: false,
      message: 'Project not found or permission denied',
    });
  }

  const { name, description, deadline } = req.body;

  if (name !== undefined) {
    if (!name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project name cannot be empty',
      });
    }
    project.name = name.trim();
  }

  if (description !== undefined) project.description = description;
  if (deadline !== undefined) project.deadline = deadline || null;

  await project.save();

  await Activity.create({
    projectId: project._id,
    userId: req.userId,
    action: 'project_updated',
    description: `Updated project "${project.name}"`,
  });

  res.json({ success: true, project });
};

export const deleteProject = async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid project ID' });
  }

  const project = await Project.findById(req.params.id);

  if (!project || project.owner.toString() !== req.userId) {
    return res.status(404).json({
      success: false,
      message: 'Project not found or permission denied',
    });
  }

  const tasks = await Task.find({ projectId: project._id }).select('_id');
  const taskIds = tasks.map((task) => task._id);

  await Comment.deleteMany({ taskId: { $in: taskIds } });
  await Task.deleteMany({ projectId: project._id });
  await Activity.deleteMany({ projectId: project._id });
  await project.deleteOne();

  res.json({ success: true, message: 'Project deleted successfully' });
};