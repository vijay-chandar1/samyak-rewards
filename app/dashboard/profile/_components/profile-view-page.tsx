import ProfileForm from '../vendor-profile-form';
import PageContainer from '@/components/layout/page-container';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

async function fetchUserProfile() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      include: {
        companyDetails: {
          include: {
            taxDetails: true
          }
        }
      }
    });

    if (!user) return null;
    return user;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }
}

interface ProfileViewPageProps {
  params: {
    profileId?: string;
  };
}

export default async function ProfileViewPage({ params }: ProfileViewPageProps) {
  const user = await fetchUserProfile();
  
  if (!user) {
    return (
      <PageContainer>
        <ProfileForm pageTitle="Complete Your Profile" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ProfileForm initialData={user} />
    </PageContainer>
  );
}