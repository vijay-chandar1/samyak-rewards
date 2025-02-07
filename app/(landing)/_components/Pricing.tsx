import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, HelpCircle } from 'lucide-react';

const pricingList = [
  {
    title: 'Basic',
    tagline: 'Perfect for small businesses.',
    price: 0,
    description:
      'Start with essential tools to manage your customers effectively.',
    buttonText: 'Sign Up Free',
    freeTrial: false,
    href: '/signin',
    benefitList: [
      {
        text: 'Manage up to 50 customers',
        available: true,
        tooltip: 'Limit of 50 customers applies.'
      },
      {
        text: 'Basic analytics tools',
        available: true,
        tooltip: 'Access standard analytics features.'
      },
      {
        text: 'Enhanced security protocols',
        available: false,
        tooltip: 'Pro plan includes enhanced security.'
      },
      {
        text: 'Customizable integrations',
        available: false,
        tooltip: 'Custom integrations are only available in the Pro plan.'
      }
    ]
  },
  {
    title: 'Pro',
    tagline: 'Best for scaling businesses.',
    price: 999,
    description:
      'Unlock premium features for streamlined operations and growth.',
    buttonText: 'Upgrade Now',
    freeTrial: true,
    href: '/dashboard/subscription',
    benefitList: [
      {
        text: 'Unlimited customer tracking',
        available: true,
        tooltip: 'No customer limit in this plan.'
      },
      {
        text: 'Advanced analytics tools',
        available: true,
        tooltip: 'Gain deeper insights with advanced analytics.'
      },
      {
        text: 'Enhanced security protocols',
        available: true,
        tooltip: 'Includes enterprise-grade security features.'
      },
      {
        text: 'Customizable integrations',
        available: true,
        tooltip: 'Fully customizable integrations for your business.'
      }
    ]
  }
];

export const Pricing = () => (
  <section id="pricing" className="container py-16">
    <h2 className="text-center text-4xl font-bold text-gray-900 dark:text-gray-100">
      Choose Your Plan
    </h2>
    <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
      Find the perfect plan for your business needs.
    </p>
    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
      {pricingList.map(
        ({
          title,
          tagline,
          price,
          description,
          buttonText,
          freeTrial,
          benefitList,
          href
        }) => (
          <Card
            key={title}
            className={`relative rounded-lg border shadow-md ${
              title === 'Pro'
                ? 'border-2 border-blue-600 shadow-blue-200 dark:border-blue-500 dark:shadow-blue-900'
                : 'border border-gray-200 dark:border-gray-700'
            } bg-white dark:bg-gray-800`}
          >
            {freeTrial && (
              <Badge
                variant="secondary"
                className="dark:text-primary-light absolute right-2 top-2 text-sm text-primary dark:bg-gray-900"
              >
                Free Trial Included
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
                {title}
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {tagline}
              </p>
              <div className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
                ₹{price}
              </div>
              <p className="text-gray-400 dark:text-gray-500">/ month</p>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">{description}</p>
              <ul className="mt-6 space-y-4">
                {benefitList.map(({ text, available, tooltip }) => (
                  <li
                    key={text}
                    className={`flex items-center space-x-2 ${
                      available
                        ? 'text-gray-800 dark:text-gray-100'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {available ? (
                      <Check className="text-green-500 dark:text-green-400" />
                    ) : (
                      <X className="text-gray-400 dark:text-gray-600" />
                    )}
                    <span className="flex items-center">
                      {text}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="ml-2">
                            <HelpCircle className="h-4 w-4 cursor-pointer text-gray-400 dark:text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            {tooltip || 'More information about this feature.'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href={href} className="w-full">
                <Button className="w-full bg-blue-600 text-gray-100 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                  {buttonText}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        )
      )}
    </div>
  </section>
);

export default Pricing;