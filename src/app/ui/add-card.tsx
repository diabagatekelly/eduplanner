import { useState, FormEvent, useEffect } from "react";
import { createUserCard, editUserCard } from "../actions/userActions";
import AddCardForm from "./add-card-form";
import { useDispatch } from "react-redux";
import { ICard } from "../interfaces/ICard";
import { createCard, editCard } from "../api/controller";

const AddCard = ({ activity, ...args }) => {
  const dispatch = useDispatch()

  const [formData, setFormData] = useState<ICard[]>([
    {
      front: "",
      back: ""
    }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formSuccess, setFormSuccess] = useState(false)
  const [formSuccessMessage, setFormSuccessMessage] = useState("")

  useEffect(() => {
  }, [formData, args.mode])


  const handleInput = (e: any, index) => {
    const fieldName: string = e.target.name;
    const fieldValue: any = e.target.value;
    const values = [...formData];

    if (fieldName.includes('front')) {
      values[index].front = fieldValue
    } else {
      values[index].back = fieldValue
    }

    setFormData(values);
  }

  function addCardFieldset() {
    if (args.mode === 'edit') {
      args.resetMode()
    } else {
      const values = [...formData];
      const newSet = {
        front: "",
        back: ""
      }
      values.push(newSet)    
      setFormData(values)
    }
  }

  function reset() {
    setFormData([
      {
        front: "",
        back: ""
      }
    ]);
    setFormSuccessMessage("");
    window.location.reload()
  }


  async function submitForm(e: FormEvent<HTMLFormElement>): Promise<any> {
    const data = e.currentTarget || e.target as HTMLFormElement
    // We don't want the page to refresh
    e.preventDefault()
    setIsLoading(true) // Set loading to true when the request starts
    let indivCardFormData = []
    let response;
    try {
      if (args.mode === 'edit') {
        response = await submitEditCard(data, indivCardFormData)
      } else {
        response = await submitCreateCard(data, indivCardFormData)
      }

    } catch (error) {
      console.error(error)
      setIsLoading(false)
      setFormSuccess(false)
      if (error.response) {
        setFormSuccessMessage(error.response.data.message)
      }
    }
  }

  async function submitCreateCard(formData, indivCardFormData) {
    const rawFormData = new FormData(formData)

    for (const pair of rawFormData.entries()) {
      const index = pair[0].split('-')[1]
      if (pair[0].split('-')[0] === 'front') {
        indivCardFormData.push({ 'front': pair[1] })
      } else {
        indivCardFormData[index]['back'] = pair[1]
      }
    }

    if (activity?.cards?.find(card => indivCardFormData.some(item => item.front === card.front && item.back === card.back))) {
      setFormSuccess(false)
      setFormSuccessMessage("One of these new cards already exists.");
      return;
    }

    const jsonData = indivCardFormData.map((card) => {
      return { 
        front: card.front, 
        back: card.back, 
        username: activity?.username, 
        email: activity?.email, 
        activityName: activity.name, 
      }
    })

    const response = await createCard(jsonData)
      .then(async (response) => {
        setIsLoading(false)
        if (response.status !== 200) {
          setFormSuccess(false)
          setFormSuccessMessage(response.data.message)
        } else {
          setFormSuccess(true);
          dispatch(createUserCard(response.data))
          reset();
        }
      })

    return response
  }

  async function submitEditCard(formData, indivCardFormData) {
    const rawFormData = new FormData(formData)

    for (const pair of rawFormData.entries()) {
      const index = pair[0].split('-')[1]
      if (pair[0].split('-')[0] === 'front') {
        indivCardFormData.push({ 'front': pair[1] })
      } else {
        indivCardFormData[index]['back'] = pair[1]
      }
    }

    if (!(activity?.cards?.find(card => card.front === args.cardToEdit.front && card.back === args.cardToEdit.back))) {
      setFormSuccess(false)
      setFormSuccessMessage("Oops, we couldn't find this card to edit.");
      return;
    }

    if (indivCardFormData[0].front === args.cardToEdit.front && indivCardFormData[0].back === args.cardToEdit.back) {
      setFormSuccess(false)
      setFormSuccessMessage("Oops, we found the card to edit, but it doesn't look like you've changed anything about it.");
      return;
    }

    const jsonData = indivCardFormData.map((card) => {
      return { 
        previous: {front: args.cardToEdit.front, back: args.cardToEdit.back}, 
        updated: {front: card.front, back: card.back}, 
        username: activity?.username, 
        email: activity?.email, 
        activityName: activity.name, 
        id: args.cardToEdit.id }
    })


    const response = await editCard(jsonData)
      .then(async (response) => {
        setIsLoading(false)
        if (response.status !== 200) {
          setFormSuccess(false)
          setFormSuccessMessage(response.data.message)
        } else {
          setFormSuccess(true);
          dispatch(editUserCard(response.data))
          reset();
        }
      })

    return response
  }

  return (
    <div className="justify-items-start">
      <h3 className="text-3xl py-3 font-bold">Add new cards:</h3>
      <AddCardForm {...{ handleInput, formData, isLoading, submitForm, addCardFieldset, mode: args.mode }} />
      <div>{formSuccessMessage}</div>
    </div>
  )
}

export default AddCard;