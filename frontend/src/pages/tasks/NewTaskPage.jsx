import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { tasks, projects } from '../../services/api';

const NewTaskPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    projectId: '',
    createdById: '',
  });

  const [projectList, setProjectList] = useState([]);

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
      }
    };

    fetchProjects();
  }, []);

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      description: formData.description || null,
      projectId: formData.projectId || null,
    };

    try {
      await tasks.create(payload);
      toast.success('Task created successfully!');
      navigate('/dashboard/tasks');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
              Create New Task
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Task Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="border border-transparent hover:border-gray-300 bg-white shadow-sm appearance-none block w-full rounded-md py-3 px-4"
              />
            </div>

            <div>
              <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="border border-transparent hover:border-gray-300 hover:border-gray-300 bg-white shadow-sm appearance-none block w-full rounded-md py-3 px-4"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Status
                </label>
                <select
                  name="status"
                  id="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="border border-transparent hover:border-gray-300 bg-white shadow-sm appearance-none block w-full rounded-md p-3 focus:outline-none"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Priority
                </label>
                <select
                  name="priority"
                  id="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="border border-transparent hover:border-gray-300 bg-white shadow-sm appearance-none block w-full rounded-md p-3 focus:outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="dueDate" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                id="dueDate"
                required
                value={formData.dueDate}
                onChange={handleChange}
                className="border border-transparent hover:border-gray-300 bg-white shadow-sm appearance-none block w-full rounded-md p-3 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="projectId" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Project
              </label>
              <select
                name="projectId"
                id="projectId"
                value={formData.projectId}
                onChange={handleChange}
                className="border border-transparent hover:border-gray-300 bg-white shadow-sm appearance-none block w-full rounded-md p-3 focus:outline-none"
              >
                <option value="">Select a project</option>
                {projectList.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mr-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default NewTaskPage;