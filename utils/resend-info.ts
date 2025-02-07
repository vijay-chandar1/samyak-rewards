import { Account, User } from 'next-auth';

export const generateAvatarUrl = (name: string) => {
  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff`;
};

export const handleResendUser = (user: User) => {
  const email = user.email || '';
  const name = email.split('@')[0];

  return {
    ...user,
    name,
    image: generateAvatarUrl(name)
  };
};

export const authCallbacks = {
  async signIn({ user, account }: { user: User; account: Account | null }) {
    if (account?.provider === 'resend') {
      const updatedUser = handleResendUser(user);
      user.name = updatedUser.name;
      user.image = updatedUser.image;
    }
    return true;
  }
};
