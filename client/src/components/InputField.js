// src/components/InputField.js
import React from 'react';
import { colors } from '../styles/theme';

const InputField = ({ label, type, name, value, onChange, placeholder, icon: Icon, showPasswordToggle, togglePasswordVisibility }) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && <label htmlFor={name} style={{ display: 'block', marginBottom: '0.5rem', color: colors.textColor }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {Icon && (
          <span style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: colors.textColor
          }}>
            <Icon size={18} />
          </span>
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            paddingLeft: Icon ? '40px' : '1rem',
            borderRadius: '0.375rem',
            border: `1px solid #cbd5e0`,
            outline: 'none',
            fontSize: '1rem',
            color: colors.textColor,
            backgroundColor: 'white',
          }}
        />
        {showPasswordToggle && (
          <span
            onClick={togglePasswordVisibility}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              color: colors.textColor
            }}
          >
            {type === 'password' ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
          </span>
        )}
      </div>
    </div>
  );
};

export default InputField;