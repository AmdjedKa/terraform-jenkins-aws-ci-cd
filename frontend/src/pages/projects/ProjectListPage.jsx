import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { projects } from '../../services/api';
import toast from 'react-hot-toast';

const ProjectListPage = () => {
  const [projectList, setProjectList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projects.getAll();
        if (Array.isArray(response.data?.data)) {
          setProjectList(response.data?.data);
        } else {
          setProjectList([]); // Fallback to an empty array
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getStatusColor = (priority) => {
    switch (priority) {
      case 'on-hold':
        return 'text-red-600';
      case 'active':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!projectList || projectList.length === 0) {
    return (
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
              A list of all projects and their current status
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              to="/dashboard/projects/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Project
            </Link>
          </div>
        </div>
        <div className="text-center text-gray-500 dark:text-gray-400">
          No projects found. Create a new project to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            A list of all projects and their current status
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/dashboard/projects/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Project
          </Link>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projectList.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                  {project.name}
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    project.status
                  )}`}
                >
                  {project.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {project.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <span>{new Date(project.startDate).toLocaleDateString('en-GB')} - {new Date(project.endDate).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProjectListPage;
