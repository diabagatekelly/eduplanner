import { useState, useEffect } from "react";
import Popup from "../popups/popup";
import { useRouter } from "next/navigation";
import { usePathname } from 'next/navigation'
import AddCard from "../add-card";

const CardsList = ({isMain, userDetails, getBorderColor, ...childArgs}) => {
  let args;
  const router = useRouter();
  const pathName = usePathname();

  const [cardsList, getCardsList] = useState([])
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [popupItem, getPopupItem] = useState({ ...args })
  const [listMode, setListMode] = useState('display')
  const [editableCard, getCardForEdit] = useState({...args})

  useEffect(() => {
    const cards = childArgs?.activity?.cards || []
    getCardsList([...cards])
  }, [userDetails, childArgs?.activity?.cards])


  const fetchCard = (cardFront) => {
    const card = childArgs?.activity?.cards?.find(card => card.front === cardFront)
    getPopupItem(card)
    setShowModal(true)
    setModalType('manageCard')
  }

  const deleteCard = (cardFront) => {

  }

  function editCard(card) {
    setListMode('edit')
    getCardForEdit({...card})
  }


  return (
    <>
      {listMode === 'display' && cardsList?.length &&
        <ul>
          {cardsList?.map((card) => (
            
            <li style={{ borderColor: getBorderColor('cards') }} className="flex justify-between border-4" key={card.front}>
              <p className="hover:cursor-pointer" onClick={() => fetchCard(card.front)}>{card.front}</p>
              <span onClick={() => editCard(card)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </span>
              <span onClick={() => deleteCard(card.front)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </span>
            </li>
          ))}
        </ul>
      }

      {listMode === 'edit' && cardsList.length &&
         <div>
           <AddCard {...{ activity: childArgs?.activity, cardDetails: {front: editableCard.front, back: editableCard.back} }} /> <span onClick={() => setListMode('display')}>Cancel</span>
         </div>
      }

      {!cardsList.length && <p>You have no cards to display today.</p>}
      <Popup {...{ showModal, modalType, isMain, user: userDetails, item: popupItem }} onClose={() => setShowModal(false)} />
      
    </>
  )

}

export default CardsList;