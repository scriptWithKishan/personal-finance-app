import AddAccountButton from '#/components/add-account-button'
import { Button } from '#/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '#/components/ui/card';
import { deleteAccountFn, getAccountFn } from '#/server/account'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { Trash } from 'lucide-react';

export const Route = createFileRoute('/_protected/')({
    loader: async () => {
      return await getAccountFn();
    },
    component: Home 
  })

function Home() {
  const accounts = Route.useLoaderData();
  const router = useRouter();

  const handleDelete = async (id: string) => {
    await deleteAccountFn({ data: { id } });
    router.invalidate();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-4xl font-extrabold">Accounts</h1>
        <AddAccountButton />
      </div>
      {!accounts || accounts.length === 0 ? (
        <div className='text-center mt-4'>
          <h1 className='font-semibold text-xl'>No account yet, add your account!</h1>
        </div>
      ) : (
        <div className='mt-4 grid grid-cols-3 gap-2'>
          {accounts.map((account) => (
            <Link key={account.id} to="/a/$accId" params={{ accId: account.id }}>
              <Card>
                <CardHeader className='flex items-center justify-between'>
                  <CardTitle>{account.name}</CardTitle>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(account.id);
                    }}
                    size={'icon-sm'}
                    variant={'ghost'}
                  >
                    <Trash />
                  </Button>
                </CardHeader>
                <CardContent>
                  <h1 className='text-4xl font-extrabold'>{account.balance}</h1>
                </CardContent>
                <CardFooter>
                  {account.type} account
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>  
  )
}
