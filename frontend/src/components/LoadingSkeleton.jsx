import React from 'react';

const LoadingSkeleton = ({ type = 'doctorCard', count = 1 }) => {
  const skeletons = Array(count).fill(0);

  const renderSkeleton = () => {
    switch (type) {
      case 'doctorCard':
        return (
          <div className="glass-panel p-6 rounded-3xl animate-pulse flex flex-col gap-4">
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700"></div>
              <div className="flex flex-col gap-2 flex-grow">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-2/3"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-1/2"></div>
              </div>
            </div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-full"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-5/6"></div>
            <div className="flex justify-between items-center mt-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/4"></div>
              <div className="w-24 h-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            </div>
          </div>
        );
      case 'tableRow':
        return (
          <div className="flex gap-4 items-center py-4 border-b border-slate-100 dark:border-slate-800 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md flex-grow"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-16"></div>
          </div>
        );
      case 'chart':
        return (
          <div className="glass-panel p-6 rounded-3xl animate-pulse flex flex-col gap-4 h-64">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/3"></div>
            <div className="flex gap-4 items-end flex-grow mt-4">
              <div className="h-3/4 bg-slate-200 dark:bg-slate-700 rounded-md flex-grow"></div>
              <div className="h-1/2 bg-slate-200 dark:bg-slate-700 rounded-md flex-grow"></div>
              <div className="h-5/6 bg-slate-200 dark:bg-slate-700 rounded-md flex-grow"></div>
              <div className="h-2/3 bg-slate-200 dark:bg-slate-700 rounded-md flex-grow"></div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {skeletons.map((_, i) => (
        <React.Fragment key={i}>{renderSkeleton()}</React.Fragment>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
