interface AlertProps {
    type: 'success' | 'error'
    message: string
}

export function AlertMessage({ type, message }: AlertProps) {
    return (
        <div className={`px-4 py-3 rounded-md ${type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
        </div>
    )
} 