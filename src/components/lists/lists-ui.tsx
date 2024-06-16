import StudentsList from "./students-list";
import ActivitiesList from "./activities-list";
import {CardsList} from "./cards-list";
import { CompletionStatus } from "@/interfaces/CompletionStatusEnum";

const ListsUi = ({ listType, isMain, userDetails, ...childArgs }) => {

  const getBorderColor = (listItem) => {
    let borderColor = 'orange'
    if (['activities', 'cards'].includes(listType)) {
      if (listItem?.completionStatus === CompletionStatus.PENDING) {
        borderColor = 'orange'
      } else if (listItem?.completionStatus === CompletionStatus.COMPLETED) {
        borderColor = 'green'
      } else if (listItem?.completionStatus === CompletionStatus.REVIEW) {
        borderColor = 'gray'
      } else {
        borderColor = 'red'
      }
    }
    return borderColor;
  }

  return (
    <>
      {listType === 'students' && <StudentsList {...{userDetails, getBorderColor}}/>}
      {listType === 'activities' && <ActivitiesList {...{isMain, userDetails, getBorderColor, ...childArgs}} />}
      {listType === 'cards' && <CardsList {...{isMain, userDetails, getBorderColor, ...childArgs}} />}
    </>
  )

}

export default ListsUi;