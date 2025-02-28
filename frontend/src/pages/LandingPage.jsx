import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CalendarIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="card hover:shadow-xl transition-shadow duration-200"
  >
    <div className="flex flex-col items-center text-center">
      <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full mb-4">
        <Icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </motion.div>
);

const LandingPage = () => {
  const features = [
    {
      icon: CheckCircleIcon,
      title: "Simple Task Management",
      description: "Create, organize, and complete tasks with just a few clicks."
    },
    {
      icon: CalendarIcon,
      title: "Project Planning",
      description: "Set deadlines, organize projects, and never miss important dates."
    },
    {
      icon: LockClosedIcon,
      title: "Secure Platform",
      description: "Enterprise-grade security to protect your sensitive data."
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-20 pb-32 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                <span className="block">Simplify Your</span>
                <span className="block text-primary-600">Daily Tasks</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Stay organized and boost your productivity with our intuitive todo app. Focus on what matters most.
              </p>
            </motion.div>

            <div className="mt-10 flex justify-center space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/signup"
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <span>Get Started</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/demo"
                  className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <span>Watch Demo</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Features that empower your workflow
            </h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Everything you need to stay on top of your tasks, all in one simple app.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 dark:bg-primary-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get organized?</span>
            <span className="block text-primary-200">Start managing your tasks today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50"
              >
                Get started
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
