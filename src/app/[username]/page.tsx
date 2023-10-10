"use client"

import NestedLayout from "@/app/nested-layout";
import store from "@/app/store";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardContent } from "../ui/dashboard-content";

// const DashboardContent = ({ params, user }: { params: { username: string }, user }) => {
//   console.log(user)
//   const fullName = `${params.username.split("-")[0]} ${params.username.split("-")[1]}`
//   return (
//     <>
//       <h3 className="py-2.5">Welcome to your dashboard {fullName}.</h3>
//       {user?.accountType?.includes('teacher') ?
//         <div className="pt-5">
//           {!user.cards ? <h5>You have no activity cards yet. Ask your parent or teacher to create some for you.</h5> :
//             user.cards.foreach((card) => {
//               <Link href="#" key="card">card.name</Link>
//             })
//           }
//         </div>
//         :

//         <div>
//           <div className="pb-5">
//             {user.teacherId ?
//               <h5>Your teacher's email is ${user.teacherId}</h5> :
//               <h5>Ask your teacher or parent to add you and create some activities for you!</h5>
//             }
//           </div>
//           <hr />
//           <div className="pt-5">
//             {!user.cards ? <h5>You have no activity cards yet. Ask your parent or teacher to create some for you.</h5> :
//               user.cards.foreach((card) => {
//                 <Link href="#" key="card">card.name</Link>
//               })
//             }
//           </div>
//         </div>
//       }

//     </>


//   )
// }

export default function Dashboard({ params }: { params: { username: string } }) {

  let args;
  const [user, getUserData] = useState({ ...args })

  useEffect(() => {
    const { userReducer } = store.getState()
    getUserData(userReducer);
  }, [])

  const isTeacher = user.accountType?.includes('teacher')
  const userDetails = user;

  return (
    <NestedLayout {...{ isTeacher }}>
      <DashboardContent {...{ params, userDetails }} />
    </NestedLayout>
  )
}