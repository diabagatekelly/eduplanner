'use client'

import AddActivityForm from '../forms/add-activity-form'
import { useCreateActivity } from '@/hooks/use-activity-mutations'
import { IActivity } from '../../types/IActivity'
import { CompletionStatus } from '@/types/CompletionStatusEnum'
import { ISODateString } from '@/types/isoDateType'
import { IUser } from '@/types/IUser'
import { toDbFormat } from '@/lib/helpers/formatActivityName'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { activitySchema, ActivityFormData } from '@/lib/schemas/activity.schemas'
import { toast } from 'sonner'
import { handleMutationError } from '@/lib/helpers/mutation-error-handler'

export default function AddActivity({ userDetails }: { userDetails: IUser }) {
  const createActivityMutation = useCreateActivity(userDetails.userId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      name: '',
      description: '',
      points: 0,
      hasCards: 'false',
    },
  })

  async function submitForm(data: ActivityFormData): Promise<void> {
    try {
      if (userDetails.activities?.find((activity) => activity.name === data.name)) {
        toast.warning('This is already one of your activities.')
        reset()
        return
      }

      const dbActivityName = toDbFormat(data.name)
      const now = new Date()

      const userActivity: IActivity = {
        ...data,
        activityId: btoa(`${userDetails.email}-${dbActivityName}`),
        name: dbActivityName!,
        points: Number(data.points),
        completionStatus: CompletionStatus.PENDING,
        hasCards: data.hasCards === 'true' ? true : false,
        createdOn: now.toLocaleDateString('en-US', {
          timeZone: 'EST',
        }) as ISODateString,
        lastUpdatedOn: null,
      }

      const response = await createActivityMutation.mutateAsync(userActivity)
      toast.success(response.data.message)
      reset()
    } catch (error: unknown) {
      handleMutationError(error, 'create activity')
    }
  }

  return (
    <div className="justify-items-start">
      <h3 className="component-sub-title">Add a new activity:</h3>
      <div>
        <h6 className="text-1xl py-3 font-bold">Instructions on naming activity:</h6>
        <p>
          <span className="font-bold">For Quran: </span>Quran
        </p>
        <p>
          <span className="font-bold">For language: </span>(Target language) Language, ie. Arabic
          Language
        </p>
        <p>
          <span className="font-bold">Any other subject: </span>A name that isn&#39;t
          &#39;Quran&#39; and doesn&#39;t contain &#39;Language&#39;
        </p>
      </div>
      <AddActivityForm
        register={register}
        errors={errors}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit(submitForm)}
      />
      <hr className="my-5" />
    </div>
  )
}
