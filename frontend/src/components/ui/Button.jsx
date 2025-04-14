export default function Button({ children, onClick, variant }) {
    const styles =
      variant === "outline"
        ? "border border-gray-500 bg-blue-500 text-white px-4 py-2 rounded hover:bg-gray-200 hover:text-gray-800"
        : "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600";
    return (
      <button className={styles} onClick={onClick}>
        {children}
      </button>
    );
  }