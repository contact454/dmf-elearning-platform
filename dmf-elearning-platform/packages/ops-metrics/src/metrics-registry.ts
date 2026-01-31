/**
 * Metrics Registry (Đăng ký Metrics)
 * 
 * Simple in-memory metrics collector compatible with Prometheus text exposition format.
 * No external dependencies - pure TypeScript implementation.
 */

export interface MetricLabels {
  [key: string]: string;
}

export interface Counter {
  name: string;
  help: string;
  labels: MetricLabels;
  value: number;
}

export interface Histogram {
  name: string;
  help: string;
  labels: MetricLabels;
  buckets: number[]; // Bucket boundaries (le values)
  counts: number[]; // Count per bucket
  sum: number;
  count: number;
}

class MetricsRegistry {
  private counters = new Map<string, Counter>();
  private histograms = new Map<string, Histogram>();

  /**
   * Increment a counter
   */
  incrementCounter(name: string, labels: MetricLabels = {}, value: number = 1): void {
    const key = this.getKey(name, labels);
    const existing = this.counters.get(key);
    
    if (existing) {
      existing.value += value;
    } else {
      this.counters.set(key, {
        name,
        help: this.getHelp(name),
        labels,
        value,
      });
    }
  }

  /**
   * Record a histogram observation
   */
  observeHistogram(name: string, labels: MetricLabels, value: number): void {
    const key = this.getKey(name, labels);
    const existing = this.histograms.get(key);
    
    if (!existing) {
      // Default buckets: 10ms, 50ms, 100ms, 250ms, 500ms, 1s, 2.5s, 5s, 10s, +Inf
      const buckets = [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000, Number.POSITIVE_INFINITY];
      this.histograms.set(key, {
        name,
        help: this.getHelp(name),
        labels,
        buckets,
        counts: new Array(buckets.length).fill(0),
        sum: 0,
        count: 0,
      });
    }
    
    const histogram = this.histograms.get(key)!;
    histogram.sum += value;
    histogram.count += 1;
    
    // Update bucket counts
    for (let i = 0; i < histogram.buckets.length; i++) {
      if (value <= histogram.buckets[i]) {
        histogram.counts[i] += 1;
      }
    }
  }

  /**
   * Get all counters
   */
  getCounters(): Counter[] {
    return Array.from(this.counters.values());
  }

  /**
   * Get all histograms
   */
  getHistograms(): Histogram[] {
    return Array.from(this.histograms.values());
  }

  /**
   * Export metrics in Prometheus text exposition format
   */
  exportTextFormat(): string {
    const lines: string[] = [];
    
    // Export counters
    for (const counter of this.counters.values()) {
      lines.push(`# HELP ${counter.name} ${counter.help}`);
      lines.push(`# TYPE ${counter.name} counter`);
      const labelStr = this.formatLabels(counter.labels);
      lines.push(`${counter.name}${labelStr} ${counter.value}`);
    }
    
    // Export histograms
    for (const histogram of this.histograms.values()) {
      lines.push(`# HELP ${histogram.name} ${histogram.help}`);
      lines.push(`# TYPE ${histogram.name} histogram`);
      
      const labelStr = this.formatLabels(histogram.labels);
      
      // Export buckets
      for (let i = 0; i < histogram.buckets.length; i++) {
        const le = histogram.buckets[i] === Number.POSITIVE_INFINITY ? '+Inf' : histogram.buckets[i].toString();
        const bucketLabels = { ...histogram.labels, le };
        const bucketLabelStr = this.formatLabels(bucketLabels);
        lines.push(`${histogram.name}_bucket${bucketLabelStr} ${histogram.counts[i]}`);
      }
      
      // Export sum and count
      lines.push(`${histogram.name}_sum${labelStr} ${histogram.sum}`);
      lines.push(`${histogram.name}_count${labelStr} ${histogram.count}`);
    }
    
    return lines.join('\n') + '\n';
  }

  /**
   * Reset all metrics (useful for testing)
   */
  reset(): void {
    this.counters.clear();
    this.histograms.clear();
  }

  private getKey(name: string, labels: MetricLabels): string {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    return labelStr ? `${name}{${labelStr}}` : name;
  }

  private formatLabels(labels: MetricLabels): string {
    const entries = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`);
    
    return entries.length > 0 ? `{${entries.join(',')}}` : '';
  }

  private getHelp(name: string): string {
    const helpMap: Record<string, string> = {
      'http_requests_total': 'Total number of HTTP requests',
      'http_request_duration_ms': 'HTTP request duration in milliseconds',
      'events_published_total': 'Total number of events published',
      'events_consumed_total': 'Total number of events consumed',
      'commands_processed_total': 'Total number of commands processed',
      'lessons_started_total': 'Total number of lessons started',
      'lessons_completed_total': 'Total number of lessons completed',
      'quizzes_submitted_total': 'Total number of quizzes submitted',
      'users_registered_total': 'Total number of users registered',
      'course_enrollments_total': 'Total number of course enrollments',
    };
    
    return helpMap[name] || `Metric: ${name}`;
  }
}

// Singleton instance
let registryInstance: MetricsRegistry | null = null;

export function getMetricsRegistry(): MetricsRegistry {
  if (!registryInstance) {
    registryInstance = new MetricsRegistry();
  }
  return registryInstance;
}
