import React from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from '../../assets/animations/loading-spinner.json';

const LoadingSpinner = () => {
  return (
    <div className="transition-all duration-500 ease-in-out h-40">
        <div className="flex justify-center items-center w-40 h-40 mx-auto">
            <Lottie 
            animationData={loadingAnimation}
            loop={true}
            />
        </div>
    </div>
  );
};

export default LoadingSpinner;