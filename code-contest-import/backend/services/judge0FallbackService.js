/**
 * Smart Judge0 Fallback Service
 * Automatically switches between local and remote Judge0 instances
 * with health checking and seamless failover
 */

const axios = require('axios');

class Judge0FallbackService {
  constructor() {
    // Configuration
    this.localUrl = process.env.JUDGE0_LOCAL_URL || 'http://localhost:2358';
    this.remoteUrl = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
    this.remoteHost = process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com';
    this.remoteApiKey = process.env.JUDGE0_API_KEY;
    
    // State management
    this.currentEndpoint = 'local'; // 'local' or 'remote'
    this.localHealthy = false;
    this.remoteHealthy = false;
    this.lastHealthCheck = null;
    this.healthCheckInterval = 30000; // 30 seconds
    this.healthCheckTimeout = 5000; // 5 seconds
    
    // Statistics
    this.stats = {
      localRequests: 0,
      remoteRequests: 0,
      localFailures: 0,
      remoteFailures: 0,
      fallbackCount: 0
    };

    // Language mapping
    this.languageMap = {
      javascript: 63,  // Node.js
      python: 71,      // Python 3
      java: 62,        // Java
      cpp: 54,         // C++ (GCC 9.2.0)
      c: 50            // C (GCC 9.2.0)
    };

    // Start health checking
    this.initializeHealthCheck();
  }

  /**
   * Initialize health checking system
   */
  async initializeHealthCheck() {
    console.log('🏥 Initializing Judge0 health check system...');
    
    // Initial health check
    await this.performHealthCheck();
    
    // Periodic health checks
    setInterval(() => {
      this.performHealthCheck();
    }, this.healthCheckInterval);
  }

  /**
   * Perform health check on both endpoints
   */
  async performHealthCheck() {
    const now = Date.now();
    this.lastHealthCheck = now;

    // Check local Judge0
    try {
      const localResponse = await axios.get(`${this.localUrl}/about`, {
        timeout: this.healthCheckTimeout
      });
      
      if (localResponse.status === 200) {
        if (!this.localHealthy) {
          console.log('✅ Local Judge0 is now available at', this.localUrl);
        }
        this.localHealthy = true;
      }
    } catch (error) {
      if (this.localHealthy) {
        console.log('⚠️  Local Judge0 became unavailable:', error.message);
      }
      this.localHealthy = false;
    }

    // Check remote Judge0
    try {
      const headers = this.remoteApiKey ? {
        'X-RapidAPI-Key': this.remoteApiKey,
        'X-RapidAPI-Host': this.remoteHost
      } : {};

      const remoteResponse = await axios.get(`${this.remoteUrl}/about`, {
        headers,
        timeout: this.healthCheckTimeout
      });
      
      if (remoteResponse.status === 200) {
        if (!this.remoteHealthy) {
          console.log('✅ Remote Judge0 is available');
        }
        this.remoteHealthy = true;
      }
    } catch (error) {
      if (this.remoteHealthy) {
        console.log('⚠️  Remote Judge0 became unavailable:', error.message);
      }
      this.remoteHealthy = false;
    }

    // Determine current endpoint
    this.updateCurrentEndpoint();
    
    // Log status
    this.logStatus();
  }

  /**
   * Update current endpoint based on health status
   */
  updateCurrentEndpoint() {
    const previousEndpoint = this.currentEndpoint;

    if (this.localHealthy) {
      this.currentEndpoint = 'local';
    } else if (this.remoteHealthy) {
      this.currentEndpoint = 'remote';
    } else {
      // Both down - keep trying local
      this.currentEndpoint = 'local';
    }

    if (previousEndpoint !== this.currentEndpoint) {
      console.log(`🔄 Switched from ${previousEndpoint} to ${this.currentEndpoint} Judge0`);
      this.stats.fallbackCount++;
    }
  }

  /**
   * Log current status
   */
  logStatus() {
    const status = {
      current: this.currentEndpoint,
      local: this.localHealthy ? '✅' : '❌',
      remote: this.remoteHealthy ? '✅' : '❌',
      stats: this.stats
    };
    
    console.log('📊 Judge0 Status:', JSON.stringify(status, null, 2));
  }

  /**
   * Get current endpoint configuration
   */
  getCurrentEndpoint() {
    if (this.currentEndpoint === 'local') {
      return {
        url: this.localUrl,
        headers: {},
        type: 'local'
      };
    } else {
      return {
        url: this.remoteUrl,
        headers: this.remoteApiKey ? {
          'X-RapidAPI-Key': this.remoteApiKey,
          'X-RapidAPI-Host': this.remoteHost
        } : {},
        type: 'remote'
      };
    }
  }

  /**
   * Submit code for execution with automatic fallback
   */
  async submitCode(code, languageId, stdin = '', expectedOutput = null) {
    const endpoint = this.getCurrentEndpoint();
    
    console.log(`📤 Submitting to ${endpoint.type} Judge0...`);

    try {
      const response = await this.makeRequest(endpoint, {
        method: 'POST',
        url: `${endpoint.url}/submissions?base64_encoded=false&wait=true`,
        data: {
          source_code: code,
          language_id: languageId,
          stdin: stdin,
          expected_output: expectedOutput
        }
      });

      // Update stats
      if (endpoint.type === 'local') {
        this.stats.localRequests++;
      } else {
        this.stats.remoteRequests++;
      }

      return {
        ...response.data,
        executedOn: endpoint.type
      };

    } catch (error) {
      console.error(`❌ ${endpoint.type} Judge0 failed:`, error.message);
      
      // Update failure stats
      if (endpoint.type === 'local') {
        this.stats.localFailures++;
        this.localHealthy = false;
      } else {
        this.stats.remoteFailures++;
        this.remoteHealthy = false;
      }

      // Try fallback
      return await this.fallbackSubmit(code, languageId, stdin, expectedOutput, endpoint.type);
    }
  }

  /**
   * Fallback to alternative endpoint
   */
  async fallbackSubmit(code, languageId, stdin, expectedOutput, failedEndpoint) {
    console.log(`🔄 Attempting fallback from ${failedEndpoint}...`);
    
    // Switch endpoint
    this.currentEndpoint = failedEndpoint === 'local' ? 'remote' : 'local';
    const fallbackEndpoint = this.getCurrentEndpoint();
    
    console.log(`📤 Retrying with ${fallbackEndpoint.type} Judge0...`);

    try {
      const response = await this.makeRequest(fallbackEndpoint, {
        method: 'POST',
        url: `${fallbackEndpoint.url}/submissions?base64_encoded=false&wait=true`,
        data: {
          source_code: code,
          language_id: languageId,
          stdin: stdin,
          expected_output: expectedOutput
        }
      });

      console.log(`✅ Fallback to ${fallbackEndpoint.type} successful!`);
      this.stats.fallbackCount++;

      // Update stats
      if (fallbackEndpoint.type === 'local') {
        this.stats.localRequests++;
      } else {
        this.stats.remoteRequests++;
      }

      return {
        ...response.data,
        executedOn: fallbackEndpoint.type,
        wasFallback: true
      };

    } catch (fallbackError) {
      console.error(`❌ Fallback to ${fallbackEndpoint.type} also failed:`, fallbackError.message);
      
      // Both endpoints failed
      throw new Error(`Both Judge0 endpoints failed. Local: ${failedEndpoint === 'local' ? 'failed' : 'not tried'}. Remote: ${failedEndpoint === 'remote' ? 'failed' : 'not tried'}.`);
    }
  }

  /**
   * Make HTTP request with proper headers
   */
  async makeRequest(endpoint, config) {
    return await axios({
      ...config,
      headers: {
        'Content-Type': 'application/json',
        ...endpoint.headers,
        ...config.headers
      },
      timeout: 30000 // 30 second timeout
    });
  }

  /**
   * Execute code (high-level wrapper)
   */
  async executeCode(code, language, input = '') {
    const languageId = this.languageMap[language.toLowerCase()];
    
    if (!languageId) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const result = await this.submitCode(code, languageId, input);
    
    return {
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      status: this.getStatusDescription(result.status?.id),
      time: result.time,
      memory: result.memory,
      executedOn: result.executedOn,
      wasFallback: result.wasFallback || false
    };
  }

  /**
   * Get human-readable status description
   */
  getStatusDescription(statusId) {
    const statusMap = {
      1: 'In Queue',
      2: 'Processing',
      3: 'Accepted',
      4: 'Wrong Answer',
      5: 'Time Limit Exceeded',
      6: 'Compilation Error',
      7: 'Runtime Error (SIGSEGV)',
      8: 'Runtime Error (SIGXFSZ)',
      9: 'Runtime Error (SIGFPE)',
      10: 'Runtime Error (SIGABRT)',
      11: 'Runtime Error (NZEC)',
      12: 'Runtime Error (Other)',
      13: 'Internal Error',
      14: 'Exec Format Error'
    };

    return statusMap[statusId] || 'Unknown';
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      ...this.stats,
      currentEndpoint: this.currentEndpoint,
      localHealthy: this.localHealthy,
      remoteHealthy: this.remoteHealthy,
      lastHealthCheck: this.lastHealthCheck ? new Date(this.lastHealthCheck).toISOString() : null
    };
  }

  /**
   * Force health check
   */
  async forceHealthCheck() {
    console.log('🔄 Forcing health check...');
    await this.performHealthCheck();
    return this.getStats();
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      localRequests: 0,
      remoteRequests: 0,
      localFailures: 0,
      remoteFailures: 0,
      fallbackCount: 0
    };
    console.log('📊 Statistics reset');
  }
}

// Export singleton instance
module.exports = new Judge0FallbackService();
