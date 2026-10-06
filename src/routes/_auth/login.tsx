import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import z from 'zod';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { Field, FieldDescription, FieldLabel } from '#/components/ui/field';
import { loginFn } from '#/server/auth';

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute('/_auth/login')({
  validateSearch: loginSearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { redirect } = Route.useSearch();
  const destination = redirect || "/";

  const router = useRouter();
  const form = useForm({  
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: z.object({
        email: z.string().email({ message: "Invalid Email"}),
        password: z.string().min(8, { message: "Password must be at least 8 characters" }),
      }),
    },
    onSubmit: async ({ value }) => {
      const response = await loginFn({ data: value });
      if (response?.error) {
        console.error(response.error);
        return;
      }
      await router.navigate({ to: destination });
      form.reset();
    }
  })

  return (
    <Card className="w-100">
      <CardHeader className='flex justify-between'>
        <div>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Sign in to access our application</CardDescription>
        </div>
        <Link to="/signup">
          <Button variant="link">Sign up</Button>
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
