'use client'

import ClassEditForm from '@/components/main/class-management/class-edit-form'
import ParentEditForm from '@/components/main/parent-management/parent-edit-form'
import StudentEditForm from '@/components/main/student-management/student-edit-form'
import { useRouter } from 'next/navigation'

export default function EditPageClient({ type, id }: { type: string, id?: string }) {
  const router = useRouter()

  if (!id) {
    return <div className="p-4 text-red-600">Missing “id” query param</div>
  }

  const getRedirectPath = () => {
    if (['student', 'students'].includes(type)) {
      return '/student-management';
    } else if (['class', 'classes'].includes(type)) {
      return '/class-management';
    } else if (['parent', 'parents'].includes(type)) {
      return '/parent-management';
    }
    return '/';
  };

  const handleFinish = () => {
    router.push(getRedirectPath());
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {['student', 'students'].includes(type) && <StudentEditForm id={id} onSubmit={handleFinish} />}
      {['class', 'classes'].includes(type) && <ClassEditForm id={id} onSubmit={handleFinish} />}
      {['parent', 'parents'].includes(type) && <ParentEditForm id={id} onSubmit={handleFinish} />}
    </div>
  )
}
