import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'icon';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
  fullWidth = false,
  children,
}) => {
  const baseClasses = 'rounded-full font-medium transition-all focus:outline-none';
  
  const variantClasses = {
    primary: 'bg-green-500 text-black hover:bg-green-400 active:bg-green-600',
    secondary: 'bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-900',
    outline: 'bg-transparent border border-gray-700 text-white hover:bg-gray-800',
    text: 'bg-transparent text-white hover:text-green-500',
    icon: 'bg-transparent text-gray-400 hover:text-white p-2',
  };
  
  const sizeClasses = {
    small: 'px-3 py-1 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg',
  };
  
  // Do not apply padding to icon buttons
  const padding = variant === 'icon' ? '' : sizeClasses[size];
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${padding} 
        ${disabledClasses} 
        ${widthClass} 
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;