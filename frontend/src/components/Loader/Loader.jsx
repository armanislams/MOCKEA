const Loader = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="relative">
        {/* Outer pulsing ring */}
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"></div>
        {/* Inner spinning circle */}
        <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-primary animate-spin relative z-10 bg-white"></div>
      </div>
      <p className="mt-4 text-primary font-bold tracking-widest text-sm animate-pulse">
        LOADING...
      </p>
    </div>
  );
};

export default Loader;
