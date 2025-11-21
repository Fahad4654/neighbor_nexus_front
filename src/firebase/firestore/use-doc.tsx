'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, DocumentReference } from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useDoc<T>(
  path: string
): { data: T | null; loading: boolean } {
  const firestore = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;

    const docRef = doc(firestore, path);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (error) => {
        const permissionError = new FirestorePermissionError({
          path: (docRef as DocumentReference).path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error(`Error fetching document at ${path}:`, error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, path]);

  return { data, loading };
}
