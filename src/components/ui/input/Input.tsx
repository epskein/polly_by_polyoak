const Input = ({ type = "text", className = "", ...props }) => {
    return (
      <input
        type={type}
        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${className}`}
        {...props}
      />
    );
  };
  
  export default Input;
  