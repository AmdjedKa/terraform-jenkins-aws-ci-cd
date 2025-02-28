import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  CalendarIcon,
  TagIcon,
  BellAlertIcon,
  UserGroupIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: "Task Management",
    description: "Create, organize and track your tasks with ease. Add descriptions, due dates, and mark tasks as complete when finished.",
    icon: CheckCircleIcon,
  },
  {
    name: "Project Organization",
    description: "Group related tasks into projects. Set project deadlines, track progress, and keep everything organized in one place.",
    icon: ChartBarIcon,
  },
  {
    name: "Team Collaboration",
    description: "Share tasks and projects with team members. Assign responsibilities and track who's working on what.",
    icon: UserGroupIcon,
  },
  {
    name: "Due Date Reminders",
    description: "Never miss a deadline again with customizable notifications and reminders for upcoming and overdue tasks.",
    icon: BellAlertIcon,
  },
  {
    name: "Calendar Integration",
    description: "View your tasks in a calendar format. Drag and drop to reschedule tasks and get a visual overview of your week or month.",
    icon: CalendarIcon,
  },
  {
    name: "Task Categorization",
    description: "Use tags and categories to organize tasks across projects. Filter and search to find exactly what you need.",
    icon: TagIcon,
  },
];

const FeaturesPage = () => {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-base font-semibold leading-7 text-primary-600">Everything you need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Powerful features for effortless task management
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
              TaskMaster provides all the tools you need to stay organized and productive.
              From simple to-do lists to complex project management, we've got you covered.
            </p>
          </motion.div>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="flex flex-col rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-gray-900 dark:text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900">
                    <feature.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Ready to simplify your task management?
          </h3>
          <div className="mt-8">
            <motion.a
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              href="/signup"
              className="inline-block rounded-md bg-primary-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              Get started for free
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FeaturesPage;