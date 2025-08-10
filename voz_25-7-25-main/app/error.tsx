'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bone">
      <div className="max-w-md p-8 text-center">
        <h1 className="text-3xl font-serif font-semibold text-inforia mb-4">
          Algo no salió como esperábamos
        </h1>
        <p className="text-muted-foreground mb-8">
          Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
        </p>
        <Button
          onClick={reset}
          className="bg-inforia hover:bg-inforia/90 text-bone"
        >
          Intentar de nuevo
        </Button>
      </div>
    </div>
  )
}