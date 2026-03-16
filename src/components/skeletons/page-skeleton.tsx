export default function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 w-48 bg-gray-200 rounded" />
      <div className="h-4 w-72 bg-gray-200 rounded" />
      <div className="space-y-3 mt-6">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-5/6 bg-gray-200 rounded" />
        <div className="h-4 w-4/6 bg-gray-200 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="h-24 bg-gray-200 rounded" />
        <div className="h-24 bg-gray-200 rounded" />
      </div>
    </div>
  )
}
