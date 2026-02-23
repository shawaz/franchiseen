"use client";

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Clock, AlertCircle, CheckCircle2, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { useWalletUi } from '@wallet-ui/react';
import { toast } from 'sonner';

// Optional: you can import a modal/dialog component here for "Create Task" if one exists in the project.

const PRIORITY_COLORS: Record<string, string> = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
    todo: <Circle className="h-5 w-5 text-gray-400" />,
    in_progress: <Clock className="h-5 w-5 text-blue-500" />,
    review: <AlertCircle className="h-5 w-5 text-orange-500" />,
    completed: <CheckCircle2 className="h-5 w-5 text-green-500" />,
};

type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';

export default function TasksPage() {
    const { account } = useWalletUi();
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assigneeId: '',
        department: 'management',
        priority: 'medium',
        dueDate: ''
    });

    // Queries
    const allTasks = useQuery(api.tasks.getTasks, {});
    const adminUsers = useQuery(api.adminManagement.getAllAdminUsers || "skip" as any); // We might need to implement getAdminUsers if not exists

    // Mutations
    const updateTaskStatus = useMutation(api.tasks.updateTaskStatus);
    const deleteTask = useMutation(api.tasks.deleteTask);
    const createTask = useMutation(api.tasks.createTask);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!account?.address) {
            toast.error('You must be connected to create tasks.');
            return;
        }
        if (!newTask.title) {
            toast.error('Title is required');
            return;
        }

        try {
            await createTask({
                title: newTask.title,
                description: newTask.description || undefined,
                assigneeId: newTask.assigneeId ? (newTask.assigneeId as any) : undefined,
                department: newTask.department as any,
                priority: newTask.priority as any,
                dueDate: newTask.dueDate ? new Date(newTask.dueDate).getTime() : undefined,
                assignedByWallet: account.address
            });
            toast.success('Task created successfully!');
            setIsDialogOpen(false);
            setNewTask({ title: '', description: '', assigneeId: '', department: 'management', priority: 'medium', dueDate: '' });
        } catch (error: any) {
            toast.error(error.message || 'Failed to create task');
            console.error(error);
        }
    };

    const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
        try {
            await updateTaskStatus({ taskId: taskId as any, status: newStatus });
            toast.success('Task status updated');
        } catch (error) {
            toast.error('Failed to update task');
            console.error(error);
        }
    };

    const tasksByStatus = {
        todo: allTasks?.filter(t => t.status === 'todo') || [],
        in_progress: allTasks?.filter(t => t.status === 'in_progress') || [],
        review: allTasks?.filter(t => t.status === 'review') || [],
        completed: allTasks?.filter(t => t.status === 'completed') || [],
    };

    const renderTaskCard = (task: any) => (
        <Card key={task._id} className="mb-3 hover:shadow-md transition-shadow cursor-pointer border-stone-200 dark:border-stone-800">
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <Badge className={`${PRIORITY_COLORS[task.priority]} capitalize border-none`}>
                        {task.priority}
                    </Badge>
                    <div className="flex space-x-2">
                        <select
                            title="status"
                            className="text-xs bg-transparent border border-stone-200 dark:border-stone-700 rounded px-1 py-0.5"
                            value={task.status}
                            onChange={(e) => handleStatusChange(task._id, e.target.value as TaskStatus)}
                        >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="completed">Done</option>
                        </select>
                    </div>
                </div>

                <h4 className="font-semibold text-sm mb-1">{task.title}</h4>
                {task.description && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mb-3">
                        {task.description}
                    </p>
                )}

                <div className="flex items-center justify-between text-xs text-stone-500 mt-4">
                    <div className="flex items-center space-x-2">
                        {task.assignee ? (
                            <div className="flex items-center space-x-1">
                                <div className="w-6 h-6 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center font-bold text-stone-600 dark:text-stone-300">
                                    {task.assignee.name.charAt(0)}
                                </div>
                                <span className="truncate max-w-[80px]">{task.assignee.name}</span>
                            </div>
                        ) : (
                            <span className="italic">Unassigned</span>
                        )}

                    </div>
                    {task.dueDate && (
                        <span className={task.dueDate < Date.now() && task.status !== 'completed' ? 'text-red-500 font-medium' : ''}>
                            {format(task.dueDate, 'MMM d')}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tasks Management</h1>
                    <p className="text-stone-500 dark:text-stone-400">
                        Manage, assign, and track tasks across all operating departments.
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Quick Filter purely visually demonstrative for now */}
                    <select
                        title="Filter by Department"
                        className="border border-stone-300 dark:border-stone-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-stone-900"
                        defaultValue="all"
                    >
                        <option value="all">All Departments</option>
                        <option value="operations">Operations</option>
                        <option value="finance">Finance</option>
                        <option value="marketing">Marketing</option>
                    </select>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                New Task
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create New Task</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateTask} className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <label htmlFor="title" className="text-sm font-medium">Title *</label>
                                    <Input
                                        id="title"
                                        value={newTask.title}
                                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                        placeholder="e.g. Prepare Q3 Report"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="desc" className="text-sm font-medium">Description</label>
                                    <textarea
                                        id="desc"
                                        className="flex min-h-[60px] w-full rounded-md border border-stone-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-950 dark:border-stone-800 dark:placeholder:text-stone-400 dark:focus-visible:ring-stone-300"
                                        placeholder="Add more details..."
                                        value={newTask.description}
                                        onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <label htmlFor="dept" className="text-sm font-medium">Department</label>
                                        <select
                                            id="dept"
                                            className="border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-stone-900"
                                            value={newTask.department}
                                            onChange={e => setNewTask({ ...newTask, department: e.target.value })}
                                        >
                                            <option value="management">Management</option>
                                            <option value="operations">Operations</option>
                                            <option value="finance">Finance</option>
                                            <option value="marketing">Marketing</option>
                                            <option value="sales">Sales</option>
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                                        <select
                                            id="priority"
                                            className="border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-stone-900"
                                            value={newTask.priority}
                                            onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="assignee" className="text-sm font-medium">Assignee (Optional ID for now)</label>
                                    <Input
                                        id="assignee"
                                        value={newTask.assigneeId}
                                        onChange={e => setNewTask({ ...newTask, assigneeId: e.target.value })}
                                        placeholder="Admin User ID..."
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="dueDate" className="text-sm font-medium">Due Date</label>
                                    <Input
                                        id="dueDate"
                                        type="date"
                                        value={newTask.dueDate}
                                        onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                                    />
                                </div>
                                <Button type="submit" className="mt-2 w-full">Create Task</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {!allTasks ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800 dark:border-white" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {/* TO DO COLUMN */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-4 px-1">
                            {STATUS_ICONS['todo']}
                            <h3 className="font-semibold">To Do</h3>
                            <Badge variant="secondary" className="ml-auto">{tasksByStatus.todo.length}</Badge>
                        </div>
                        <ScrollArea className="h-[calc(100vh-280px)]">
                            <div className="px-1">
                                {tasksByStatus.todo.map(renderTaskCard)}
                                {tasksByStatus.todo.length === 0 && (
                                    <div className="text-center p-6 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-lg text-sm text-stone-500">
                                        No tasks to do
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* IN PROGRESS COLUMN */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-4 px-1">
                            {STATUS_ICONS['in_progress']}
                            <h3 className="font-semibold">In Progress</h3>
                            <Badge variant="secondary" className="ml-auto">{tasksByStatus.in_progress.length}</Badge>
                        </div>
                        <ScrollArea className="h-[calc(100vh-280px)]">
                            <div className="px-1">
                                {tasksByStatus.in_progress.map(renderTaskCard)}
                                {tasksByStatus.in_progress.length === 0 && (
                                    <div className="text-center p-6 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-lg text-sm text-stone-500">
                                        No tasks in progress
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* REVIEW COLUMN */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-4 px-1">
                            {STATUS_ICONS['review']}
                            <h3 className="font-semibold">Under Review</h3>
                            <Badge variant="secondary" className="ml-auto">{tasksByStatus.review.length}</Badge>
                        </div>
                        <ScrollArea className="h-[calc(100vh-280px)]">
                            <div className="px-1">
                                {tasksByStatus.review.map(renderTaskCard)}
                                {tasksByStatus.review.length === 0 && (
                                    <div className="text-center p-6 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-lg text-sm text-stone-500">
                                        No tasks under review
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* COMPLETED COLUMN */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-4 px-1">
                            {STATUS_ICONS['completed']}
                            <h3 className="font-semibold">Completed</h3>
                            <Badge variant="secondary" className="ml-auto">{tasksByStatus.completed.length}</Badge>
                        </div>
                        <ScrollArea className="h-[calc(100vh-280px)]">
                            <div className="px-1">
                                {tasksByStatus.completed.map(renderTaskCard)}
                                {tasksByStatus.completed.length === 0 && (
                                    <div className="text-center p-6 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-lg text-sm text-stone-500">
                                        No completed tasks
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            )}
        </div>
    );
}
