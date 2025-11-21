'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  Query,
  DocumentData,
  query,
  where,
  collectionGroup,
  CollectionReference,
} from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

type CollectionOptions = {
  isCollectionGroup?: boolean;
  queries?: {
    attribute: string;
    operator:
      | '<'
      | '<='
      | '=='
      | '!='
      | '>='
      | '>'
      | 'array-contains'
      | 'in'
      | 'array-contains-any'
      | 'not-in';
    value: string | boolean | number;
  }[];
};

export function useCollection<T>(
  collectionName: string,
  options?: CollectionOptions
): { data: T[] | null; loading: boolean } {
  const firestore = useFirestore();
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;

    let collectionRef: Query | CollectionReference = options?.isCollectionGroup
      ? collectionGroup(firestore, collectionName)
      : collection(firestore, collectionName);

    if (options?.queries) {
      const queryConstraints = options.queries.map(({ attribute, operator, value }) =>
        where(attribute, operator, value)
      );
      collectionRef = query(collectionRef, ...queryConstraints);
    }

    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        const result: T[] = [];
        snapshot.forEach((doc) => {
          result.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(result);
        setLoading(false);
      },
      (error) => {
        const permissionError = new FirestorePermissionError({
          path: (collectionRef as CollectionReference).path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error('Error fetching collection:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, collectionName, options]);

  return { data, loading };
}
