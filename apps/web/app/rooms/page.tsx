import RoomsClient from './rooms-client';

type RoomsPageProps = {
  searchParams: Record<string, string | undefined>;
};

export default function RoomsPage({ searchParams }: RoomsPageProps) {
  return <RoomsClient initialFilters={searchParams} />;
}
