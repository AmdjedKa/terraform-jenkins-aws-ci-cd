import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/outline';

const tiers = [
  {
    name: 'Basic',
    id: 'tier-basic',
    priceMonthly: '$10',
    description: 'Perfect for individual users managing simple tasks.',
    features: [
      'Up to 3 projects',
      '5GB storage',
      'Task prioritization',
      'Email support',
    ],
    featured: false,
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    priceMonthly: '$25',
    description: 'Ideal for teams managing complex projects and tasks.',
    features: [
      'Unlimited projects',
      '20GB storage',
      'Advanced task management',
      'Task collaboration',
      'Priority support',
    ],
    featured: true,
  },
  {
    name: 'Enterprise',
    id: 'tier-enterprise',
    priceMonthly: 'Custom',
    description: 'Tailored support and tools for large teams and businesses.',
    features: [
      'Unlimited projects and tasks',
      'Custom storage limits',
      'Custom task workflows',
      '24/7 support',
      'Advanced reporting and analytics',
    ],
    featured: false,
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const PricingPage = () => {
  return (
    <div className="py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="text-base font-semibold leading-7 text-primary-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Choose the right plan for your productivity
          </p>
        </motion.div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600 dark:text-gray-400">
          Whether you're managing personal tasks or collaborating with a team, our plans are built to suit your needs.
        </p>
        <div className="mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-none lg:grid-cols-3 lg:gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={classNames(
                tier.featured
                  ? 'relative bg-gray-900 shadow-2xl'
                  : 'bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700',
                'my-2 rounded-3xl p-8 xl:p-10'
              )}
            >
              <div className="flex items-center justify-between gap-x-4">
                <h3
                  className={classNames(
                    tier.featured ? 'text-white' : 'text-gray-900 dark:text-white',
                    'text-lg font-semibold leading-8'
                  )}
                >
                  {tier.name}
                </h3>
                {tier.featured && (
                  <p className="rounded-full bg-primary-600 px-2.5 py-1 text-xs font-semibold leading-5 text-white">
                    Most popular
                  </p>
                )}
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-400">{tier.description}</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span
                  className={classNames(
                    tier.featured ? 'text-white' : 'text-gray-900 dark:text-white',
                    'text-4xl font-bold tracking-tight'
                  )}
                >
                  {tier.priceMonthly}
                </span>
                <span
                  className={classNames(
                    tier.featured ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400',
                    'text-sm font-semibold leading-6'
                  )}
                >
                  /month
                </span>
              </p>
              <a
                href="/"
                className={classNames(
                  tier.featured
                    ? 'bg-primary-600 text-white hover:bg-primary-500 focus-visible:outline-primary-600'
                    : 'bg-primary-600 text-white hover:bg-primary-500',
                  'mt-6 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
                )}
              >
                Get started today
              </a>
              <ul
                role="list"
                className={classNames(
                  tier.featured ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400',
                  'mt-8 space-y-3 text-sm leading-6 xl:mt-10'
                )}
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon
                      className={classNames(
                        tier.featured ? 'text-white' : 'text-primary-600',
                        'h-6 w-5 flex-none'
                      )}
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
