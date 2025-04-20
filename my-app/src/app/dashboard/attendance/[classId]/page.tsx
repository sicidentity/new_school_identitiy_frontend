'use client'
import Link from 'next/link'

export default function StudentList({ params }: { params: { classId: string } }) {
  const students = ['john-doe', 'jane-smith'];

  return (
    <div>
      <h2>Students in {params.classId}</h2>
      <ul>
        {students.map(student => (
          <li key={student}>
            <Link href={`/dashboard/attendance/${params.classId}/${student}`}>{student}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
