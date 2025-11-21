export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const message = `Firestore Permission Denied: Cannot ${context.operation} at ${context.path}`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
  }

  toString() {
    return `${this.message}. Request data: ${JSON.stringify(this.context.requestResourceData, null, 2)}`;
  }
}
