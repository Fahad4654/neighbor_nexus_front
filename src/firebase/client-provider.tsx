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
import Loading from '@/app/loading';

// This context is now only used to check if the client provider has initialized.
const FirebaseClientContext = createContext<boolean>(false);

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

  if (!firebase) {
    // You can return a loading spinner or null here
    return <Loading />;
  }

  return (
    <FirebaseClientContext.Provider value={true}>
      <FirebaseProvider {...firebase}>{children}</FirebaseProvider>
    </FirebaseClientContext.Provider>
  );
}

export function useFirebaseClient() {
  return useContext(FirebaseClientContext);
}