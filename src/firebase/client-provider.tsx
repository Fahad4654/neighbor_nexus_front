'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { initializeFirebase } from '.';
import { FirebaseProvider, type FirebaseContextType } from './provider';

const FirebaseClientContext = createContext<FirebaseContextType | null>(null);

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [firebase, setFirebase] = useState<FirebaseContextType | null>(null);

  useEffect(() => {
    const firebaseInstances = initializeFirebase();
    setFirebase(firebaseInstances);
  }, []);

  return (
    <FirebaseClientContext.Provider value={firebase}>
      {firebase ? (
        <FirebaseProvider {...firebase}>{children}</FirebaseProvider>
      ) : (
        <>{children}</>
      )}
    </FirebaseClientContext.Provider>
  );
}

export function useFirebaseClient() {
  return useContext(FirebaseClientContext);
}
