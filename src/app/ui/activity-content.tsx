"use client"

export const ActivityContent = ({activityDetails}) => {
  
  return (
    <>
      <h3>{activityDetails?.name}</h3>
      <p>{activityDetails?.description}</p>
      <p>{activityDetails?.points} points</p>
      <p>{activityDetails?.hasDecks ? 'Get queue' : 'No decks'}</p>
    </>
  )
}

