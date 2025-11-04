export const showToast = (message: string, type: 'default' | 'info' = 'default') => {
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) {
        document.body.removeChild(existingToast);
    }

    const toast = document.createElement('div');
    toast.textContent = message;
    
    const baseClasses = 'toast-message fixed bottom-20 left-1/2 -translate-x-1/2 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    const typeClasses = type === 'info'
        ? 'bg-blue-500/90'
        : 'bg-black/80';

    toast.className = `${baseClasses} ${typeClasses} animate-toast-in`;
    
    document.body.appendChild(toast);

    setTimeout(() => {
        if (toast && document.body.contains(toast)) {
            toast.classList.remove('animate-toast-in');
            toast.classList.add('animate-toast-out');
            toast.addEventListener('animationend', () => {
                 if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            });
        }
    }, 2500);
}