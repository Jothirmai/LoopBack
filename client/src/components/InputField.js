import React from 'react';
import { colors } from '../styles/theme';

const InputField = ({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  showPasswordToggle,
  togglePasswordVisibility,
}) => {
  return (
    <div style={styles.fieldContainer}>
      {label && <label htmlFor={name} style={styles.label}>{label}</label>}
      <div style={styles.inputWrapper}>
        {Icon && (
          <span style={styles.iconLeft}>
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
            ...styles.input,
            paddingLeft: Icon ? '2.25rem' : '1rem',
            paddingRight: showPasswordToggle ? '2.25rem' : '1rem',
          }}
        />
        {showPasswordToggle && (
          <span
            onClick={togglePasswordVisibility}
            style={styles.iconRight}
          >
            {type === 'password' ? (
              <i className="bi bi-eye-slash"></i>
            ) : (
              <i className="bi bi-eye"></i>
            )}
          </span>
        )}
      </div>
    </div>
  );
};

const styles = {
  fieldContainer: {
    marginBottom: '1rem',
    width: '100%',
    maxWidth: '100%',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: colors.textColor,
    fontSize: '1rem',
    fontWeight: '500',
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },
  iconLeft: {
    position: 'absolute',
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: colors.textColor,
    pointerEvents: 'none',
  },
  iconRight: {
    position: 'absolute',
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: colors.textColor,
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '0.375rem',
    border: '1px solid #cbd5e0',
    outline: 'none',
    fontSize: '1rem',
    color: colors.textColor,
    backgroundColor: 'white',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  },
};

export default InputField;
