const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getScheduledTasks,
} = require("../controllers/taskController");


router.post("/", protect, createTask);
router.get("/", protect, getTasks);
router.get("/schedule", protect, getScheduledTasks);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

module.exports = router;
