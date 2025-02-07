import ProfileViewPage from "./_components/profile-view-page";

export const metadata = {
  title: 'Dashboard : Profile'
};

// Add dynamic configuration
export const dynamic = 'force-dynamic';

export default function Page({ params }: { params: { profileId?: string } }) {
  return <ProfileViewPage params={params} />;
}