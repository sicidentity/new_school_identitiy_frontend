import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reports',
  description: 'View and manage school reports',
}

export default function ReportPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Report content will be displayed here.</p>
      </div>
    </div>
  )
}
