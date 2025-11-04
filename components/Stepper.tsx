import React from 'react';

const CheckIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);


const Stepper: React.FC<{ steps: string[], currentStep: number }> = ({ steps, currentStep }) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center text-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-300
                    ${isActive ? 'bg-brand-secondary border-brand-secondary text-white' : ''}
                    ${isCompleted ? 'bg-green-600 border-green-600 text-white' : ''}
                    ${!isActive && !isCompleted ? 'bg-base-300 border-base-300 text-gray-400' : ''}
                  `}
                >
                  {isCompleted ? <CheckIcon /> : <span className="font-bold text-lg">{stepNumber}</span>}
                </div>
                <p className={`mt-2 text-sm sm:text-base font-medium transition-colors duration-300 ${isActive ? 'text-white' : ''} ${isCompleted ? 'text-content' : 'text-gray-400'}`}>
                  {step}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-auto border-t-2 transition-colors duration-500 mx-4
                  ${isCompleted ? 'border-green-600' : 'border-base-300'}
                `}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
