import { getJobDetail } from "@/lib/api";
import { JobDetail } from "@/components/job-detail";

interface Props {
  params: { id: string };
}

export default async function JobDetailPage({ params }: Props) {
  const job = await getJobDetail(params.id);
  return (
    <div className="mx-auto max-w-4xl">
      <JobDetail job={job} />
    </div>
  );
}
