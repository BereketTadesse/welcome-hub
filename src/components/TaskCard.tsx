import type { Task } from "@/lib/tasks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Paperclip, Download } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskCard = ({ task, onEdit, onDelete }: TaskCardProps) => {
  const handleDownload = () => {
    if (!task.fileData || !task.fileName) return;
    const a = document.createElement("a");
    a.href = task.fileData;
    a.download = task.fileName;
    a.click();
  };

  return (
    <Card className="border border-border bg-card hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground text-lg truncate">{task.title}</h3>
            {task.description && (
              <p className="text-muted-foreground text-sm mt-1 line-clamp-3 whitespace-pre-wrap">{task.description}</p>
            )}
            {task.fileName && (
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 mt-3 text-xs text-primary hover:underline"
              >
                <Paperclip className="h-3 w-3" />
                {task.fileName}
                <Download className="h-3 w-3" />
              </button>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              {new Date(task.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(task)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(task.id || (task as any)._id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
