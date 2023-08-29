import Navbar from "../ui/navbar"

export default function Dashboard({ params }: { params: { username: string } }) {
  return (
    <>
      <Navbar />
      <div>Welcome to your dashboard {params.username}</div>
    </>
  )
}