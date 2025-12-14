<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    totalMetrics, 
    agentMetrics, 
    usageMetrics, 
    modelMetrics, 
    systemMetrics,
    storeActions
  } from '$stores';
  import { 
    Bot, 
    Cpu, 
    MessageSquare, 
    Activity,
    TrendingUp,
    Clock,
    Zap,
    Server,
    Users,
    Target,
    DollarSign,
    AlertTriangle
  } from 'lucide-svelte';
  import Chart from '$lib/components/Chart.svelte';
  import MetricCard from '$lib/components/MetricCard.svelte';

  // Sample chart data
  let responseTimeData = $state([
    { time: '09:00', value: 1.2 },
    { time: '10:00', value: 1.5 },
    { time: '11:00', value: 1.1 },
    { time: '12:00', value: 1.8 },
    { time: '13:00', value: 1.4 },
    { time: '14:00', value: 1.6 },
  ]);

  let usageData = $state([
    { time: '09:00', requests: 45, errors: 2 },
    { time: '10:00', requests: 67, errors: 1 },
    { time: '11:00', requests: 89, errors: 3 },
    { time: '12:00', requests: 123, errors: 2 },
    { time: '13:00', requests: 98, errors: 1 },
    { time: '14:00', requests: 134, errors: 4 },
  ]);

  let modelPerformanceData = $state([
    { model: 'MiniMax-M2', requests: 892, latency: 0.89, success: 98.5 },
    { model: 'GPT-4o', requests: 456, latency: 1.23, success: 97.8 },
    { model: 'Claude-3', requests: 234, latency: 1.67, success: 96.9 },
  ]);

  const stats = $derived([
    {
      name: 'Total Requests',
      value: $totalMetrics.totalRequests.toLocaleString(),
      change: '+12.5% from last hour',
      icon: MessageSquare,
      color: 'text-primary-500',
      bgColor: 'bg-primary-500/10'
    },
    {
      name: 'Active Agents',
      value: $totalMetrics.totalAgents.toString(),
      change: 'All systems operational',
      icon: Bot,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      name: 'Success Rate',
      value: `${$totalMetrics.averageSuccessRate}%`,
      change: '+2.1% from last hour',
      icon: Target,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      name: 'Avg Response Time',
      value: `${$totalMetrics.averageResponseTime}s`,
      change: '-0.3s from last hour',
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    }
  ]);

  const recentActivity = [
    {
      id: '1',
      type: 'workflow_created',
      message: 'New workflow "Customer Support Bot" created',
      timestamp: '2 minutes ago',
      icon: Bot
    },
    {
      id: '2',
      type: 'model_tested',
      message: 'MiniMax-M2 model performance test completed',
      timestamp: '5 minutes ago',
      icon: Cpu
    },
    {
      id: '3',
      type: 'agent_deployed',
      message: 'Code Assistant agent deployed to production',
      timestamp: '12 minutes ago',
      icon: Zap
    },
    {
      id: '4',
      type: 'system_alert',
      message: 'High CPU usage detected on model server',
      timestamp: '15 minutes ago',
      icon: AlertTriangle
    }
  ];

  const systemAlerts = [
    {
      level: 'warning',
      message: 'Model latency increased by 15%',
      time: '5 min ago',
      icon: AlertTriangle
    },
    {
      level: 'info',
      message: 'New agent workflow template available',
      time: '1 hour ago',
      icon: Bot
    }
  ];

  onMount(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      // Update response time data
      const newPoint = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: 1 + Math.random() * 2
      };
      responseTimeData = [...responseTimeData.slice(-5), newPoint];
    }, 30000);

    return () => clearInterval(interval);
  });
</script>

<svelte:head>
  <title>Analytics - Google ADK Agent Platform</title>
</svelte:head>

<div class="p-6 space-y-6">
  <!-- Page Header -->
  <div>
    <h1 class="text-display text-text-high mb-2">Analytics Dashboard</h1>
    <p class="text-body text-text-medium">
      Monitor your AI agent development platform performance and insights
    </p>
  </div>
  
  <!-- Stats Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {#each stats as stat}
      <MetricCard {stat} />
    {/each}
  </div>
  
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Response Time Chart -->
    <div class="chart-container">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-heading text-text-high">Response Time Trends</h2>
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-success rounded-full"></div>
          <span class="text-small text-text-medium">Real-time</span>
        </div>
      </div>
      
      <Chart 
        type="line" 
        data={responseTimeData} 
        xKey="time" 
        yKey="value"
        height={200}
        color="#3B82F6"
      />
      
      <div class="mt-4 text-small text-text-medium">
        Average response time: {$totalMetrics.averageResponseTime}s
        <span class="text-success ml-2">↓ 8% improvement</span>
      </div>
    </div>
    
    <!-- Usage Patterns -->
    <div class="chart-container">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-heading text-text-high">Request Volume</h2>
        <select class="form-select text-small">
          <option>Last 6 hours</option>
          <option>Last 24 hours</option>
          <option>Last 7 days</option>
        </select>
      </div>
      
      <Chart 
        type="bar" 
        data={usageData} 
        xKey="time" 
        yKey="requests"
        height={200}
        color="#8B5CF6"
      />
      
      <div class="mt-4 text-small text-text-medium">
        Peak usage: 134 requests at 14:00
        <span class="text-warning ml-2">15% above average</span>
      </div>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Model Performance -->
    <div class="chart-container lg:col-span-2">
      <h2 class="text-heading text-text-high mb-4">Model Performance Comparison</h2>
      
      <div class="space-y-4">
        {#each modelPerformanceData as model, index}
          <div class="flex items-center justify-between p-3 bg-surface-card rounded-sharp border border-border">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-primary-500 rounded-sharp flex items-center justify-center">
                <Cpu class="w-4 h-4 text-white" />
              </div>
              <div>
                <p class="text-body font-medium text-text-high">{model.model}</p>
                <p class="text-small text-text-medium">{model.requests} requests</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-body font-mono text-text-high">{model.latency}s</p>
              <p class="text-small text-success">{model.success}% success</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
    
    <!-- System Status -->
    <div class="chart-container">
      <h2 class="text-heading text-text-high mb-4">System Status</h2>
      
      <div class="space-y-4">
        {#if $systemMetrics}
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-body text-text-medium">Uptime</span>
              <span class="text-body font-mono text-success">{$systemMetrics.uptime}%</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-body text-text-medium">CPU Usage</span>
              <span class="text-body font-mono text-text-high">{$systemMetrics.cpuUsage}%</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-body text-text-medium">Memory</span>
              <span class="text-body font-mono text-text-high">{$systemMetrics.memoryUsage}%</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-body text-text-medium">Network</span>
              <span class="text-body font-mono text-text-high">{$systemMetrics.networkLatency}ms</span>
            </div>
          </div>
        {/if}
      </div>
      
      <!-- System Alerts -->
      <div class="mt-6">
        <h3 class="text-small text-text-medium uppercase tracking-wide mb-3">Recent Alerts</h3>
        <div class="space-y-2">
          {#each systemAlerts as alert}
            <div class="flex items-start space-x-2 p-2 bg-surface-card rounded-sharp">
              <svelte:component this={alert.icon} class="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <div class="flex-1 min-w-0">
                <p class="text-small text-text-high">{alert.message}</p>
                <p class="text-small text-text-medium">{alert.time}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
  
  <!-- Recent Activity -->
  <div class="chart-container">
    <h2 class="text-heading text-text-high mb-4">Recent Activity</h2>
    
    <div class="space-y-4">
      {#each recentActivity as activity}
        <div class="flex items-start space-x-3 p-3 bg-surface-card rounded-sharp border border-border">
          <div class="w-8 h-8 bg-surface-2 rounded-sharp flex items-center justify-center flex-shrink-0">
            <svelte:component this={activity.icon} class="w-4 h-4 text-text-medium" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-body text-text-high">{activity.message}</p>
            <p class="text-small text-text-medium mt-1">{activity.timestamp}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>