'use client'
import Link from 'next/link'

const classes = ['math101', 'science202', 'english303'];

export default function Classlist() {
  return (
    <div>
      <h2>Select a Class</h2>
      <ul>
        {classes.map(cls => (
          <li key={cls}>
            <Link href={`/dashboard/attendance/${cls}`}>{cls}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
