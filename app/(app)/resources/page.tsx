import { ReferenceFiles } from '@/components/resources/ReferenceFiles';

export default function ResourcesPage() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-brand">Reference Files</h1>
        <p className="text-base text-text-muted mt-1">Shared resources available to the entire team.</p>
      </div>
      <ReferenceFiles />
    </div>
  );
}
