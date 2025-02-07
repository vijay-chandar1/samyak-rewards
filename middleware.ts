import NextAuth from 'next-auth';
import authConfig from './auth.config';
import { prisma } from './lib/db';

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const session = req.auth;
  const { pathname } = req.nextUrl;

  // Redirect unauthenticated users to sign-in
  if (!session?.user) {
    const url = req.url.replace(pathname, '/signin');
    return Response.redirect(url);
  }

  // Allow immediate access to upgrade route for authenticated users
  if (pathname.startsWith('/upgrade')) {
    return;
  }

  // Fetch profile completion status
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { profileCompletion: true }
  });

  // User tries to access onboarding after completion
  if (pathname.startsWith('/onboarding')) {
    if (user?.profileCompletion) {
      const url = req.url.replace(pathname, '/dashboard');
      return Response.redirect(url);
    }
    return; // Allow access to onboarding
  }

  // User tries to access dashboard without completion
  if (pathname.startsWith('/dashboard') && !user?.profileCompletion) {
    const url = req.url.replace(pathname, '/onboarding');
    return Response.redirect(url);
  }
});

export const config = { 
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/upgrade/:path*'
  ] 
};