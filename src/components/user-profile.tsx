"use-client"

import { IUser } from "@/interfaces/IUser";

export default function UserProfile({user}: {user: IUser}) {
  const getStudentListOrTeacher = () => {
    let linkedAccountsMessage = 'None';
    let userLinkedAccounts = user?.linkedAccountsData;
    if (user?.accountType === 'student' && userLinkedAccounts.teacher !== null) {
      linkedAccountsMessage = `${atob(userLinkedAccounts.teacher)} (teacher)`
    } else if (user?.accountType === 'teacher' && userLinkedAccounts.students?.length) {
      const students = userLinkedAccounts.students.map(encodedEmail => encodedEmail[1].split('-').join(' '))
      linkedAccountsMessage = `${students.join(', ')} (students)`
    }
    return linkedAccountsMessage
  }
  
  return (
    <div className="flex flex-col px-3">
      <div className="justify-items-start">
        <h2 className="text-4xl py-3 font-bold">Personal Info</h2>
        <div data-testid="profile-info" className="personal-info">
          <p data-testid="profile-first" className="py-1"><span className="font-bold">First Name:</span> {user.firstName}</p>
          <p data-testid="profile-last" className="py-1"><span className="font-bold">Last Name:</span> {user.lastName}</p>
          <p data-testid="profile-email" className="py-1"><span className="font-bold">Email:</span> {user.email}</p>
          <p data-testid="profile-accountType" className="py-1"><span className="font-bold">Account Type(s):</span> {user.accountType}</p>
          <p data-testid="profile-linkedAccounts" className="py-1"><span className="font-bold">Linked Accounts:</span> {getStudentListOrTeacher()}</p>
          <p data-testid="profile-login" className="py-1"><span className="font-bold">Last logged in:</span> {user.lastLogin}</p>
        </div>
      </div>
    </div>
  )
}