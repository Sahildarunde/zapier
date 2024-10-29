import React from 'react';

const Loader: React.FC = () => {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="loader border-t-transparent border-solid rounded-full animate-spin border-gray-300 border-4 h-16 w-16"></div>
        </div>
    );
};

export default Loader;