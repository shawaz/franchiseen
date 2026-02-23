import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get tasks with optional filters
export const getTasks = query({
    args: {
        status: v.optional(v.string()),
        department: v.optional(v.string()),
        assigneeId: v.optional(v.id("adminUsers")),
        priority: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        let tasksQuery: any = ctx.db.query("tasks");

        if (args.assigneeId) {
            tasksQuery = tasksQuery.withIndex("by_assignee", (q: any) => q.eq("assigneeId", args.assigneeId));
        } else if (args.department) {
            tasksQuery = tasksQuery.withIndex("by_department", (q: any) => q.eq("department", args.department as any));
        } else if (args.status) {
            tasksQuery = tasksQuery.withIndex("by_status", (q: any) => q.eq("status", args.status as any));
        } else if (args.priority) {
            tasksQuery = tasksQuery.withIndex("by_priority", (q: any) => q.eq("priority", args.priority as any));
        }

        let tasks = await tasksQuery.order("desc").collect();

        // In-memory filtering for remaining arguments if we already used an index
        if (args.assigneeId && args.status) tasks = tasks.filter((t: any) => t.status === args.status);
        if (args.assigneeId && args.department) tasks = tasks.filter((t: any) => t.department === args.department);
        if (args.assigneeId && args.priority) tasks = tasks.filter((t: any) => t.priority === args.priority);

        if (args.department && !args.assigneeId && args.status) tasks = tasks.filter((t: any) => t.status === args.status);
        if (args.department && !args.assigneeId && args.priority) tasks = tasks.filter((t: any) => t.priority === args.priority);

        if (args.status && !args.assigneeId && !args.department && args.priority) tasks = tasks.filter((t: any) => t.priority === args.priority);

        // Enrich tasks with assignee and assigner data
        return await Promise.all(
            tasks.map(async (task: any) => {
                let assignee = null;
                if (task.assigneeId) {
                    assignee = await ctx.db.get(task.assigneeId);
                }
                const assignedBy = await ctx.db.get(task.assignedBy);
                return {
                    ...task,
                    assignee,
                    assigner: assignedBy
                };
            })
        );
    },
});

export const createTask = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        assigneeId: v.optional(v.id("adminUsers")),
        assignedByWallet: v.string(), // We get the wallet address from the client UI
        department: v.union(
            v.literal('management'),
            v.literal('operations'),
            v.literal('finance'),
            v.literal('people'),
            v.literal('marketing'),
            v.literal('sales'),
            v.literal('support'),
            v.literal('software'),
        ),
        priority: v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('urgent')),
        dueDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        // Look up the admin user who is creating it
        const assignedByAdmin = await ctx.db
            .query("adminUsers")
            .withIndex("by_walletAddress", (q) => q.eq("walletAddress", args.assignedByWallet))
            .first();

        if (!assignedByAdmin) {
            throw new Error("You must be an admin to assign tasks.");
        }

        const taskId = await ctx.db.insert("tasks", {
            title: args.title,
            description: args.description,
            assigneeId: args.assigneeId,
            assignedBy: assignedByAdmin._id,
            department: args.department,
            status: "todo",
            priority: args.priority,
            dueDate: args.dueDate,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        return taskId;
    },
});

export const updateTaskStatus = mutation({
    args: {
        taskId: v.id("tasks"),
        status: v.union(v.literal('todo'), v.literal('in_progress'), v.literal('review'), v.literal('completed')),
    },
    handler: async (ctx, { taskId, status }) => {
        const existingTask = await ctx.db.get(taskId);
        if (!existingTask) throw new Error("Task not found");

        await ctx.db.patch(taskId, {
            status,
            completedAt: status === "completed" ? Date.now() : undefined,
            updatedAt: Date.now(),
        });

        return true;
    },
});

export const updateTask = mutation({
    args: {
        taskId: v.id("tasks"),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        assigneeId: v.optional(v.id("adminUsers")),
        department: v.optional(
            v.union(
                v.literal('management'),
                v.literal('operations'),
                v.literal('finance'),
                v.literal('people'),
                v.literal('marketing'),
                v.literal('sales'),
                v.literal('support'),
                v.literal('software'),
            )
        ),
        priority: v.optional(v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('urgent'))),
        dueDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { taskId, ...updates } = args;
        const existingTask = await ctx.db.get(taskId);
        if (!existingTask) throw new Error("Task not found");

        await ctx.db.patch(taskId, {
            ...updates,
            updatedAt: Date.now(),
        });

        return true;
    },
});

export const deleteTask = mutation({
    args: { taskId: v.id("tasks") },
    handler: async (ctx, { taskId }) => {
        await ctx.db.delete(taskId);
        return true;
    },
});
