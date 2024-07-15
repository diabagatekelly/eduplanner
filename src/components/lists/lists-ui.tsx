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
    </>
  )
}
