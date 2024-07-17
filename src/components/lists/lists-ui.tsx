'use client'

import StudentsList from "./students-list";
import ActivitiesList from "./activities-list";
import CardsList from "./cards-list";
import { IUser } from "@/interfaces/IUser";

export default function ListUi({ listType, isMain, userDetails, ...childArgs }: {listType: string, isMain: boolean, userDetails: IUser, childArgs?: any}) {

  return (
    <>
      {listType === 'students' && <StudentsList {...{userDetails}}/>}
      {listType === 'activities' && <ActivitiesList {...{isMain, userDetails}} />}
      {listType === 'cards' && <CardsList {...{isMain, userDetails, ...childArgs}} />}
    
      <div className="status-color-legend my-20">
        <p><span className="bg-green-500 border border-green-500 mr-2 w-20 h-3 inline-block"></span>COMPLETED</p>
        <p><span className="bg-orange-300 border border-orange-300 mr-2 w-20 h-3 inline-block"></span>PENDING</p>
        <p><span className="bg-gray-500 border border-gray-500 mr-2 w-20 h-3 inline-block"></span>INACTIVE / REVIEW</p>
        <p><span className="bg-red-500 border border-red-500 mr-2 w-20 h-3 inline-block"></span>DELINQUENT</p>
      </div>
    </>
  )
}
