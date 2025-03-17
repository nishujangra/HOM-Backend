class MinHeap {
  constructor() {
    this.heap = [];
  }

  insert(task) {
    this.heap.push(task);
    this.bubbleUp(this.heap.length - 1);
  }

  bubbleUp(index) {
    const parent = Math.floor((index - 1) / 2);

    if (parent >= 0 && this.compare(this.heap[index], this.heap[parent]) < 0) {
      [this.heap[parent], this.heap[index]] = [
        this.heap[index],
        this.heap[parent],
      ];
      this.bubbleUp(parent);
    }
  }

  compare(a, b) {
    const priorityMap = { high: 1, medium: 2, low: 3 };

    if (priorityMap[a.priority] !== priorityMap[b.priority])
      return priorityMap[a.priority] - priorityMap[b.priority];

    return new Date(a.createdAt) - new Date(b.createdAt);
  }

  getTasks() {
    return this.heap.sort((a, b) => this.compare(a, b));
  }
}

const taskQueue = new MinHeap();

const addTaskToQueue = (task) => {
  taskQueue.insert(task);
};

const getSortedTasks = () => {
  return taskQueue.getTasks();
};

module.exports = { addTaskToQueue, getSortedTasks };
