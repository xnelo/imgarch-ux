'use client'

import { Toast, ToastContainer } from "react-bootstrap";
import toast, { resolveValue, ToastType, useToaster } from "react-hot-toast"

export default function Toaster() {
    const { toasts, handlers } = useToaster({duration: 5000});

    function closeToast(id:string) {
        toast.dismiss(id);
    }

    function getToastIconClass(toastType: ToastType) {
        switch (toastType) {
            case 'success':
                return "bi-check-circle-fill";
            case 'error':
                return "bi-x-circle-fill";
            case 'loading':
                return "bi-three-dots";
            case 'custom': // intentional fallthrough
            case 'blank': // intentional fallthrough
            default:
                return "";
        }
    }

    function getToastHeaderName(toastType: ToastType) {
        switch (toastType) {
            case 'success':
                return "Success";
            case 'error':
                return "Error";
            case 'loading':
                return "Loading";
            case 'custom': // intentional fallthrough
            case 'blank': // intentional fallthrough
            default:
                return "";
        }
    }

    return (
        <ToastContainer position="top-center" className="p-3" style={{ zIndex: 1 }}>
            {toasts.map((t)=>{
                return (
                <Toast key={t.id} 
                       onClose={()=>closeToast(t.id)} 
                       style={{background: "rgba(var(--bs-body-bg-rgb), 0.95)"}} 
                       onMouseEnter={handlers.startPause} 
                       onMouseLeave={handlers.endPause}>
                    <Toast.Header>
                        <span>
                            <i className={`text-danger bi ${getToastIconClass(t.type)}`}
                               style={{paddingRight: "10px"}}/>
                        </span>
                        <strong className="me-auto">{getToastHeaderName(t.type)}</strong>
                    </Toast.Header>
                    <Toast.Body>{resolveValue(t.message, t)}</Toast.Body>
                </Toast>);
            })}
        </ToastContainer>
    );
}