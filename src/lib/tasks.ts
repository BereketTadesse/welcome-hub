export interface Task {
  id: string;
  title: string;
  description: string;
  fileName?: string;
  fileData?: string; // base64 data URL
  createdAt: string;
}

const TASKS_KEY = "sadi_tasks";

export const getTasks = (userEmail: string): Task[] => {
  const all = JSON.parse(localStorage.getItem(TASKS_KEY) || "{}");
  return all[userEmail] || [];
};

export const saveTasks = (userEmail: string, tasks: Task[]) => {
  const all = JSON.parse(localStorage.getItem(TASKS_KEY) || "{}");
  all[userEmail] = tasks;
  localStorage.setItem(TASKS_KEY, JSON.stringify(all));
};

export const createTask = (userEmail: string, task: Omit<Task, "id" | "createdAt">): Task => {
  const tasks = getTasks(userEmail);
  const newTask: Task = {
    ...task,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  saveTasks(userEmail, [newTask, ...tasks]);
  return newTask;
};

export const updateTask = (userEmail: string, id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => {
  const tasks = getTasks(userEmail);
  const updated = tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
  saveTasks(userEmail, updated);
};

export const deleteTask = (userEmail: string, id: string) => {
  const tasks = getTasks(userEmail).filter((t) => t.id !== id);
  saveTasks(userEmail, tasks);
};
