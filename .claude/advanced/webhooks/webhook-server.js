/**
 * Webhook Server for Linear Integration
 *
 * Express server to receive and process Linear webhooks
 * for real-time bidirectional integration
 */

const express = require('express');
const crypto = require('crypto');
const { getCurrentEnvironment } = require('../config/environments.js');
const LinearWebhookHandler = require('./linear-webhook-handler.js');

class WebhookServer {
  constructor(options = {}) {
    this.config = getCurrentEnvironment();
    this.port = options.port || process.env.WEBHOOK_PORT || 3000;
    this.app = express();
    this.webhookHandler = new LinearWebhookHandler();

    // Initialize security modules
    this.initializeSecurityModules();

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Initialize security modules for webhook protection
   */
  initializeSecurityModules() {
    // Rate limiter configuration
    this.rateLimiter = {
      windowMs: 60000, // 1 minute
      max: 100, // 100 requests per window
      requestCounts: new Map(),
      windowStart: new Map(),
    };

    // Security headers configuration
    this.securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'none'; object-src 'none';",
    };

    // HTTPS enforcer
    this.httpsEnforcer = {
      enabled: process.env.NODE_ENV === 'production',
    };

    // CORS configuration
    this.corsConfig = {
      origin: ['https://app.linear.app', 'https://linear.app'],
      methods: ['POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Linear-Signature', 'X-Linear-Signature'],
      maxAge: 86400, // 24 hours
    };

    // Security logger
    this.securityLogger = {
      logSecurityEvent: (event, data) => {
        const sanitizedData = { ...data };
        // Redact sensitive information
        if (sanitizedData.signature) {
          sanitizedData.signature = '[REDACTED]';
        }
        console.warn(`SECURITY ALERT: ${event}`, sanitizedData);
      },
    };
  }

  /**
   * Validate webhook signature using HMAC-SHA256
   */
  validateSignature(payload, signature) {
    if (!signature) {
      return { valid: false, error: 'Missing signature' };
    }

    const secret = process.env.LINEAR_WEBHOOK_SECRET;
    if (!secret) {
      return { valid: false, error: 'Webhook secret not configured' };
    }

    // Support both Linear-Signature and X-Linear-Signature formats
    const signatureMatch = signature.match(/^sha256=([a-f0-9]{64})$/);
    if (!signatureMatch) {
      return { valid: false, error: 'Invalid signature format' };
    }

    const providedSignature = signatureMatch[1];
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');

    if (providedSignature !== expectedSignature) {
      return { valid: false, error: 'Signature verification failed' };
    }

    return { valid: true };
  }

  /**
   * Check rate limit for IP address
   */
  checkRateLimit(ip) {
    const now = Date.now();
    const windowStart = this.rateLimiter.windowStart.get(ip) || now;

    // Reset window if expired
    if (now - windowStart >= this.rateLimiter.windowMs) {
      this.rateLimiter.windowStart.set(ip, now);
      this.rateLimiter.requestCounts.set(ip, 0);
    }

    const currentCount = this.rateLimiter.requestCounts.get(ip) || 0;

    if (currentCount >= this.rateLimiter.max) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: windowStart + this.rateLimiter.windowMs,
      };
    }

    // Increment count
    this.rateLimiter.requestCounts.set(ip, currentCount + 1);

    return {
      allowed: true,
      remaining: this.rateLimiter.max - currentCount - 1,
      resetTime: windowStart + this.rateLimiter.windowMs,
    };
  }

  /**
   * Reset rate limit for IP (for testing)
   */
  resetRateLimit(ip) {
    this.rateLimiter.requestCounts.delete(ip);
    this.rateLimiter.windowStart.delete(ip);
  }

  /**
   * Sanitize webhook payload for security threats
   */
  sanitizePayload(payload) {
    try {
      // Check for required fields
      if (!payload.action || !payload.type) {
        return { safe: false, error: 'Invalid payload structure' };
      }

      // Convert to string for pattern checking
      const payloadStr = JSON.stringify(payload);

      // Check for script injection
      const scriptPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /onclick=/gi,
        /onload=/gi,
        /onerror=/gi,
      ];

      for (const pattern of scriptPatterns) {
        if (pattern.test(payloadStr)) {
          return { safe: false, error: 'Malicious script detected' };
        }
      }

      // Check for SQL injection patterns
      const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
        /(--|\/\*|\*\/|;)/g,
        /('|(\\');|(\\");)/g,
      ];

      for (const pattern of sqlPatterns) {
        if (pattern.test(payloadStr)) {
          return { safe: false, error: 'SQL injection attempt detected' };
        }
      }

      // Payload is clean
      return { safe: true, sanitized: payload };
    } catch (error) {
      return { safe: false, error: 'Payload sanitization failed' };
    }
  }

  /**
   * Format error response for production safety
   */
  formatError(error, context = {}) {
    if (process.env.NODE_ENV === 'production') {
      return {
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      };
    }

    return {
      error: error.message,
      timestamp: new Date().toISOString(),
      ...(context.stack && { stack: error.stack }),
    };
  }

  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    // Security middleware - applied first
    this.app.use((req, res, next) => {
      // Apply security headers to all responses
      Object.entries(this.securityHeaders).forEach(([header, value]) => {
        res.setHeader(header, value);
      });

      // HTTPS enforcement for production
      if (this.httpsEnforcer.enabled && req.header('X-Forwarded-Proto') === 'http') {
        return res.redirect(301, `https://${req.header('Host')}${req.url}`);
      }

      next();
    });

    // CORS middleware
    this.app.use((req, res, next) => {
      const origin = req.headers.origin;

      if (this.corsConfig.origin.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }

      res.setHeader('Access-Control-Allow-Methods', this.corsConfig.methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', this.corsConfig.allowedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', this.corsConfig.maxAge);

      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }

      next();
    });

    // Rate limiting middleware for webhooks
    this.app.use('/webhooks', (req, res, next) => {
      const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const rateLimitResult = this.checkRateLimit(clientIp);

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', this.rateLimiter.max);
      res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimitResult.resetTime / 1000));

      if (!rateLimitResult.allowed) {
        this.securityLogger.logSecurityEvent('rate_limit_exceeded', {
          ip: clientIp,
          path: req.path,
        });

        return res.status(429).json({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
          timestamp: new Date().toISOString(),
        });
      }

      next();
    });

    // Payload size limit
    this.app.use(
      '/webhooks',
      express.raw({
        type: 'application/json',
        limit: '1mb', // Prevent DoS attacks with large payloads
      }),
    );

    // JSON parser for other routes
    this.app.use(express.json({ limit: '100kb' }));

    // Security logging middleware
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} ${req.method} ${req.path} - IP: ${req.ip}`);
      next();
    });

    // Health check route
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: this.config.name,
        webhookHandlers: this.webhookHandler.getWebhookStats(),
      });
    });
  }

  /**
   * Setup webhook routes
   */
  setupRoutes() {
    // Linear webhook endpoint with security validations
    this.app.post('/webhooks/linear', async (req, res) => {
      try {
        const signature = req.get('Linear-Signature') || req.get('X-Linear-Signature');
        const payload = req.body.toString('utf8');
        const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';

        console.log('📥 Received Linear webhook from IP:', clientIp);

        // Step 1: Validate signature
        const signatureValidation = this.validateSignature(payload, signature);
        if (!signatureValidation.valid) {
          this.securityLogger.logSecurityEvent('signature_validation_failed', {
            ip: clientIp,
            error: signatureValidation.error,
            hasSignature: !!signature,
          });

          return res.status(401).json({
            error: 'Missing or invalid signature',
            timestamp: new Date().toISOString(),
          });
        }

        // Step 2: Parse and sanitize payload
        let parsedPayload;
        try {
          parsedPayload = JSON.parse(payload);
        } catch (error) {
          this.securityLogger.logSecurityEvent('invalid_json_payload', {
            ip: clientIp,
            payloadLength: payload.length,
          });

          return res.status(400).json({
            error: 'Invalid JSON payload',
            timestamp: new Date().toISOString(),
          });
        }

        // Step 3: Sanitize payload for security threats
        const sanitizationResult = this.sanitizePayload(parsedPayload);
        if (!sanitizationResult.safe) {
          this.securityLogger.logSecurityEvent('malicious_payload_detected', {
            ip: clientIp,
            error: sanitizationResult.error,
            payloadType: parsedPayload.type || 'unknown',
          });

          return res.status(400).json({
            error: 'Invalid or malicious payload',
            timestamp: new Date().toISOString(),
          });
        }

        // Step 4: Process the webhook
        const result = await this.webhookHandler.handleWebhook(payload, signature);

        if (!result.success) {
          return res.status(result.status || 400).json({
            error: result.error,
            timestamp: new Date().toISOString(),
          });
        }

        console.log('✅ Webhook processed successfully');

        res.json({
          success: true,
          eventType: result.eventType,
          processed: true,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('❌ Webhook processing error:', error.message);

        const errorResponse = this.formatError(error, {
          stack: error.stack,
          message: error.message,
        });

        res.status(500).json(errorResponse);
      }
    });

    // Webhook configuration endpoint (security-conscious)
    this.app.get('/webhooks/config', (req, res) => {
      const hasSecret = !!process.env.LINEAR_WEBHOOK_SECRET;

      const response = {
        linearWebhook: {
          url: this.config.linear?.webhookUrl || 'Not configured',
          hasSecret: hasSecret,
          mockMode: this.config.linear?.mockMode || false,
        },
        handlers: this.webhookHandler.getWebhookStats(),
        server: {
          port: this.port,
          environment: this.config.name,
        },
        security: {
          rateLimiting: {
            enabled: true,
            maxRequests: this.rateLimiter.max,
            windowMs: this.rateLimiter.windowMs,
          },
          httpsEnforced: this.httpsEnforcer.enabled,
          corsConfigured: this.corsConfig.origin.length > 0,
        },
      };

      // Add security warning if webhook secret is not configured
      if (!hasSecret) {
        response.securityWarning = 'Webhook secret not configured - signatures cannot be validated';
      }

      res.json(response);
    });

    // Test webhook endpoint for development
    this.app.post('/webhooks/test', async (req, res) => {
      console.log('🧪 Test webhook received');

      const testPayload = JSON.stringify({
        action: 'create',
        type: 'Issue',
        data: {
          id: 'test-issue-id',
          identifier: 'TEST-123',
          title: 'Test webhook issue',
          description: 'This is a test webhook',
          priority: 3,
          state: { name: 'Todo' },
          createdAt: new Date().toISOString(),
        },
      });

      const result = await this.webhookHandler.handleWebhook(testPayload, null);

      res.json({
        testResult: result,
        timestamp: new Date().toISOString(),
      });
    });

    // Webhook statistics endpoint
    this.app.get('/webhooks/stats', (req, res) => {
      res.json({
        handlers: this.webhookHandler.getWebhookStats(),
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          environment: this.config.name,
        },
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Not found',
        path: req.path,
        timestamp: new Date().toISOString(),
      });
    });

    // Global error handler
    this.app.use((error, req, res, next) => {
      console.error('❌ Server error:', error.message);

      res.status(500).json({
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
        ...(this.config.name === 'development' && { stack: error.stack }),
      });
    });
  }

  /**
   * Start the webhook server
   */
  async start() {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, () => {
          console.log(`🚀 Webhook server started on port ${this.port}`);
          console.log(`📡 Linear webhook endpoint: http://localhost:${this.port}/webhooks/linear`);
          console.log(`💚 Health check: http://localhost:${this.port}/health`);
          console.log(`📊 Config: http://localhost:${this.port}/webhooks/config`);

          if (this.config.name === 'development') {
            console.log(`🧪 Test webhook: http://localhost:${this.port}/webhooks/test`);
          }

          resolve();
        });

        this.server.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop the webhook server
   */
  async stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('🛑 Webhook server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Graceful shutdown
   */
  setupGracefulShutdown() {
    const shutdown = (signal) => {
      console.log(`\n📡 Received ${signal}, shutting down webhook server gracefully...`);

      this.stop()
        .then(() => {
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Error during shutdown:', error.message);
          process.exit(1);
        });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error.message);
      this.stop().then(() => process.exit(1));
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      this.stop().then(() => process.exit(1));
    });
  }
}

// CLI interface
if (require.main === module) {
  const server = new WebhookServer();

  // Setup graceful shutdown
  server.setupGracefulShutdown();

  // Start server
  server
    .start()
    .then(() => {
      console.log('✅ Webhook server is ready to receive Linear webhooks');

      // In development, show setup instructions
      if (server.config.name === 'development') {
        console.log('\n📝 Linear Webhook Setup Instructions:');
        console.log('1. Go to Linear Settings → API');
        console.log('2. Create a new webhook');
        console.log(`3. Set URL to: http://localhost:${server.port}/webhooks/linear`);
        console.log('4. Set secret (optional but recommended)');
        console.log('5. Select events: Issues, Comments, Projects');
        console.log('6. Save webhook');
        console.log(
          '\n🧪 Test with: curl -X POST http://localhost:' + server.port + '/webhooks/test',
        );
      }
    })
    .catch((error) => {
      console.error('❌ Failed to start webhook server:', error.message);
      process.exit(1);
    });
}

module.exports = WebhookServer;
