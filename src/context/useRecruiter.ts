import { useContext } from 'react';
import { RecruiterContext } from './RecruiterContextInstance';

export const useRecruiter = () => {
  const context = useContext(RecruiterContext);
  if (!context) {
    throw new Error('useRecruiter must be used within a RecruiterProvider');
  }
  return context;
};
