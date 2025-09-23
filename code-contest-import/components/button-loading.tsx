"use client"

import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/loading-spinner"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface ButtonLoadingProps {
  loading?: boolean
  children: ReactNode
  loadingText?: string
  className?: string
  [key: string]: any
}

export function ButtonLoading({
  loading = false,
  children,
  loadingText,
  className,
  ...props
}: ButtonLoadingProps) {
  return (
    <Button 
      className={cn(className)} 
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {loading ? (loadingText || "Loading...") : children}
    </Button>
  )
}