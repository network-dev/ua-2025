import React from "react";

function ErrorMessage({ message }) {
  return message ? <p style={{ color: "red" }}>{message}</p> : null;
}

export default ErrorMessage;
