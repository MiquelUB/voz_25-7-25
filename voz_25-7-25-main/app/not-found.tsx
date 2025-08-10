import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bone">
      <div className="max-w-md p-8 text-center">
        <h1 className="text-3xl font-serif font-semibold text-inforia mb-4">
          Página no encontrada
        </h1>
        <p className="text-muted-foreground mb-8">
          No pudimos encontrar la página que buscas.
        </p>
        <Button asChild className="bg-inforia hover:bg-inforia/90 text-bone">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  )
}