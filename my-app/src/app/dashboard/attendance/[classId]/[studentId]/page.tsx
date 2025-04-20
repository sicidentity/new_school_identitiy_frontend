import { Metadata } from 'next';

interface PageParams {
  classId: string;
  studentId: string;
}

export default function StudentDetails({
  params,
}: {
  params: PageParams;
}) {
  return (
    <div>
      <h2>Student: {params.studentId}</h2>
      <p>Class: {params.classId}</p>
      {/* Show profile, attendance data, etc. */}
    </div>
  );
}

// Optional: If you use generateMetadata
export async function generateMetadata({ 
  params 
}: { 
  params: PageParams 
}): Promise<Metadata> {
  return {
    title: `Student ${params.studentId}`,
  };
}