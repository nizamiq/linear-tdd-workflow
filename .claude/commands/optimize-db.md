---
name: optimize-db
description: Analyze and optimize PostgreSQL database performance, resolve slow queries, and implement caching strategies. Use PROACTIVELY when experiencing database performance issues, high query times, or scaling challenges.
agent: DATABASE-OPTIMIZER
usage: "/optimize-db [--scope=<queries|indexes|cache|all>] [--target=<local|supabase|neon>] [--profile=<duration>]"
allowed-tools: [Read, Grep, Glob, Bash]
argument-hint: "[--scope=queries|indexes|cache|connections|all] [--target=local|supabase|neon|cloud-sql] [--profile=<minutes>]"
parameters:
  - name: scope
    description: Optimization scope
    type: string
    options: [queries, indexes, cache, connections, all]
    default: all
  - name: target
    description: Target database platform
    type: string
    options: [local, supabase, neon, cloud-sql]
    default: local
  - name: profile
    description: Profile duration in minutes for analysis
    type: number
    default: 5
---

# /optimize-db - Database Performance Optimization

Analyze and optimize PostgreSQL database performance with the DATABASE-OPTIMIZER agent, specializing in Django ORM optimization and cloud database tuning.

## Usage
```
/optimize-db [--scope=<queries|indexes|cache|all>] [--target=<local|supabase|neon>] [--profile=<duration>]
```

## Parameters
- `--scope`: Focus area - queries, indexes, cache, connections, or all (default: all)
- `--target`: Database platform - local, supabase, neon, cloud-sql (default: local)
- `--profile`: Duration in minutes to profile database activity (default: 5)

## What This Command Does
The DATABASE-OPTIMIZER agent will:
1. Profile database performance and collect metrics
2. Analyze slow queries with EXPLAIN ANALYZE
3. Identify N+1 queries in Django ORM
4. Recommend optimal indexing strategies
5. Configure connection pooling
6. Implement multi-tier caching
7. Generate optimization scripts

## Expected Output
- **Performance Report**: Current bottlenecks and metrics
- **Query Analysis**: Slow queries with execution plans
- **Index Recommendations**: CREATE INDEX statements with impact estimates
- **Django Optimizations**: ORM query improvements with code examples
- **Caching Strategy**: Redis configuration and cache implementation
- **Configuration Files**: Optimized PostgreSQL and connection pool settings
- **Benchmark Results**: Before/after performance comparisons

## Examples
```bash
# Full database optimization analysis
/optimize-db

# Focus on query optimization for Supabase
/optimize-db --scope=queries --target=supabase

# Analyze indexes with extended profiling
/optimize-db --scope=indexes --profile=15

# Optimize Neon serverless connections
/optimize-db --scope=connections --target=neon
```

## Optimization Areas

### Query Optimization
- N+1 query detection and resolution
- Query plan analysis
- Django ORM optimization
- Batch operation improvements

### Index Strategy
- Missing index identification
- Redundant index removal
- Partial and conditional indexes
- Index maintenance recommendations

### Caching Architecture
- Redis integration setup
- Query result caching
- Django cache framework
- Cache invalidation strategies

### Connection Management
- PgBouncer configuration
- Connection pool sizing
- Timeout optimization
- Health check setup

## Performance Targets
- Query response time: <100ms (p95)
- Index usage: >90% for frequent queries
- Cache hit ratio: >80%
- Connection pool efficiency: >95%

## SLAs
- Initial analysis: ≤10 minutes
- Optimization plan: ≤5 minutes
- Implementation scripts: ≤2 minutes