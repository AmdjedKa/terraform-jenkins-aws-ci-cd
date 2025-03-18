import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { tasks, projects } from '../../services/api';
import toast from 'react-hot-toast';

const TaskPage = () => {
  const [taskList, setTaskList] = useState([]);
  const [projectMap, setProjectMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchTasksAndProjects = async () => {
      try {
        const tasksResponse = await tasks.getAll();
        let taskData = [];

        if (Array.isArray(tasksResponse.data?.data)) {
          taskData = tasksResponse.data?.data;
          setTaskList(taskData);

          const projectIds = [...new Set(taskData.filter(task => task.projectId).map(task => task.projectId))];
          
          // Fetch project details for each unique project ID
          const projectDetails = {};
          for (const projectId of projectIds) {
            try {
              const projectsResponse = await projects.getById(projectId);
              if (projectsResponse.data?.data) {
                projectDetails[projectId] = projectsResponse.data.data;
              }
            } catch (projectError) {
              console.error(`Failed to fetch project ${projectId}:`, projectError);
            }
          }
          
          setProjectMap(projectDetails);
        } else {
          setTaskList([]); // Fallback to an empty array
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
  
    fetchTasksAndProjects();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasks.updateStatus(taskId, newStatus);
      setTaskList(taskList.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      toast.success('Task status updated');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error(error.response?.data?.message || 'Failed to update task status');
    }
  };

  const filteredTasks = taskList.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'todo':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-600" />;
      case 'medium':
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-600" />;
      case 'low':
        return <ExclamationCircleIcon className="h-5 w-5 text-green-600" />;
      default:
        return null;
    }
  };

  const getProjectName = (projectId) => {
    if (!projectId) return null;
    
    return projectMap[projectId]?.name || `Project #${projectId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!taskList || taskList.length === 0) {
    return (
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
              A list of all your tasks and their current status
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              to="/dashboard/tasks/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Task
            </Link>
          </div>
        </div>
        <div className="text-center text-gray-500 dark:text-gray-400">
          No tasks found. Create a new task to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            Manage and track your project tasks
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/dashboard/tasks/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Task
          </Link>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="block w-44 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-300 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 hover:border-primary-400 dark:hover:border-primary-500 transition"
        >
          <option value="all">All Tasks</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 shadow rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {task.title}
              </h3>
              <div className="flex items-center space-x-4">
                {getPriorityIcon(task.priority)}
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {task.description}
            </p>
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <span>Due: {new Date(task.dueDate).toLocaleDateString('en-GB')}</span>
                {task.projectId && <span>Project: {getProjectName(task.projectId)}</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TaskPage;
