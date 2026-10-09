import Project from '../models/project.model.js';
import Task from '../models/task.model.js';
import Activity from '../models/activity.model.js';

export const getDashboard = async (req, res) => {
  const projects = await Project.find({
    $or: [{ owner: req.userId }, { members: req.userId }],
  }).select('_id');

  const projectIds = projects.map((project) => project._id);
  const taskFilter = { projectId: { $in: projectIds } };

  const [totalTasks, completedTasks, overdueTasks, recentActivities] =
    await Promise.all([
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: 'completed' }),
      Task.countDocuments({
        ...taskFilter,
        status: { $ne: 'completed' },
        dueDate: { $lt: new Date(), $ne: null },
      }),
      Activity.find({ projectId: { $in: projectIds } })
        .populate('userId', 'name email')
        .populate('projectId', 'name')
        .populate('taskId', 'title')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

  res.json({
    success: true,
    totalProjects: projects.length,
    totalTasks,
    completedTasks,
    overdueTasks,
    recentActivities,
  });
};