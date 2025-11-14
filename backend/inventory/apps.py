from django.apps import AppConfig


class InventoryConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "inventory"
    
    def ready(self):
        """Importa signals quando a app estiver pronta"""
        import inventory.signals
