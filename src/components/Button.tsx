// src/components/Button.tsx
import React from 'react';

type Props = {
  label: string;
  onClick?: () => void;
};

const Button = ({ label, onClick }: Props) => {
  return (
    <button
      onClick={onClick}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      {label}
    </button>
  );
};

export default Button;
