export default function Card({ children }) {
    return <div className="p-4 relative shadow-xl 
    rounded-2xl border border-gray-700 backdrop-blur-md bg-[#111] transition-all duration-500 hover:border-blue-500 hover:shadow-blue-500/50">{children}</div>;
  }