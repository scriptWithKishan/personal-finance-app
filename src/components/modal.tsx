import type { ReactElement } from "react"
import { Button } from "./ui/button"
import { X } from "lucide-react"
import { cn } from "#/lib/utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void 
  title: string 
  children: ReactElement
  className?: string
}

const Modal = ({ isOpen, onClose, title, children, className }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={cn("bg-background p-6 rounded w-100 relative", className)}>
        <Button onClick={()=> onClose()} variant='ghost' className="absolute rounded-full right-1 top-1">
          <X /> 
        </Button>
        <h2 className="text-2xl font-bold">{title}</h2>
        {children}
      </div>
    </div>
  )
}

export default Modal