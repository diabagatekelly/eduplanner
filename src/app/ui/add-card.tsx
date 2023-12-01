import { useState, FormEvent, useEffect } from "react";
import { createUserCard } from "../actions/userActions";
import AddCardForm from "./add-card-form";
import { useDispatch } from "react-redux";
import { ICard } from "../interfaces/ICard";
import { createCard } from "../api/controller";

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
    if (args) {
      console.log()
      document.querySelector('input')?.setAttribute('value', args?.cardDetails?.front)

      setFormData([
        {
          front: args?.cardDetails?.front,
          back: args?.cardDetails?.back
        }
      ]);
    }
  }, [])


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

  const addCardFieldset = () => {
    const values = [...formData];
    const newSet = {
      front: "",
      back: ""
    }
    values.push(newSet)    
    setFormData(values)
  }

  const reset = () => {
    setTimeout(() => {
      setFormData([
        {
          front: "",
          back: ""
        }
      ]);
      setFormSuccessMessage("")
    }, 3000)
  }


  async function submitForm(e: FormEvent<HTMLFormElement>): Promise<any> {
    // We don't want the page to refresh
    e.preventDefault()
    setIsLoading(true) // Set loading to true when the request starts
    let indivCardFormData = []
    try {
      const rawFormData = new FormData(e.currentTarget)

      for (const pair of rawFormData.entries()) {
        const index = pair[0].split('#')[1]
        if (pair[0].split('#')[0] === 'front') {
          indivCardFormData.push({ 'front': pair[1] })
        } else {
          indivCardFormData[index]['back'] = pair[1]
        }
      }


      if (activity?.cards?.find(card => indivCardFormData.some(item => item.front === card.front && item.back === card.back))) {
        setFormSuccess(false)
        setFormSuccessMessage("One of these new cards already exists.");
        reset()
        return;
      }

      const jsonData = indivCardFormData.map((card) => {
        return { front: card.front, back: card.back, username: activity?.username, email: activity?.email, activityName: activity.name, completionStatus: 'pending' }
      })


      const response = await createCard(jsonData)
        .then(async (response) => {
          setIsLoading(false)
          if (response.status !== 200) {
            setFormSuccess(false)
            setFormSuccessMessage(response.data.message)
            reset()
          } else {
            setFormSuccess(true);
            dispatch(createUserCard(response.data))
          }
        })

    } catch (error) {
      console.error(error)
      setIsLoading(false)
      setFormSuccess(false)
      if (error.response) {
        setFormSuccessMessage(error.response.data.message)
      }
      reset()
    }
  }

  return (
    <div className="justify-items-start">
      <h3 className="text-3xl py-3 font-bold">Add a new card:</h3>
      <AddCardForm {...{ handleInput, formData, isLoading, submitForm, addCardFieldset }} />
      <div>{formSuccessMessage}</div>
    </div>
  )
}

export default AddCard;