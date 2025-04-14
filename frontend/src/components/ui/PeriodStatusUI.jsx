function PeriodStatusUI({ loading, error, action }) {
    if (loading) {
      const actionText = {
        fetch: "Loading today's schedule...",
        add: "Adding new period...",
        edit: "Saving changes...",
        cancel: "Cancelling class...",
      }[action] || "Processing...";
  
      return (
        <div className="flex justify-center mt-6">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mr-4"></div>
          <p className="text-blue-300">{actionText}</p>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="mt-4 text-red-500 bg-red-100 border border-red-400 px-4 py-2 rounded-lg max-w-3xl w-full">
          An error occurred: {error.message || "Something went wrong."}
        </div>
      );
    }
  
    return null;
  }
  