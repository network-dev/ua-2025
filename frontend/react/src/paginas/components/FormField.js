import React from "react";

function FormField({ id, label, type, value, onChange, required, accept }) {
  return (
    <div>
      <label htmlFor={id}>{label}:</label>
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        required={required}
        accept={accept}
      />
    </div>
  );
}

export default FormField;
