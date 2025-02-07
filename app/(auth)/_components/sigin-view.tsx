import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import UserAuthForm from './vendor-auth-form';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignInViewPage() {
  return (
    <div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/examples/authentication"
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute right-4 top-4 hidden md:right-8 md:top-8'
        )}
      >
        Login
      </Link>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <Link href="/">
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Image
              src="/backup-stl-logo.svg"
              alt="Logo"
              width={48}  // Added width
              height={40} // Added height
              className="mr-2 h-10 w-12 dark:brightness-150"
              unoptimized // Optional: if you want to keep SVG unoptimized
            />
            Samyak Tech Labs
          </div>
        </Link>

        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Track customer transactions seamlessly, reward loyalty with
              ease, and promote repeat business through personalized offers and
              credits.&rdquo;
            </p>
          </blockquote>
        </div>
      </div>
      <div className="flex h-full items-center p-4 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Get Started
            </h1>
            <p className="text-sm text-muted-foreground">
              Use your social account to continue
            </p>
          </div>
          <UserAuthForm />

          <p className="px-8 text-center text-sm text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}