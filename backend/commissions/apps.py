from django.apps import AppConfig


class CommissionsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "commissions"

    def ready(self):
        """Import signals when app is ready."""
        import commissions.signals
