import { CheckCircle, AlertCircle, XCircle } from "lucide-react"
import { Toast, ToastClose, ToastDescription, ToastTitle } from "@/components/ui/toast"

interface CustomToastProps {
  title: string
  description?: string
  variant?: "default" | "success" | "destructive"
}

export function CustomToast({ title, description, variant = "default" }: CustomToastProps) {
  return (
    <Toast variant={variant === "destructive" ? "destructive" : "default"}>
      <div className="flex">
        {variant === "success" && <CheckCircle className="h-5 w-5 text-green-500 mr-2" />}
        {variant === "destructive" && <XCircle className="h-5 w-5 text-destructive mr-2" />}
        {variant === "default" && <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />}
        <div className="grid gap-1">
          <ToastTitle>{title}</ToastTitle>
          {description && <ToastDescription>{description}</ToastDescription>}
        </div>
      </div>
      <ToastClose />
    </Toast>
  )
}
