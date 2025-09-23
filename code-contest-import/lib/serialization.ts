/**
 * Utility functions for handling Next.js serialization issues
 * Converts non-serializable data to plain objects for Client Components
 */

/**
 * Converts MongoDB documents and other non-serializable objects to plain objects
 * @param data - The data to serialize
 * @returns Plain object safe for Client Components
 */
export function serializeForClient<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => serializeForClient(item)) as T;
  }

  // Handle Date objects
  if (data instanceof Date) {
    return data.toISOString() as T;
  }

  // Handle MongoDB ObjectId
  if (data && typeof data === 'object' && 'toString' in data && data.constructor.name === 'ObjectId') {
    return data.toString() as T;
  }

  // Handle Mongoose documents
  if (data && typeof data === 'object' && 'toObject' in data && typeof (data as any).toObject === 'function') {
    return serializeForClient((data as any).toObject()) as T;
  }

  // Handle plain objects
  if (data && typeof data === 'object' && data.constructor === Object) {
    const serialized: any = {};
    for (const [key, value] of Object.entries(data)) {
      serialized[key] = serializeForClient(value);
    }
    return serialized as T;
  }

  // Handle other objects by converting to plain object
  if (data && typeof data === 'object') {
    try {
      return JSON.parse(JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to serialize object:', error);
      return {} as T;
    }
  }

  // Return primitive values as-is
  return data;
}

/**
 * Sanitizes MongoDB query results for Client Components
 * @param mongoResult - MongoDB query result
 * @returns Serialized plain object
 */
export function sanitizeMongoResult<T>(mongoResult: T): T {
  if (!mongoResult) return mongoResult;

  // Convert to plain object first
  const plainObject = JSON.parse(JSON.stringify(mongoResult));
  
  // Then serialize for client
  return serializeForClient(plainObject);
}

/**
 * Converts Mongoose documents to plain objects
 * @param doc - Mongoose document or array of documents
 * @returns Plain object(s) safe for Client Components
 */
export function mongooseToPlain<T>(doc: T): T {
  if (!doc) return doc;

  if (Array.isArray(doc)) {
    return doc.map(item => {
      if (item && typeof item === 'object' && 'toObject' in item) {
        return serializeForClient(item.toObject());
      }
      return serializeForClient(item);
    }) as T;
  }

  if (doc && typeof doc === 'object' && 'toObject' in doc) {
    return serializeForClient((doc as any).toObject());
  }

  return serializeForClient(doc);
}

/**
 * Type-safe serialization for API responses
 * @param response - API response data
 * @returns Serialized response safe for Client Components
 */
export function serializeApiResponse<T>(response: {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  [key: string]: any;
}) {
  return {
    success: response.success,
    data: response.data ? serializeForClient(response.data) : undefined,
    error: response.error,
    message: response.message,
    ...Object.fromEntries(
      Object.entries(response)
        .filter(([key]) => !['success', 'data', 'error', 'message'].includes(key))
        .map(([key, value]) => [key, serializeForClient(value)])
    )
  };
}