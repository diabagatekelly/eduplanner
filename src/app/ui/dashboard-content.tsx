import Link from "next/link"

export const DashboardContent = ({ params, userDetails }: { params: { username: string }, userDetails }) => {
  const fullName = `${userDetails?.username?.split("-")[0]} ${userDetails?.username?.split("-")[1]}`
  return (
    <>
      <h3 className="py-2.5">Welcome to your dashboard {fullName}.</h3>
      {userDetails?.accountType?.includes('teacher') ?
        <div className="pt-5">
          {!userDetails?.cards ? <h5>You have no activity cards yet.</h5> :
            userDetails?.cards.foreach((card) => {
              <Link href="#" key="card">card.name</Link>
            })
          }
        </div>
        :

        <div>
          <div className="pb-5">
            {userDetails?.teacherId ?
              <h5>Your teacher's email is {userDetails?.teacherId}</h5> :
              <h5>Ask your teacher or parent to add you and create some activities for you!</h5>
            }
          </div>
          <hr />
          <div className="pt-5">
            {!userDetails?.cards ? <h5>You have no activity cards yet. Ask your parent or teacher to create some for you.</h5> :
              userDetails?.cards.foreach((card) => {
                <Link href="#" key="card">card.name</Link>
              })
            }
          </div>
        </div>
      }

    </>


  )
}