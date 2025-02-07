import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

interface FeatureProps {
  title: string;
  description: string;
}

const features: FeatureProps[] = [
  {
    title: 'Customer Transaction History',
    description:
      'Easily view and manage detailed transaction histories for each customer, helping you understand their purchasing behavior.'
  },
  {
    title: 'Credit Management',
    description:
      'Track and update customer credits to incentivize repeat purchases and build loyalty.'
  },
  {
    title: 'Customer Insights',
    description:
      'Gain actionable insights through analytics to understand customer preferences and trends.'
  },
  {
    title: 'Multi-device Support',
    description:
      'Access the platform seamlessly across devices, ensuring you’re always in control.'
  },
  {
    title: 'Custom Reports',
    description:
      'Generate detailed reports on customer activity, credit usage, and loyalty program performance.'
  },
  {
    title: 'Integration with Payment Systems',
    description:
      'Integrate with popular payment systems to streamline transactions and credit updates.'
  }
];

const featureList: string[] = [
  'Transaction history',
  'Loyalty programs',
  'Secure storage',
  'Custom notifications',
  'Data analytics',
  'Reports',
  'Integrations',
  'Responsive design',
  'Multi-device support'
];

export const Features = () => {
  return (
    <section id="features" className="container space-y-6 py-12 sm:space-y-8 sm:py-24 lg:py-32">
      <h2 className="text-center text-2xl font-bold md:text-3xl lg:text-4xl">
        Discover{' '}
        <span className="bg-gradient-to-b from-primary/60 to-primary bg-clip-text text-transparent">
          Rewardify Features
        </span>
      </h2>

      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        {featureList.map((feature: string) => (
          <Badge 
            variant="secondary" 
            key={feature}
            className="text-xs md:text-sm whitespace-normal px-2 py-1 text-center transition-all hover:scale-105"
          >
            {feature}
          </Badge>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        {features.map(({ title, description }: FeatureProps) => (
          <Card key={title} className="h-full transition-all hover:border-primary/30">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
            </CardHeader>

            <CardContent className="p-4 md:p-6">
              <p className="text-sm text-muted-foreground md:text-base">
                {description}
              </p>
            </CardContent>

            <CardFooter className="p-4 md:p-6">
              {/* Uncomment for optional footer content */}
              {/* <Button variant="outline" size="sm" className="text-xs md:text-sm">
                Learn More →
              </Button> */}
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};