"""
Signal handlers for the commissions app.
"""

from decimal import Decimal

from django.db.models.signals import post_save
from django.dispatch import receiver

from scheduling.models import Appointment

from .models import Commission, CommissionRule


@receiver(post_save, sender=Appointment)
def create_commission_on_appointment_completion(sender, instance, created, **kwargs):
    """
    Create commission record when an appointment is marked as completed.
    """
    # Only process completed appointments
    if instance.status != "concluido":
        return

    # Check if commission already exists for this appointment
    if Commission.objects.filter(
        tenant=instance.tenant,
        appointment=instance,
        service=instance.service,
    ).exists():
        return

    # Find applicable commission rule
    # Priority order:
    # 1. Rule for specific professional AND service
    # 2. Rule for specific professional (any service)
    # 3. Rule for specific service (any professional)
    # 4. Global rule (any professional, any service)
    
    rules = CommissionRule.objects.filter(
        tenant=instance.tenant,
        is_active=True,
    ).order_by("-priority")

    # Try to find the most specific rule
    applicable_rule = None
    
    # 1. Professional + Service
    for rule in rules:
        if rule.professional_id == instance.professional_id and rule.service_id == instance.service_id:
            applicable_rule = rule
            break
    
    # 2. Professional only
    if not applicable_rule:
        for rule in rules:
            if rule.professional_id == instance.professional_id and rule.service is None:
                applicable_rule = rule
                break
    
    # 3. Service only
    if not applicable_rule:
        for rule in rules:
            if rule.service_id == instance.service_id and rule.professional is None:
                applicable_rule = rule
                break
    
    # 4. Global rule
    if not applicable_rule:
        for rule in rules:
            if rule.professional is None and rule.service is None:
                applicable_rule = rule
                break
    
    # If no rule found, skip commission creation
    if not applicable_rule:
        return

    # Calculate commission
    service_price = instance.service.price
    commission_percentage = applicable_rule.commission_percentage
    commission_amount = (service_price * commission_percentage) / Decimal("100.00")

    # Create commission record
    Commission.objects.create(
        tenant=instance.tenant,
        professional=instance.professional,
        appointment=instance,
        service=instance.service,
        rule=applicable_rule,
        service_price=service_price,
        commission_percentage=commission_percentage,
        commission_amount=commission_amount,
        date=instance.start_time.date(),
        status="pending",
    )
