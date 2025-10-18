#!/usr/bin/env node

/**
 * Real-time Analytics Dashboard Server
 * Provides web interface for feature performance and system metrics
 * Generated: 2025-10-18
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');

class DashboardServer {
  constructor(port = 3001) {
    this.port = port;
    this.dataDir = path.join(process.cwd(), '.claude', 'analytics');
    this.dashboardPath = path.join(this.dataDir, 'dashboard.json');

    this.routes = {
      '/': this.serveDashboard.bind(this),
      '/api/dashboard': this.serveDashboardData.bind(this),
      '/api/metrics': this.serveMetrics.bind(this),
      '/api/features': this.serveFeatures.bind(this),
      '/api/trends': this.serveTrends.bind(this)
    };
  }

  /**
   * Start the dashboard server
   */
  start() {
    const server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    server.listen(this.port, () => {
      console.log(`🚀 Analytics Dashboard Server running at http://localhost:${this.port}`);
      console.log('📊 Available endpoints:');
      console.log(`   Main Dashboard: http://localhost:${this.port}/`);
      console.log(`   API Dashboard: http://localhost:${this.port}/api/dashboard`);
      console.log(`   API Metrics:   http://localhost:${this.port}/api/metrics`);
      console.log(`   API Features:   http://localhost:${this.port}/api/features`);
      console.log(`   API Trends:    http://localhost:${this.port}/api/trends`);
    });

    return server;
  }

  /**
   * Handle HTTP requests
   */
  handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'GET' && this.routes[pathname]) {
      this.routes[pathname](req, res);
    } else {
      this.serve404(res);
    }
  }

  /**
   * Serve main dashboard HTML
   */
  serveDashboard(req, res) {
    const html = this.generateDashboardHTML();
    res.setHeader('Content-Type', 'text/html');
    res.end(html);
  }

  /**
   * Serve dashboard data API
   */
  serveDashboardData(req, res) {
    try {
      if (fs.existsSync(this.dashboardPath)) {
        const dashboardData = JSON.parse(fs.readFileSync(this.dashboardPath, 'utf8'));
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(dashboardData, null, 2));
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'No dashboard data available' }));
      }
    } catch (error) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to load dashboard data' }));
    }
  }

  /**
   * Serve metrics API
   */
  serveMetrics(req, res) {
    try {
      const metrics = this.getLatestMetrics();
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(metrics, null, 2));
    } catch (error) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to load metrics' }));
    }
  }

  /**
   * Serve features API
   */
  serveFeatures(req, res) {
    try {
      const features = this.getFeaturesData();
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(features, null, 2));
    } catch (error) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to load features data' }));
    }
  }

  /**
   * Serve trends API
   */
  serveTrends(req, res) {
    try {
      const trends = this.getTrendsData();
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(trends, null, 2));
    } catch (error) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to load trends data' }));
    }
  }

  /**
   * Generate dashboard HTML
   */
  generateDashboardHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Linear TDD Workflow - Analytics Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }

        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 1rem 2rem;
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }

        .header h1 {
            font-size: 1.8rem;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .metric-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .metric-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .metric-value {
            font-size: 2.5rem;
            font-weight: bold;
            margin: 0.5rem 0;
        }

        .metric-label {
            font-size: 0.9rem;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .metric-change {
            font-size: 0.8rem;
            margin-top: 0.5rem;
        }

        .positive { color: #10b981; }
        .negative { color: #ef4444; }
        .neutral { color: #6b7280; }

        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }

        .chart-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .chart-title {
            font-size: 1.2rem;
            margin-bottom: 1rem;
            color: #333;
        }

        .alerts-section {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .alert {
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }

        .alert-high { background: #fef2f2; border-left: 4px solid #ef4444; }
        .alert-medium { background: #fffbeb; border-left: 4px solid #f59e0b; }
        .alert-low { background: #f0f9ff; border-left: 4px solid #3b82f6; }

        .loading {
            text-align: center;
            padding: 2rem;
            color: white;
            font-size: 1.2rem;
        }

        .refresh-btn {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            float: right;
            transition: opacity 0.3s ease;
        }

        .refresh-btn:hover {
            opacity: 0.8;
        }

        @media (max-width: 768px) {
            .charts-grid {
                grid-template-columns: 1fr;
            }
            .container {
                padding: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Linear TDD Workflow Analytics</h1>
        <button class="refresh-btn" onclick="loadDashboard()">🔄 Refresh</button>
    </div>

    <div class="container">
        <div id="loading" class="loading">
            Loading dashboard data...
        </div>

        <div id="dashboard-content" style="display: none;">
            <!-- Metrics Grid -->
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-label">Total Features</div>
                    <div class="metric-value" id="total-features">-</div>
                    <div class="metric-change positive">+12% this month</div>
                </div>

                <div class="metric-card">
                    <div class="metric-label">Features Shipped</div>
                    <div class="metric-value" id="features-shipped">-</div>
                    <div class="metric-change positive">+8% this month</div>
                </div>

                <div class="metric-card">
                    <div class="metric-label">Quality Score</div>
                    <div class="metric-value" id="quality-score">-</div>
                    <div class="metric-change neutral">Target: 80+</div>
                </div>

                <div class="metric-card">
                    <div class="metric-label">User Satisfaction</div>
                    <div class="metric-value" id="user-satisfaction">-</div>
                    <div class="metric-change positive">+0.3 this month</div>
                </div>

                <div class="metric-card">
                    <div class="metric-label">Total ROI</div>
                    <div class="metric-value" id="total-roi">-</div>
                    <div class="metric-change positive">+5% this month</div>
                </div>
            </div>

            <!-- Charts Grid -->
            <div class="charts-grid">
                <div class="chart-card">
                    <h3 class="chart-title">📈 Feature Velocity Trend</h3>
                    <canvas id="velocityChart"></canvas>
                </div>

                <div class="chart-card">
                    <h3 class="chart-title">🎯 Quality Metrics</h3>
                    <canvas id="qualityChart"></canvas>
                </div>

                <div class="chart-card">
                    <h3 class="chart-title">👥 User Adoption</h3>
                    <canvas id="adoptionChart"></canvas>
                </div>

                <div class="chart-card">
                    <h3 class="chart-title">💰 ROI Analysis</h3>
                    <canvas id="roiChart"></canvas>
                </div>
            </div>

            <!-- Alerts Section -->
            <div class="alerts-section">
                <h3 style="margin-bottom: 1rem;">🚨 Alerts & Recommendations</h3>
                <div id="alerts-container">
                    <!-- Alerts will be populated here -->
                </div>
            </div>
        </div>
    </div>

    <script>
        let charts = {};

        async function loadDashboard() {
            try {
                const response = await fetch('/api/dashboard');
                const data = await response.json();

                if (data.error) {
                    document.getElementById('loading').innerHTML = \`<div style="color: #ef4444;">\${data.error}</div>\`;
                    return;
                }

                updateMetrics(data.summary);
                updateAlerts(data.alerts || [], data.recommendations || []);

                // Load additional data for charts
                await loadChartData();

                document.getElementById('loading').style.display = 'none';
                document.getElementById('dashboard-content').style.display = 'block';

            } catch (error) {
                document.getElementById('loading').innerHTML = '<div style="color: #ef4444;">Failed to load dashboard data</div>';
            }
        }

        function updateMetrics(summary) {
            document.getElementById('total-features').textContent = summary.total_features || 0;
            document.getElementById('features-shipped').textContent = summary.features_shipped || 0;
            document.getElementById('quality-score').textContent = (summary.quality_score || 0) + '/100';
            document.getElementById('user-satisfaction').textContent = (summary.user_satisfaction || 0).toFixed(1) + '/5.0';
            document.getElementById('total-roi').textContent = (summary.total_roi || 0) + '%';
        }

        function updateAlerts(alerts, recommendations) {
            const container = document.getElementById('alerts-container');
            container.innerHTML = '';

            [...alerts, ...recommendations].forEach(alert => {
                const alertDiv = document.createElement('div');
                alertDiv.className = \`alert alert-\${alert.severity || 'medium'}\`;
                alertDiv.innerHTML = \`
                    <strong>\${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}:</strong>
                    \${alert.message}
                    \${alert.recommendation ? \`<br><em>Recommendation: \${alert.recommendation}</em>\` : ''}
                \`;
                container.appendChild(alertDiv);
            });

            if (alerts.length === 0 && recommendations.length === 0) {
                container.innerHTML = '<div style="color: #10b981;">✅ No alerts or recommendations at this time</div>';
            }
        }

        async function loadChartData() {
            try {
                const [trendsResponse, featuresResponse] = await Promise.all([
                    fetch('/api/trends'),
                    fetch('/api/features')
                ]);

                const trends = await trendsResponse.json();
                const features = await featuresResponse.json();

                createVelocityChart(trends.velocity_trend || []);
                createQualityChart(trends.quality_trend || []);
                createAdoptionChart(trends.user_adoption_trend || []);
                createROIChart(features.feature_roi || {});

            } catch (error) {
                console.error('Failed to load chart data:', error);
            }
        }

        function createVelocityChart(data) {
            const ctx = document.getElementById('velocityChart').getContext('2d');

            if (charts.velocity) {
                charts.velocity.destroy();
            }

            charts.velocity = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.map(d => d.date || d.week),
                    datasets: [{
                        label: 'Features Shipped',
                        data: data.map(d => d.features_shipped || d.score),
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }

        function createQualityChart(data) {
            const ctx = document.getElementById('qualityChart').getContext('2d');

            if (charts.quality) {
                charts.quality.destroy();
            }

            charts.quality = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.map(d => d.date || d.week),
                    datasets: [{
                        label: 'Quality Score',
                        data: data.map(d => d.score || d.quality_score),
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: false, min: 60, max: 100 }
                    }
                }
            });
        }

        function createAdoptionChart(data) {
            const ctx = document.getElementById('adoptionChart').getContext('2d');

            if (charts.adoption) {
                charts.adoption.destroy();
            }

            charts.adoption = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.map(d => d.date || d.week),
                    datasets: [{
                        label: 'User Adoption Rate (%)',
                        data: data.map(d => d.adoption_rate || d.rate),
                        backgroundColor: '#f59e0b'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true, max: 100 }
                    }
                }
            });
        }

        function createROIChart(data) {
            const ctx = document.getElementById('roiChart').getContext('2d');

            if (charts.roi) {
                charts.roi.destroy();
            }

            const features = Object.keys(data);
            const roiValues = features.map(f => data[f].roi_percentage || 0);

            charts.roi = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: features.map(f => data[f].feature_name || f),
                    datasets: [{
                        data: roiValues,
                        backgroundColor: [
                            '#667eea',
                            '#764ba2',
                            '#10b981',
                            '#f59e0b',
                            '#ef4444'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        }

        // Auto-refresh every 30 seconds
        setInterval(loadDashboard, 30000);

        // Initial load
        loadDashboard();
    </script>
</body>
</html>`;
  }

  /**
   * Get latest metrics
   */
  getLatestMetrics() {
    try {
      // Generate mock metrics for demonstration
      return {
        timestamp: new Date().toISOString(),
        system_health: 95,
        active_features: 12,
        test_coverage: 87,
        deployment_frequency: 3,
        mean_lead_time: 2.5,
        error_rate: 0.3,
        user_satisfaction: 4.6
      };
    } catch (error) {
      return { error: 'Failed to generate metrics' };
    }
  }

  /**
   * Get features data
   */
  getFeaturesData() {
    try {
      const registryPath = path.join(process.cwd(), '.claude', 'user-stories', 'registry.yaml');
      if (fs.existsSync(registryPath)) {
        const yaml = require('js-yaml');
        const registry = yaml.load(fs.readFileSync(registryPath, 'utf8'));

        const featureRoi = {};
        Object.values(registry.features || {}).forEach(feature => {
          if (feature.status === 'implemented') {
            const cost = 2000 * (feature.priority === 'high' ? 1.5 : 1.0);
            const value = 5000 * (feature.user_impact === 'high' ? 2.0 : 1.0);
            const roi = ((value - cost) / cost) * 100;

            featureRoi[feature.slug] = {
              feature_name: feature.name,
              roi_percentage: Math.round(roi)
            };
          }
        });

        return { feature_roi: featureRoi };
      }
    } catch (error) {
      console.log('Failed to load features data:', error.message);
    }

    return { feature_roi: {} };
  }

  /**
   * Get trends data
   */
  getTrendsData() {
    try {
      // Generate mock trend data
      const trends = {
        velocity_trend: [],
        quality_trend: [],
        user_adoption_trend: []
      };

      for (let i = 0; i < 12; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7));
        const dateStr = date.toISOString().split('T')[0];

        trends.velocity_trend.push({
          week: \`\${i + 1}\`,
          date: dateStr,
          features_shipped: Math.max(1, 3 + Math.floor(Math.random() * 3))
        });

        trends.quality_trend.push({
          week: \`\${i + 1}\`,
          date: dateStr,
          score: Math.max(70, 80 + Math.floor(Math.random() * 15))
        });

        trends.user_adoption_trend.push({
          week: \`\${i + 1}\`,
          date: dateStr,
          adoption_rate: Math.max(60, 75 + Math.floor(Math.random() * 20))
        });
      }

      return trends;
    } catch (error) {
      return { error: 'Failed to generate trends data' };
    }
  }

  /**
   * Serve 404 page
   */
  serve404(res) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html');
    res.end('<h1>404 - Not Found</h1><p>The requested endpoint does not exist.</p>');
  }
}

// CLI interface
if (require.main === module) {
  const port = parseInt(process.argv[2]) || 3001;
  const server = new DashboardServer(port);
  server.start();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\\n🛑 Shutting down dashboard server...');
    process.exit(0);
  });
}

module.exports = DashboardServer;