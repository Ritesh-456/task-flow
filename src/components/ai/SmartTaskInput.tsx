import { useState } from "react";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Project } from "@/types";

interface SmartTaskInputProps {
    projects: Project[];
    onTaskCreated: () => void;
}

const SmartTaskInput = ({ projects, onTaskCreated }: SmartTaskInputProps) => {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedTask, setGeneratedTask] = useState<any>(null);
    const [selectedProject, setSelectedProject] = useState<string>(projects[0]?._id || "");

    const handleGenerate = async () => {
        if (!input.trim()) return;

        setIsGenerating(true);
        try {
            const { data } = await api.post("/ai/generate", { text: input });
            setGeneratedTask(data);
        } catch (error) {
            toast.error("Failed to generate task. Try again.");
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCreate = async () => {
        if (!generatedTask || !selectedProject) {
            toast.error("Please select a project");
            return;
        }

        try {
            await api.post("/tasks", {
                ...generatedTask,
                projectId: selectedProject,
            });

            toast.success("Task created successfully! ✨");
            setOpen(false);
            setInput("");
            setGeneratedTask(null);
            onTaskCreated();
        } catch (error) {
            toast.error("Failed to save task");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl">
                    <Sparkles className="h-4 w-4" />
                    <span>Smart Task</span>
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-violet-600" />
                        AI Task Creator
                    </DialogTitle>
                </DialogHeader>

                {!generatedTask ? (
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground">
                            Describe your task in plain English. Include priority and deadline if you want.
                        </p>
                        <div className="relative">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="e.g., Fix the login bug by Friday high priority..."
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !input.trim()}
                                className="absolute bottom-3 right-3 rounded-full bg-violet-600 p-2 text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
                            >
                                {isGenerating ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <ArrowRight className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 py-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Title</label>
                                <input
                                    value={generatedTask.title}
                                    onChange={(e) => setGeneratedTask({ ...generatedTask, title: e.target.value })}
                                    className="w-full bg-transparent font-medium focus:outline-none"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-medium text-muted-foreground">Priority</label>
                                    <div className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize
                    ${generatedTask.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                            generatedTask.priority === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}`}>
                                        {generatedTask.priority}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-medium text-muted-foreground">Deadline</label>
                                    <div className="mt-1 text-sm">{generatedTask.deadline || "No deadline"}</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Assign to Project</label>
                            <select
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                {projects.map(p => (
                                    <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                            <button
                                onClick={() => setGeneratedTask(null)}
                                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleCreate}
                                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                Create Task
                            </button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default SmartTaskInput;
