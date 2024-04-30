"use client"

import { useState, FormEvent } from "react";
import { findUser } from "../../api/controller";
import SearchUserForm from "../forms/search-user-form";
import Popup from "../popups/popup";
import { IUser } from "@/interfaces/IUser";

interface IAddStudent {
  handleInput: (e: React.FormEvent<HTMLInputElement>) => void,
  submitForm: (e: FormEvent<HTMLFormElement>) => Promise<void>
}

export default function AddStudent<IAddStudent>({ user }: {user: IUser}) {
  let args;

  const [formData, setFormData] = useState({
    email: ""
  });

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formSubmitOutcomeMessage, setFormSubmitOutcomeMessage] = useState("")
  const [newStudent, getStudentInfo] = useState<IUser>({ ...args });
  const [showModal, setShowModal] = useState(false);

  const modalType = 'addStudent';

  function handleInput(e: React.FormEvent<HTMLInputElement>) {
    if (formSubmitOutcomeMessage.length) {
      setFormSubmitOutcomeMessage('')
    }

    const target = e.target as HTMLInputElement
    const fieldName: string = target.name;
    const fieldValue: any = target.value;

    setFormData((prevState) => ({
      ...prevState,
      [fieldName]: fieldValue
    }));
  }

  function _resetForm() {
    setFormData({
      email: ""
    });
    setIsLoading(false)
  }

  async function submitForm(e: FormEvent<HTMLFormElement>): Promise<void> {
    try {
      // We don't want the page to refresh
      e.preventDefault()
      setIsLoading(true) // Set loading to true when the request starts

      const formData = new FormData(e.currentTarget)
      const newStudent = { email: '' }

      for (const pair of formData.entries()) {
        newStudent[pair[0]] = `${pair[1]}`;
      }

      if (newStudent.email === user.email) {
        setFormSubmitOutcomeMessage("You can't add yourself as a student.");
        _resetForm()
        return;
      }

      const currentStudents = user?.linkedAccountsData?.students
      if (currentStudents?.includes(newStudent.email)) {
        setFormSubmitOutcomeMessage('This is already one of your students.')
        _resetForm()
        return
      } 

      const newStudentUserId = {userId: btoa(newStudent.email)}

      const response = await findUser(newStudentUserId)
      const {data} = response;
      const {details}: {message: string, details: {student: IUser}} = data;
      setIsLoading(false)
      getStudentInfo(details.student)
      setShowModal(true)
      

    } catch (error) {
      setIsLoading(false)
      console.log(error)

      if (!error.response) {
        setFormSubmitOutcomeMessage('Server is down. Try again later.')
        return
      }

      const {status, data} = error.response;

      if (status === 500) {
        setFormSubmitOutcomeMessage('Failed to add new student due to an internal error. Please try again later.')
      } else {
        setFormSubmitOutcomeMessage(data.message)
      }
    }
  }

  return (
    <div className="justify-items-start">
      <h3 className="text-3xl py-3 font-bold">Add a new student:</h3>
      <p>Enter your student&#39;s email:</p>
      <SearchUserForm {...{ handleInput, formData, isLoading, submitForm }} />
      <Popup {...{ showModal, modalType, user, newStudent}} onClose={() => {console.log('called on closed??'); setShowModal(false)}} />
      <div data-testid="find-student-submit-message">{formSubmitOutcomeMessage}</div>
    </div>
  )
}