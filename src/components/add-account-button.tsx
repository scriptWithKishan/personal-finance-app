import Modal from '#/components/modal'
import { Button } from '#/components/ui/button'
import { Field, FieldError, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { addAccountFn } from '#/server/account'
import { useForm } from '@tanstack/react-form'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import z from 'zod'


const ACCOUNT_TYPES = [
  'Savings',
  'Investment',
  'Liability',
  'Income',
  'Cash',
  'Others',
] as const

export const accountTypes = ACCOUNT_TYPES.map((name) => ({ name }))
export type AccountType = (typeof ACCOUNT_TYPES)[number]

const AddAccountButton = () => {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      name: '',
      type: ACCOUNT_TYPES[1] as AccountType,
      balance: 0,
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(1, { message: 'Enter valid name' }),
        type: z.enum(ACCOUNT_TYPES),
        balance: z.number().positive({ message: 'Enter positive value' }),
      }),
    },
    onSubmit: async ({ value }) => {
      await addAccountFn({ data: value })
      form.reset()
      setIsOpen(false);
      router.invalidate()
    },
  })

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add Account</Button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add new account here"
        className="w-200"
      >
        <form
          className="flex flex-col gap-4 mt-4"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.Field
            name="name"
            children={(field) => (
              <Field>
                <FieldLabel>Account name</FieldLabel>
                <Input
                  type="text"
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter account name"
                />
                {field.state.meta.errors.length > 0 && (
                  <FieldError>
                    {field.state.meta.errors
                      .map((e) =>
                        typeof e === 'object' && e ? e.message : String(e)
                      )
                      .join(', ')}
                  </FieldError>
                )}
              </Field>
            )}
          />

          <form.Field
            name="type"
            children={(field) => (
              <Field>
                <FieldLabel>Account type</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={(val) =>
                    field.handleChange(val as AccountType)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors.length > 0 && (
                  <FieldError>
                    {field.state.meta.errors
                      .map((e) =>
                        typeof e === 'object' && e ? e.message : String(e)
                      )
                      .join(', ')}
                  </FieldError>
                )}
              </Field>
            )}
          />

          <form.Field
            name="balance"
            children={(field) => (
              <Field>
                <FieldLabel>Initial balance</FieldLabel>
                <Input
                  type="number"
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value === '' ? 0 : Number(e.target.value)
                    )
                  }
                  placeholder="0.00"
                />
                {field.state.meta.errors.length > 0 && (
                  <FieldError>
                    {field.state.meta.errors
                      .map((e) =>
                        typeof e === 'object' && e ? e.message : String(e)
                      )
                      .join(', ')}
                  </FieldError>
                )}
              </Field>
            )}
          />

          <Button type="submit" className="w-full mt-2">
            Submit
          </Button>
        </form>
      </Modal>
    </>
  )
}

export default AddAccountButton