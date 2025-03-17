const Task = require("../models/Task");
const { redisClient } = require("../config/redis");
const { addTaskToQueue, getSortedTasks } = require("../utils/taskScheduler");

const createTask = async (req, res) => {
  const { title, description, status, priority } = req.body;

  try {
    const task = await Task.create({
      title,
      description,
      status,
      priority,
      user: req.user._id,
    });

    await redisClient.del(`tasks:${req.user._id}`); // Clear cache
    addTaskToQueue(task); // Add to Priority Queue
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTasks = async (req, res) => {
  const { page = 1, limit = 10, status, priority } = req.query;

  try {
    const cacheKey = `tasks:${req.user._id}:page=${page}:status=${status}:priority=${priority}`;
    const cached = await redisClient.get(cacheKey);

    if (cached) return res.json(JSON.parse(cached));

    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .sort({ priority: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    await redisClient.setEx(cacheKey, 60, JSON.stringify(tasks));

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });

    await redisClient.del(`tasks:${req.user._id}`);
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findOneAndDelete({ _id: id, user: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    await redisClient.del(`tasks:${req.user._id}`);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getScheduledTasks = (req, res) => {
  const tasks = getSortedTasks();
  res.json(tasks);
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getScheduledTasks,
};