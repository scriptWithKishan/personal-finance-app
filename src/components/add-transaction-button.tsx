import { Button } from '#/components/ui/button'
import { useState } from 'react'
import Modal from './modal'
import { useForm } from '@tanstack/react-form'
import { useRouter } from '@tanstack/react-router'
import z from 'zod'
import { Field, FieldLabel } from './ui/field'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { addTransactionFn } from '#/server/transaction'

interface AddTransactionButtonProps {
  accountId?: string
}

const TRANSACTION_TYPES = ['Credit', 'Debit'] as const
export type TransactionType = (typeof TRANSACTION_TYPES)[number]

const transactionSchema = z.object({
  name: z.string().min(1, { message: 'Enter valid name' }),
  description: z.string().optional(),
  category: z.string().min(1, { message: 'Enter valide category' }),
  amount: z.number().positive({ message: 'Enter positive value' }),
  type: z.enum(TRANSACTION_TYPES)
})

type TransactionFormValues = z.input<typeof transactionSchema>

const defaultValues: TransactionFormValues = {
  name: '',
  description: '',
  category: '',
  amount: 0,
  type: TRANSACTION_TYPES[0]
}

const AddTransactionButton = ({ accountId }: AddTransactionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: transactionSchema
    },
    onSubmit: async ({ value }) => {
      if (!accountId) return

      await addTransactionFn({
        data: {
          ...value,
          description: value.description ?? '',
          accountId,
        },
      })
      form.reset()
      setIsOpen(false)
      router.invalidate()
    }
  })

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Add Transaction</Button>
      <Modal 
        isOpen={isOpen} 
        onClose={()=> setIsOpen(false)}
        title="Add Transaction"
        className='w-200'
      >
        <form
          className="flex flex-col gap-4 mt-4"
          onSubmit={(e)=> {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <div className='flex items-center gap-2'>
            <form.Field
              name='name'
              children={(field)=> (
                <Field>
                  <FieldLabel>Name</FieldLabel>
                  <Input 
                    type='text'
                    name={field.name}
                    value={field.state.value}
                    onChange={(e)=> field.setValue(e.target.value)}
                    placeholder='Enter transaction name'
                  />
                </Field>
              )}
            />
            <form.Field
              name='type'
              children={(field)=> (
                <Field>
                  <FieldLabel>Type</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) =>
                      field.handleChange(val as TransactionType)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSACTION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>
          <form.Field
            name='description'
            children={(field)=> (
              <Field>
                <FieldLabel>Description</FieldLabel>
                <Textarea
                  name={field.name}
                  value={field.state.value}
                  onChange={(e)=> field.setValue(e.target.value)}
                  placeholder='Enter transaction description'
                />
              </Field>
            )}
          />
          <form.Field
            name='category'
            children={(field)=> (
              <Field>
                <FieldLabel>Category</FieldLabel>
                <Input
                  type='text'
                  name={field.name}
                  value={field.state.value}
                  onChange={(e)=> field.handleChange(e.target.value)}
                  placeholder='Enter transaction category'
                />
              </Field>
            )}
          />
          <form.Field
            name='amount'
            children={(field)=> (
              <Field>
                <FieldLabel>Amount</FieldLabel>
                <Input
                  type='number'
                  name={field.name}
                  value={field.state.value}
                  onChange={(e)=> field.handleChange(
                    e.target.value === '' ? 0 : Number(e.target.value)
                  )}
                  placeholder='Enter transaction amount'
                />
              </Field>
            )}
          />
          <Button type='submit' className='mt-4'>Add Transaction</Button>
        </form>
      </Modal>
    </div>
  )
}

export default AddTransactionButton