import EditPageClient from "@/components/EditPageClient";

// In your page.tsx file
export default async function EditPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string; id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  const id = Array.isArray(resolvedParams.id)
    ? resolvedParams.id[0]
    : resolvedParams.id ||
      (Array.isArray(resolvedSearchParams.id) ? resolvedSearchParams.id[0] : resolvedSearchParams.id);

  if (!id) {
    return <div>Invalid ID</div>
  }

  return <EditPageClient type={resolvedParams.type} id={id} />
}