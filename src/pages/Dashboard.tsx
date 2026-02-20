import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import sadiLogo from "@/assets/sadi-logo.png";
import { getTasks, createTask, updateTask, deleteTask, type Task } from "@/lib/tasks";
import TaskDialog from "@/components/TaskDialog";
import TaskCard from "@/components/TaskCard";

const Dashboard = () => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const user = localStorage.getItem("sadi_current_user");
    if (!user) {
      navigate("/");
      return;
    }
    const parsed = JSON.parse(user);
    setUserName(parsed.name);
    setUserEmail(parsed.email);
    setTasks(getTasks(parsed.email));
  }, [navigate]);

  const refresh = useCallback(() => {
    setTasks(getTasks(userEmail));
  }, [userEmail]);

  const handleCreate = (data: { title: string; description: string; fileName?: string; fileData?: string }) => {
    createTask(userEmail, data);
    refresh();
    toast({ title: "Task created" });
  };

  const handleUpdate = (data: { title: string; description: string; fileName?: string; fileData?: string }) => {
    if (!editingTask) return;
    updateTask(userEmail, editingTask.id, data);
    setEditingTask(null);
    refresh();
    toast({ title: "Task updated" });
  };

  const handleDelete = (id: string) => {
    deleteTask(userEmail, id);
    refresh();
    toast({ title: "Task deleted", variant: "destructive" });
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("sadi_current_user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src={sadiLogo} alt="Sadi Solutions" className="w-10 h-10 object-contain" />
            <span className="font-semibold text-foreground text-lg hidden sm:inline">Sadi IT Solutions</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{userName}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to Sadi IT Solutions
          </h1>
          <p className="text-muted-foreground mt-1">
            Hello, <span className="text-primary font-semibold">{userName}</span>!
          </p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <ClipboardList className="h-5 w-5" /> My Tasks
          </h2>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> New Task
          </Button>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-lg">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No tasks yet. Create your first task!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      <TaskDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingTask(null); }}
        onSave={editingTask ? handleUpdate : handleCreate}
        task={editingTask}
      />
    </div>
  );
};

export default Dashboard;
