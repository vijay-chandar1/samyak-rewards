import { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Resend from 'next-auth/providers/resend';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './lib/db';
import { authCallbacks } from './utils/resend-info';
import Facebook from "next-auth/providers/facebook"

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      from: 'no-reply@resend.dev'
    }),
    GitHub,
    Google,
    Facebook
  ],
  pages: {
    signIn: '/signin',
    verifyRequest: '/verify-request'
  },
  callbacks: authCallbacks
} satisfies NextAuthConfig;

export default authConfig;
