/**
 * Backend serialization utilities for MongoDB/Mongoose data
 * Ensures all data sent to frontend is properly serialized
 */

/**
 * Converts Mongoose documents to plain objects safe for JSON serialization
 * @param {*} data - Mongoose document, array, or any data
 * @returns {*} Plain object safe for JSON.stringify
 */
function serializeMongooseData(data) {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => serializeMongooseData(item));
  }

  // Handle Mongoose documents
  if (data && typeof data === 'object' && data.toObject && typeof data.toObject === 'function') {
    return serializeMongooseData(data.toObject());
  }

  // Handle Date objects
  if (data instanceof Date) {
    return data.toISOString();
  }

  // Handle MongoDB ObjectId
  if (data && typeof data === 'object' && data.constructor && data.constructor.name === 'ObjectId') {
    return data.toString();
  }

  // Handle plain objects
  if (data && typeof data === 'object' && data.constructor === Object) {
    const serialized = {};
    for (const [key, value] of Object.entries(data)) {
      serialized[key] = serializeMongooseData(value);
    }
    return serialized;
  }

  // Handle other objects
  if (data && typeof data === 'object') {
    try {
      // Try to convert to plain object
      const plainObject = JSON.parse(JSON.stringify(data));
      return serializeMongooseData(plainObject);
    } catch (error) {
      console.warn('Failed to serialize object:', error);
      return {};
    }
  }

  // Return primitive values as-is
  return data;
}

/**
 * Serializes API response data for safe transmission to frontend
 * @param {Object} response - Response object with success, data, error, message
 * @returns {Object} Serialized response
 */
function serializeApiResponse(response) {
  return {
    success: response.success,
    data: response.data ? serializeMongooseData(response.data) : undefined,
    error: response.error,
    message: response.message,
    pagination: response.pagination ? serializeMongooseData(response.pagination) : undefined,
    ...Object.fromEntries(
      Object.entries(response)
        .filter(([key]) => !['success', 'data', 'error', 'message', 'pagination'].includes(key))
        .map(([key, value]) => [key, serializeMongooseData(value)])
    )
  };
}

/**
 * Middleware to automatically serialize response data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function serializationMiddleware(req, res, next) {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Serialize the data before sending
    const serializedData = serializeApiResponse(data);
    return originalJson.call(this, serializedData);
  };
  
  next();
}

/**
 * Ensures Mongoose queries use .lean() for better performance and serialization
 * @param {Object} query - Mongoose query object
 * @returns {Object} Query with .lean() applied
 */
function ensureLeanQuery(query) {
  if (query && typeof query.lean === 'function') {
    return query.lean();
  }
  return query;
}

/**
 * Safe JSON stringify that handles circular references
 * @param {*} obj - Object to stringify
 * @returns {string|null} JSON string or null if failed
 */
function safeStringify(obj) {
  try {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      
      // Handle special objects
      if (value instanceof Date) {
        return value.toISOString();
      }
      
      if (value && typeof value === 'object' && value.constructor && value.constructor.name === 'ObjectId') {
        return value.toString();
      }
      
      return value;
    });
  } catch (error) {
    console.error('Failed to stringify object:', error);
    return null;
  }
}

module.exports = {
  serializeMongooseData,
  serializeApiResponse,
  serializationMiddleware,
  ensureLeanQuery,
  safeStringify
};