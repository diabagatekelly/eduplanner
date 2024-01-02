import { useState, useEffect } from "react";
import Popup from "../popups/popup";
import AddCard from "../add-card";
import { deleteCard } from "../../api/controller";
import { useDispatch } from "react-redux";
import { removeUserCard } from "@/app/actions/userActions";

const CardsList = ({isMain, userDetails, getBorderColor, ...childArgs}) => {
  let args;
  const dispatch = useDispatch()

  const [cardsList, getCardsList] = useState([])
  const [editList, addToEditList] = useState([])
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [popupItem, getPopupItem] = useState({ ...args })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formSuccess, setFormSuccess] = useState(false)
  const [formSuccessMessage, setFormSuccessMessage] = useState("")
  const [mode, setMode] = useState('add')
  const [cardsOfTheDay, getCardsOfTheDay] = useState([])

  useEffect(() => {
    const cards = childArgs?.activity?.cards || []
    getCardsList([...cards])

    const todayCards = cards?.filter((card) => {
      const nextShowDate = new Date(card.nextShowDate).getDate()
      const createdOn = new Date(card.createdOn).getDate()
      return Date.now() === createdOn || nextShowDate
    })
    getCardsOfTheDay(todayCards)
  }, [userDetails, childArgs?.activity?.cards])


  function fetchCard(front) {
    const card = childArgs?.activity?.cards?.find(card => card.front === front)
    getPopupItem(card)
    setShowModal(true)
    setModalType('manageCard')
  }

  async function removeCard(card) {
    try {
      const cardDetails = { email: childArgs.activity.email, activityName: childArgs.activity.name, id: card.id, username: card.username }
      const response = await deleteCard(cardDetails)
        .then(async (response) => {
          if (response.status !== 200) {
            setFormSuccessMessage(response.data.message)
          } else {
            dispatch(removeUserCard(response.data))
            setFormSuccessMessage('Successfully removed card')
            reset()
          }
        })
    } catch (error) {
      console.error(error)
      if (error.response) {
        setFormSuccessMessage(error.response.data.message)
      }
    }
  }

  function editCard(card) {
    const idx = cardsList.indexOf(card)
    setMode('edit')
    if (idx > -1) { // only splice array when item is found
      cardsList.splice(idx, 1); // 2nd parameter means remove one item only
      addToEditList(card)
    }
    dispatchInputEvent([card.front, card.back])
  }

  function reset() {
    dispatchInputEvent(['', ''])
    setFormSuccessMessage("")
    window.location.reload()
  }

  function dispatchInputEvent([frontVal, backVal]) {
    const frontInput = document.querySelector('input#front-0') as HTMLInputElement
    const backInput = document.querySelector('input#back-0') as HTMLInputElement

    frontInput.value = frontVal
    frontInput.dispatchEvent(new Event('input', { 
      bubbles: true,
    }));

    backInput.value = backVal
    backInput.dispatchEvent(new Event('input', { 
      bubbles: true,
    }));
  }


  function resetMode() {
    reset()
    setMode('add')
    getCardsList([...cardsList, editList])
  }


  return (
    <>
      <AddCard {...{ activity: childArgs.activity, mode: mode, resetMode: resetMode, cardToEdit: editList }} />
      {
        <ul>
          {cardsList?.map((card) => (
           cardsList?.length &&            
            <li style={{ borderColor: getBorderColor('cards') }} className="flex justify-between border-4" key={card.id}>
              <p className="hover:cursor-pointer" onClick={() => fetchCard(card.front)}>{card.front} {card.back}</p>
              <span onClick={() => editCard(card)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </span>
              <span onClick={async () => await removeCard(card)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </span>
            </li>          
          ))}
        </ul>
      }

      {!cardsList.length && <p>You have no cards to display today.</p>}
      <Popup {...{ showModal, modalType, isMain, user: userDetails, item: popupItem }} onClose={() => setShowModal(false)} />
      
    </>
  )

}

export default CardsList;