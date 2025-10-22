# Superadmin Module - Multi-tenant Management

This module provides comprehensive administration tools for managing all tenants (companies) using the ERP system.

## Features

### 1. Subscription Management
- Multiple plan tiers (Free, Basic, Professional, Enterprise)
- Trial periods
- Payment tracking
- Feature flags per tenant
- Usage limits (users, appointments)

### 2. Payment History
- Complete payment logs
- Multiple payment methods
- Transaction tracking
- Revenue analytics

### 3. Error Monitoring
- System-wide error tracking
- Per-tenant error logs
- Severity levels
- Error resolution tracking

### 4. Usage Statistics
- Monthly usage metrics per tenant
- Active users tracking
- Revenue monitoring
- API usage statistics
- Storage tracking

## Models

### Subscription
Manages tenant subscriptions and billing.

**Fields:**
- `plan`: Plan tier (free, basic, professional, enterprise)
- `status`: Subscription status (trial, active, suspended, cancelled, expired)
- `payment_status`: Payment status (pending, paid, overdue, failed)
- `monthly_price`: Subscription cost
- `max_users`: User limit
- `max_appointments_per_month`: Appointment limit
- `features`: JSON with enabled features

### PaymentHistory
Tracks all payments from tenants.

**Fields:**
- `amount`: Payment amount
- `payment_method`: Credit card, PIX, bank slip, etc.
- `status`: Payment status
- `reference_month`: Month being paid for
- `transaction_id`: Gateway transaction ID

### SystemError
Logs system errors by tenant.

**Fields:**
- `error_type`: Type of error (DatabaseError, ValidationError, etc.)
- `severity`: Low, Medium, High, Critical
- `status`: New, Investigating, Resolved, Ignored
- `stack_trace`: Full error trace
- `occurrences`: Number of times error occurred

### TenantUsageStats
Monthly usage statistics per tenant.

**Fields:**
- `total_users`: Total users
- `active_users`: Users who logged in
- `total_appointments`: All appointments
- `completed_appointments`: Completed appointments
- `total_revenue`: Monthly revenue
- `api_calls`: API usage
- `storage_used_mb`: Disk space used

## API Endpoints

All endpoints require super admin authentication.

### Subscriptions
- `GET /api/superadmin/subscriptions/` - List all subscriptions
- `GET /api/superadmin/subscriptions/{id}/` - Get subscription details
- `POST /api/superadmin/subscriptions/` - Create subscription
- `PUT /api/superadmin/subscriptions/{id}/` - Update subscription
- `PATCH /api/superadmin/subscriptions/{id}/suspend/` - Suspend subscription
- `PATCH /api/superadmin/subscriptions/{id}/activate/` - Activate subscription

### Payments
- `GET /api/superadmin/payments/` - List all payments
- `GET /api/superadmin/payments/{id}/` - Get payment details
- `GET /api/superadmin/payments/overdue/` - Get overdue payments
- `POST /api/superadmin/payments/{id}/mark_paid/` - Mark as paid

### Errors
- `GET /api/superadmin/errors/` - List all errors
- `GET /api/superadmin/errors/critical/` - Get critical errors
- `PATCH /api/superadmin/errors/{id}/resolve/` - Mark as resolved

### Usage Stats
- `GET /api/superadmin/usage/` - Get usage statistics
- `GET /api/superadmin/usage/summary/` - Get summary across all tenants

## Usage

### Creating a Subscription

```python
from superadmin.models import Subscription
from core.models import Tenant

tenant = Tenant.objects.get(id=1)
subscription = Subscription.objects.create(
    tenant=tenant,
    plan='professional',
    status='active',
    monthly_price=99.90,
    max_users=10,
    max_appointments_per_month=500,
    features={
        'sms_notifications': True,
        'whatsapp_integration': True,
        'advanced_reports': True,
    }
)
```

### Logging an Error

```python
from superadmin.models import SystemError

SystemError.objects.create(
    tenant=tenant,
    error_type='DatabaseError',
    severity='high',
    message='Connection timeout',
    stack_trace='...',
    endpoint='/api/appointments/',
)
```

### Recording Usage Stats

```python
from superadmin.models import TenantUsageStats
from datetime import date

stats = TenantUsageStats.objects.create(
    tenant=tenant,
    month=date(2025, 10, 1),
    total_users=8,
    active_users=6,
    total_appointments=150,
    completed_appointments=140,
    total_revenue=4500.00,
)
```
