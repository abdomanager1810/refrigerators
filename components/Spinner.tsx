import React from 'react';

interface SpinnerProps {
    size?: 'xs' | 'sm' | 'md' | 'lg';
    color?: 'light' | 'dark';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color = 'light' }) => {
    const sizeClasses = {
        xs: 'h-3 w-3 border-2',
        sm: 'h-4 w-4 border-2',
        md: 'h-5 w-5 border-2',
        lg: 'h-8 w-8 border-4',
    };

    return (
        <div
            className={`spinner ${sizeClasses[size]} ${color === 'dark' ? 'spinner-dark' : 'spinner-light'}`}
            role="status"
            aria-label="loading"
        ></div>
    );
};

export default Spinner;
