const Task = require('../models/task.model');
const { logger } = require('../utils/logger');

exports.createTask = async (req, res) => {
  try {
    const { title, description, projectId, dueDate, priority } = req.body;
    const createdById = req.user.userId;

    const task = await Task.create({
      title,
      description,
      projectId,
      dueDate,
      priority,
      createdById
    });

    logger.info(`Task created: ${task.id}`);
    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    logger.error('Task creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task'
    });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { projectId, status, createdById } = req.query;
    const whereClause = {};

    if (projectId) whereClause.projectId = projectId;
    if (status) whereClause.status = status;
    if (createdById) whereClause.createdById = createdById;

    const tasks = await Task.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    logger.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks'
    });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    logger.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task'
    });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await task.update(updates);
    logger.info(`Task updated: ${id}`);
    
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    logger.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task'
    });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await task.destroy();
    logger.info(`Task deleted: ${id}`);
    
    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task'
    });
  }
};
