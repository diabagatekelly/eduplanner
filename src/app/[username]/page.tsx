"use client"

export default function Dashboard({ params }: { params: { username: string } }) {
  return (
    <>
      <div>Welcome to your dashboard {params.username}</div>
    </>
  )
}