import StudentsList from "./students-list";
import ActivitiesList from "./activities-list";
import CardsList from "./cards-list";

const ListsUi = ({ listType, isMain, userDetails, ...childArgs }) => {

  const getBorderColor = (listItem) => {
    let borderColor = 'orange'
    if (['activities', 'cards'].includes(listType)) {
      if (listItem?.completionStatus === 'pending') {
        borderColor = 'orange'
      } else if (listItem?.completionStatus === 'completed') {
        borderColor = 'green'
      } else {
        borderColor = 'red'
      }
    }
    return borderColor;
  }

  return (
    <>
      {listType === 'students' && <StudentsList {...{isMain, userDetails, getBorderColor}}/>}
      {listType === 'activities' && <ActivitiesList {...{isMain, userDetails, getBorderColor}} />}
      {listType === 'cards' && <CardsList {...{isMain, userDetails, getBorderColor, ...childArgs}} />}
    </>
  )

}

export default ListsUi;