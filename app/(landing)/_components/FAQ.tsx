import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: 'What is Rewardify?',
    answer:
      'Rewardify is a SaaS platform that helps vendors track customer transactions, manage loyalty programs, and gain insights to encourage repeat business.',
    value: 'item-1'
  },
  {
    question: 'How does Rewardify help with customer loyalty?',
    answer:
      'Rewardify allows vendors to create and manage custom loyalty programs, track customer credits, and send personalized notifications to engage and retain customers.',
    value: 'item-2'
  },
  {
    question: 'Is my data secure with Rewardify?',
    answer:
      'Yes. Rewardify uses industry-standard encryption and secure storage to protect all your customer and transaction data.',
    value: 'item-3'
  },
  {
    question: 'Can I try Rewardify before purchasing?',
    answer:
      'Yes. Rewardify offers a free plan that lets you explore basic features and see how it fits your business needs.',
    value: 'item-4'
  },
  {
    question: 'Does Rewardify integrate with payment systems?',
    answer:
      'Yes. Rewardify integrates with popular payment systems to streamline your transactions and ensure seamless updates to customer credits.',
    value: 'item-5'
  }
];

export const FAQ = () => {
  return (
    <section id="faq" className="container py-24 sm:py-32">
      <h2 className="mb-6 text-center text-3xl font-extrabold text-gray-800 dark:text-gray-100 md:text-4xl">
        Frequently Asked{' '}
        <span className="bg-gradient-to-b from-primary/60 to-primary bg-clip-text text-transparent">
          Questions
        </span>
      </h2>
      <h3 className="mb-10 text-center text-lg text-gray-600 dark:text-gray-400">
        Everything you need to know about Rewardify.
      </h3>

      <Accordion type="single" collapsible className="w-full">
        {FAQList.map(({ question, answer, value }: FAQProps) => (
          <AccordionItem
            key={value}
            value={value}
            className="mb-4 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <AccordionTrigger className="flex items-center justify-between bg-gray-100 px-6 py-4 text-left text-sm font-semibold transition-all hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
              {question}
            </AccordionTrigger>
            <AccordionContent className="bg-white px-6 py-4 leading-relaxed text-gray-700 dark:bg-gray-900 dark:text-gray-300">
              {answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <h3 className="mt-8 text-center font-medium">
        Still have questions?{' '}
        <a
          rel="noreferrer noopener"
          href="#"
          className="border-primary font-semibold text-primary transition-all hover:border-b-2"
        >
          Contact us
        </a>
      </h3>
    </section>
  );
};
