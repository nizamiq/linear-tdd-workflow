---
name: django
description: Django development assistance including async views, DRF APIs, ORM optimization, and architectural patterns. Use PROACTIVELY for Django feature development, API design, or performance issues.
agent: DJANGO-PRO
usage: '/django [--task=<api|model|view|optimization|security>] [--async] [--drf]'
parameters:
  - name: task
    description: Django task type
    type: string
    options: [api, model, view, migration, admin, optimization, security, channels, all]
    default: all
  - name: async
    description: Use async patterns
    type: boolean
    default: false
  - name: drf
    description: Include Django REST Framework
    type: boolean
    default: true
---

# /django - Django Development Excellence

Expert Django 5.x development with the DJANGO-PRO agent, specializing in async views, DRF APIs, and production-ready architectures.

## Usage

```
/django [--task=<api|model|view|optimization|security>] [--async] [--drf]
```

## Parameters

- `--task`: Development focus - api, model, view, migration, admin, optimization, security, channels, or all (default: all)
- `--async`: Implement async views and middleware (default: false)
- `--drf`: Include Django REST Framework patterns (default: true)

## What This Command Does

The DJANGO-PRO agent will:

1. Design Django models with optimal relationships
2. Create RESTful APIs with DRF
3. Implement async views for high concurrency
4. Optimize ORM queries (N+1 resolution)
5. Set up Celery for background tasks
6. Configure Django Channels for WebSockets
7. Implement security best practices
8. Create comprehensive test suites

## Expected Output

- **Model Definitions**: Optimized database schema with indexes
- **API Implementation**: DRF viewsets, serializers, permissions
- **View Code**: Class-based or function views with proper patterns
- **Migration Files**: Database schema changes
- **Admin Configuration**: Customized Django admin
- **Test Suite**: pytest-django tests with fixtures
- **Settings**: Environment-specific configurations
- **Documentation**: API docs and deployment guide

## Examples

```bash
# Full Django application setup
/django

# Create REST API with DRF
/django --task=api --drf

# Implement async views
/django --task=view --async

# Optimize database queries
/django --task=optimization

# Set up Django Channels
/django --task=channels --async

# Security hardening
/django --task=security
```

## Django Patterns

### Model Architecture

- Abstract base classes
- Model mixins
- Custom managers
- Signal handlers

### API Design

- ViewSets and routers
- Custom permissions
- API versioning
- Throttling and caching

### Async Support

- ASGI deployment
- Async views
- Database async queries
- Async middleware

### Performance

- select_related/prefetch_related
- Query optimization
- Database indexing
- Redis caching

## Best Practices

- Fat models, thin views
- Explicit is better than implicit
- DRY principle
- Security by default
- Test everything

## Integration

- **PostgreSQL**: Optimal database backend
- **Redis**: Caching and Celery broker
- **Celery**: Async task processing
- **Channels**: WebSocket support
- **HTMX**: Modern UI without heavy JS

## Performance Targets

- API response time: <200ms (p95)
- ORM query efficiency: <5 queries per request
- Test coverage: >90%
- Security score: A+ rating

## SLAs

- Model design: ≤10 minutes
- API implementation: ≤20 minutes
- Full feature: ≤45 minutes
