import { createContext } from 'react';
import type { RecruiterContextType } from './types';

export const RecruiterContext = createContext<RecruiterContextType | undefined>(undefined);
