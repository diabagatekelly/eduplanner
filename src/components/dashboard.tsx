"use client"

import ListUi from "@/components/lists/lists-ui";
import AddActivity from "./activities/add-activity";

export const Dashboard = ({ params, userDetails, isMain }: { params: { username: string }, userDetails, isMain }) => {
  const fullName = `${userDetails?.username?.split("-")[0]} ${userDetails?.username?.split("-")[1]}`
  return (
    <>
      {isMain ?
        <div>
          <h3 className="py-2.5">Welcome to your dashboard {fullName}.</h3>
          {userDetails?.accountType?.includes('teacher') ?
            <div className="pt-5">
              <AddActivity {...{ userDetails }} />
              <hr className="my-5" />
              <ListUi {...{ listType: 'activities', isMain, userDetails }} />
            </div>
            :

            <div>
              <div className="pb-5">
                {userDetails?.teacherId ?
                  <h5>Your teacher&#39;s email is {userDetails?.teacherId}</h5> :
                  <h5>Ask your teacher or parent to add you and create some activities for you!</h5>
                }
              </div>
              <hr />
              <div className="pt-5">
                <ListUi {...{ listType: 'activities', isMain, userDetails }} />
              </div>
            </div>
          }
        </div>

        :

        <div>
          <h3 className="py-2.5">Manage student {fullName}.</h3>
          <div className="pt-5">
            <AddActivity {...{ userDetails }} />
            <ListUi {...{ listType: 'activities', isMain, userDetails }} />
          </div>
        </div>
      }
    </>
  )
}