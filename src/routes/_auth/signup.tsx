import { createFileRoute, Link } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import z from 'zod';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { Field, FieldDescription, FieldLabel } from '#/components/ui/field';
import { signupFn } from '#/server/auth';

export const Route = createFileRoute('/_auth/signup')({
  component: RouteComponent,
})


function RouteComponent() {
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(1, { message: "Full name is required" }),
        email: z.string().email({ message: "Invalid Email"}),
        password: z.string().min(8, { message: "Password must be at least 8 characters" }),
      }),
    },
    onSubmit: async ({ value }) => {
      const response = await signupFn({ data: value });
      console.log(response);
      form.reset();
    }
  })  

  return (
    <Card className="w-100">
      <CardHeader className='flex justify-between'>
        <div>
          <CardTitle>Sign up</CardTitle>
          <CardDescription>Create an account to get started</CardDescription>
        </div>
        <Link to="/login">
          <Button variant="link">Login</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className='flex flex-col gap-2'
        >
          <form.Field
            name="name"
            children={(field) => (
              <Field className='flex flex-col gap-1'>
                <FieldLabel>Full Name</FieldLabel>
                <Input 
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  type="text"
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {!field.state.meta.isValid && (
                  <FieldDescription className='text-red-500 text-sm'>{field.state.meta.errors.map((e) => (typeof e === 'string' ? e : e?.message)).join(', ')}</FieldDescription>
                )}
              </Field>
            )}
          />
          <form.Field
            name="email"
            children={(field) => (
              <Field className='flex flex-col gap-1'>
                <FieldLabel>Email</FieldLabel>
                <Input 
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  type="text"
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {!field.state.meta.isValid && (
                  <FieldDescription className='text-red-500 text-sm'>{field.state.meta.errors.map((e) => (typeof e === 'string' ? e : e?.message)).join(', ')}</FieldDescription>
                )}
              </Field>
            )}
          />
          <form.Field
            name="password"
            children={(field) => (
              <Field>
                <FieldLabel>Password</FieldLabel>
                <Input 
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  type="password"
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {!field.state.meta.isValid && (
                  <FieldDescription className='text-red-500 text-sm'>{field.state.meta.errors.map((e) => (typeof e === 'string' ? e : e?.message)).join(', ')}</FieldDescription>
                )}
              </Field>
            )}
          />
          <Button type="submit">Sign up</Button>
        </form>
      </CardContent>
    </Card>
  )
}
