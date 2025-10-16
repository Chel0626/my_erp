"""
Script to populate commission rules with test data.
Run with: python manage.py shell < scripts/populate_commission_rules.py
"""

from decimal import Decimal

from core.models import Tenant, User
from scheduling.models import Service
from commissions.models import CommissionRule


def populate_commission_rules():
    """Populate database with commission rules."""
    
    # Get the first tenant
    tenant = Tenant.objects.first()
    if not tenant:
        print("❌ No tenant found. Please create a tenant first.")
        return

    print(f"✅ Using tenant: {tenant.name}")

    # Get professionals (users with role 'barbeiro')
    professionals = User.objects.filter(tenant=tenant, role="barbeiro")
    if not professionals.exists():
        print("❌ No professionals found. Please create users with role 'barbeiro'.")
        return

    print(f"✅ Found {professionals.count()} professionals")

    # Get services
    services = Service.objects.filter(tenant=tenant)
    if not services.exists():
        print("❌ No services found. Please create services first.")
        return

    print(f"✅ Found {services.count()} services")

    # Clear existing rules
    CommissionRule.objects.filter(tenant=tenant).delete()
    print("🗑️  Cleared existing commission rules")

    # Create global default rule (30% for everyone)
    global_rule = CommissionRule.objects.create(
        tenant=tenant,
        professional=None,
        service=None,
        commission_percentage=Decimal("30.00"),
        is_active=True,
        priority=0,
    )
    print(f"✅ Created global rule: {global_rule}")

    # Create specific rule for first professional (40% for all services)
    if professionals.count() > 0:
        first_professional = professionals.first()
        pro_rule = CommissionRule.objects.create(
            tenant=tenant,
            professional=first_professional,
            service=None,
            commission_percentage=Decimal("40.00"),
            is_active=True,
            priority=10,
        )
        print(f"✅ Created professional rule: {pro_rule}")

    # Create specific rule for "Corte Masculino" service (35% for everyone)
    corte_service = services.filter(name__icontains="corte").first()
    if corte_service:
        service_rule = CommissionRule.objects.create(
            tenant=tenant,
            professional=None,
            service=corte_service,
            commission_percentage=Decimal("35.00"),
            is_active=True,
            priority=5,
        )
        print(f"✅ Created service rule: {service_rule}")

    # Create specific rule for first professional + "Barba" service (50%)
    if professionals.count() > 0:
        barba_service = services.filter(name__icontains="barba").first()
        if barba_service:
            specific_rule = CommissionRule.objects.create(
                tenant=tenant,
                professional=first_professional,
                service=barba_service,
                commission_percentage=Decimal("50.00"),
                is_active=True,
                priority=20,
            )
            print(f"✅ Created specific rule: {specific_rule}")

    print("\n🎉 Commission rules populated successfully!")
    print(f"Total rules created: {CommissionRule.objects.filter(tenant=tenant).count()}")


if __name__ == "__main__":
    populate_commission_rules()
