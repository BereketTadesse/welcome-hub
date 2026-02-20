import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, X } from "lucide-react";
import type { Task } from "@/lib/tasks";

interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; description: string; fileName?: string; fileData?: string }) => void;
  task?: Task | null;
}

const TaskDialog = ({ open, onClose, onSave, task }: TaskDialogProps) => {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [fileName, setFileName] = useState(task?.fileName || "");
  const [fileData, setFileData] = useState(task?.fileData || "");
  const fileRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFileName("");
    setFileData("");
  };

  // Sync state when task changes
  useState(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setFileName(task.fileName || "");
      setFileData(task.fileData || "");
    } else {
      resetForm();
    }
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFileData(reader.result as string);
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setFileName("");
    setFileData("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim(), fileName: fileName || undefined, fileData: fileData || undefined });
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); } }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input id="task-title" placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea id="task-desc" placeholder="Describe the task..." rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Attachment</Label>
            {fileName ? (
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm">
                <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate text-foreground">{fileName}</span>
                <button onClick={removeFile} className="ml-auto text-muted-foreground hover:text-destructive">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div>
                <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <Paperclip className="h-4 w-4 mr-2" /> Attach File
                </Button>
                <p className="text-xs text-muted-foreground mt-1">Max 5MB</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!title.trim()}>{task ? "Update" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;
