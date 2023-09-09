"use client"

import NestedLayout from "@/app/nested-layout";

const DashboardContent = ({ params }: { params: { username: string } }) => {
  return (
    <div>Welcome to your dashboard {params.username}</div>
  )
}

export default function Dashboard({ params }: { params: { username: string } }) {
  return (
    <NestedLayout>
      <DashboardContent {...{params}} />
    </NestedLayout>
  )
}