"use client"

import ListUi from "@/components/lists/lists-ui";
import AddActivity from "./activities/add-activity";
import { IUser } from "@/interfaces/IUser";

export default function Dashboard({ userDetails, isMain, isTeacher }: { userDetails: IUser, isMain: boolean, isTeacher: boolean }) {
  const fullName = `${userDetails?.firstName} ${userDetails?.lastName}`
  return (
    <>
      {isMain ?
        <div>
          <h3 data-testid="dashboard-header" className="py-2.5">Welcome to your dashboard {fullName}.</h3>
          {isTeacher ?
            <div className="pt-5">
              <AddActivity {...{ userDetails }} />
              <hr className="my-5" />
              <ListUi {...{ listType: 'activities', isMain, userDetails }} />
            </div>
            :

            <div>
              <div className="pb-5">
                {userDetails.linkedAccountsData?.teacher ?
                  <h5 data-testid="student-instructions">Your teacher&#39;s email is {userDetails?.linkedAccountsData?.teacher}.</h5> :
                  <h5 data-testid="student-instructions">Ask your teacher or parent to add you and create some activities for you!</h5>
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
          <h3 data-testid="dashboard-header" className="py-2.5">Manage student {fullName}.</h3>
          <div className="pt-5">
            <AddActivity {...{ userDetails }} />
            <ListUi {...{ listType: 'activities', isMain, userDetails }} />
          </div>
        </div>
      }
    </>
  )
}