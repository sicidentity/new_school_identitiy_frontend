'use client'
import Link from 'next/link'

const classes = Array.from({ length: 120 }, (_, i) => `class${i + 1}`);

export default function Classlist() {
  return (
    <div className="bg-white min-h-screen p-5">
      <div className="grid overflow-auto max-h-[calc(100vh-5rem)] mx-auto !px-[2.5%] !pt-[2%] grid-cols-4 gap-4 pb-[10%]">
        {classes.map(cls => (
          <Link 
            key={cls} 
            href={`/dashboard/attendance/${cls}`} 
            className="flex items-center justify-center hover:bg-gray-500 bg-gray-300 text-white no-underline !p-[2rem] rounded-md text-center font-bold"
          >
            {cls}
          </Link>
        ))}
      </div>
    </div>
  );
}
