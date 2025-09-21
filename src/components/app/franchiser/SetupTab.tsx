"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2, Clock, MapPin, AlertCircle, ExternalLink, Check} from 'lucide-react';

type SetupStatus = 'not_started' | 'in_progress' | 'completed' | 'delayed';

interface SetupTask {
  id: string;
  name: string;
  franchisee: string;
  location: string;
  startDate: Date | null;
  targetDate: Date;
  status: SetupStatus;
  progress: number;
  investmentAmount: number;
  investmentReceived: boolean;
}

// Dummy setup tasks data
const dummySetupTasks: SetupTask[] = [
  {
    id: 'setup-1',
    name: 'Burger King - Downtown',
    franchisee: 'John Doe',
    location: '123 Main St, New York, NY',
    startDate: new Date('2025-09-15'),
    targetDate: new Date('2025-11-15'),
    status: 'in_progress',
    progress: 45,
    investmentAmount: 150000,
    investmentReceived: true,
  },
  {
    id: 'setup-2',
    name: 'Pizza Hut - Uptown',
    franchisee: 'Jane Smith',
    location: '456 Oak Ave, Los Angeles, CA',
    startDate: null,
    targetDate: new Date('2025-12-01'),
    status: 'not_started',
    progress: 0,
    investmentAmount: 200000,
    investmentReceived: true,
  },
  {
    id: 'setup-3',
    name: 'Taco Bell - Midtown',
    franchisee: 'Mike Johnson',
    location: '789 Pine Rd, Chicago, IL',
    startDate: new Date('2025-08-01'),
    targetDate: new Date('2025-10-15'),
    status: 'delayed',
    progress: 70,
    investmentAmount: 175000,
    investmentReceived: true,
  },
  {
    id: 'setup-4',
    name: 'Subway - Westside',
    franchisee: 'Sarah Williams',
    location: '321 Elm St, Houston, TX',
    startDate: new Date('2025-07-01'),
    targetDate: new Date('2025-09-30'),
    status: 'completed',
    progress: 100,
    investmentAmount: 120000,
    investmentReceived: true,
  },
];

const getStatusBadge = (status: SetupStatus) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    case 'in_progress':
      return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
    case 'not_started':
      return <Badge className="bg-gray-100 text-gray-800">Not Started</Badge>;
    case 'delayed':
      return <Badge className="bg-red-100 text-red-800">Delayed</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export function SetupTab() {
  const [tasks, setTasks] = useState<SetupTask[]>(dummySetupTasks);
  const [selectedTask, setSelectedTask] = useState<SetupTask | null>(null);
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);

  const startProject = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: 'in_progress', startDate: new Date() } 
        : task
    ));
    setIsStartDialogOpen(false);
  };

  const completeProject = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: 'completed', progress: 100 } 
        : task
    ));
    setIsCompleteDialogOpen(false);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not started';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDaysRemaining = (targetDate: Date) => {
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days remaining` : `${Math.abs(diffDays)} days overdue`;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="py-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <div className="rounded-full bg-gray-100 p-2">
              <CheckCircle2 className="h-4 w-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">Active setup projects</p>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <div className="rounded-full bg-blue-100 p-2">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter(t => t.status === 'in_progress').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently in setup</p>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <div className="rounded-full bg-yellow-100 p-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter(t => t.status === 'delayed').length}
            </div>
            <p className="text-xs text-muted-foreground">Projects delayed</p>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <div className="rounded-full bg-green-100 p-2">
              <Check className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter(t => t.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully launched</p>
          </CardContent>
        </Card>
      </div>

      <Card className="py-4">
        <CardHeader>
          <CardTitle>Franchise Setup Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Franchisee</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Target Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.name}</TableCell>
                  <TableCell>{task.franchisee}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="truncate max-w-[150px]">{task.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(task.startDate)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{formatDate(task.targetDate)}</span>
                      <span className="text-xs text-muted-foreground">
                        {getDaysRemaining(task.targetDate)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          task.status === 'completed' ? 'bg-green-500' : 
                          task.status === 'delayed' ? 'bg-red-500' : 
                          'bg-blue-500'
                        }`} 
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{task.progress}%</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {task.status === 'not_started' ? (
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setSelectedTask(task);
                            setIsStartDialogOpen(true);
                          }}
                        >
                          Start Project
                        </Button>
                      ) : task.status === 'in_progress' || task.status === 'delayed' ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedTask(task);
                            setIsCompleteDialogOpen(true);
                          }}
                        >
                          Mark Complete
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" disabled>
                          <Check className="h-4 w-4 mr-2" />
                          Completed
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => setSelectedTask(task)}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Start Project Dialog */}
      <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Project Setup</DialogTitle>
            <DialogDescription>
              Are you sure you want to start the setup for {selectedTask?.name}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Franchisee</p>
                <p>{selectedTask?.franchisee}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p>{selectedTask?.location}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Investment</p>
                <p>${selectedTask?.investmentAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p>{selectedTask ? getStatusBadge(selectedTask.status) : null}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStartDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedTask && startProject(selectedTask.id)}
              disabled={!selectedTask?.investmentReceived}
            >
              {selectedTask?.investmentReceived ? 'Confirm Start' : 'Investment Pending'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Project Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Project as Complete</DialogTitle>
            <DialogDescription>
              Confirm that the setup for {selectedTask?.name} is fully complete?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Franchisee</p>
                <p>{selectedTask?.franchisee}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p>{selectedTask?.location}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p>{selectedTask?.startDate ? formatDate(selectedTask.startDate) : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Target Date</p>
                <p>{selectedTask ? formatDate(selectedTask.targetDate) : 'N/A'}</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">All setup tasks completed?</p>
              <div className="space-y-2">
                {[
                  'Site inspection completed',
                  'Construction/renovation finished',
                  'Equipment installed and tested',
                  'Staff hired and trained',
                  'Initial inventory received',
                  'All permits and licenses obtained'
                ].map((task, i) => (
                  <div key={i} className="flex items-center">
                    <input 
                      type="checkbox" 
                      id={`task-${i}`} 
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`task-${i}`} className="ml-2 text-sm text-gray-700">
                      {task}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="default"
              onClick={() => selectedTask && completeProject(selectedTask.id)}
            >
              Mark as Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
