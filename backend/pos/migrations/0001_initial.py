# Generated migration for pos app

from django.conf import settings
from django.db import migrations, models
import django.core.validators
import django.db.models.deletion
from decimal import Decimal


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('core', '0001_initial'),
        ('customers', '0001_initial'),
        ('inventory', '0001_initial'),
        ('scheduling', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='CashRegister',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Criado em')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Atualizado em')),
                ('opened_at', models.DateTimeField(auto_now_add=True, verbose_name='Aberto em')),
                ('closed_at', models.DateTimeField(blank=True, null=True, verbose_name='Fechado em')),
                ('opening_balance', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal('0'))], verbose_name='Saldo Inicial')),
                ('closing_balance', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True, validators=[django.core.validators.MinValueValidator(Decimal('0'))], verbose_name='Saldo Final')),
                ('expected_balance', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True, validators=[django.core.validators.MinValueValidator(Decimal('0'))], verbose_name='Saldo Esperado')),
                ('difference', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True, verbose_name='Diferença')),
                ('status', models.CharField(choices=[('open', 'Aberto'), ('closed', 'Fechado')], default='open', max_length=10, verbose_name='Status')),
                ('notes', models.TextField(blank=True, verbose_name='Observações')),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='%(app_label)s_%(class)s_items', to='core.tenant', verbose_name='Tenant')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='cash_registers', to=settings.AUTH_USER_MODEL, verbose_name='Operador')),
            ],
            options={
                'verbose_name': 'Caixa',
                'verbose_name_plural': 'Caixas',
                'db_table': 'pos_cash_register',
                'ordering': ['-opened_at'],
            },
        ),
        migrations.CreateModel(
            name='Sale',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Criado em')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Atualizado em')),
                ('date', models.DateTimeField(auto_now_add=True, verbose_name='Data')),
                ('subtotal', models.DecimalField(decimal_places=2, default=Decimal('0'), max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal('0'))], verbose_name='Subtotal')),
                ('discount', models.DecimalField(decimal_places=2, default=Decimal('0'), max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal('0'))], verbose_name='Desconto')),
                ('total', models.DecimalField(decimal_places=2, default=Decimal('0'), max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal('0'))], verbose_name='Total')),
                ('payment_method', models.CharField(choices=[('cash', 'Dinheiro'), ('credit_card', 'Cartão de Crédito'), ('debit_card', 'Cartão de Débito'), ('pix', 'PIX'), ('bank_transfer', 'Transferência')], max_length=20, verbose_name='Forma de Pagamento')),
                ('payment_status', models.CharField(choices=[('pending', 'Pendente'), ('paid', 'Pago'), ('cancelled', 'Cancelado')], default='pending', max_length=20, verbose_name='Status Pagamento')),
                ('notes', models.TextField(blank=True, verbose_name='Observações')),
                ('cash_register', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='sales', to='pos.cashregister', verbose_name='Caixa')),
                ('customer', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='sales', to='customers.customer', verbose_name='Cliente')),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='%(app_label)s_%(class)s_items', to='core.tenant', verbose_name='Tenant')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='sales', to=settings.AUTH_USER_MODEL, verbose_name='Vendedor')),
            ],
            options={
                'verbose_name': 'Venda',
                'verbose_name_plural': 'Vendas',
                'db_table': 'pos_sale',
                'ordering': ['-date'],
            },
        ),
        migrations.CreateModel(
            name='SaleItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Criado em')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Atualizado em')),
                ('quantity', models.DecimalField(decimal_places=2, default=Decimal('1'), max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal('0.01'))], verbose_name='Quantidade')),
                ('unit_price', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal('0'))], verbose_name='Preço Unitário')),
                ('discount', models.DecimalField(decimal_places=2, default=Decimal('0'), max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal('0'))], verbose_name='Desconto')),
                ('total', models.DecimalField(decimal_places=2, default=Decimal('0'), max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal('0'))], verbose_name='Total')),
                ('product', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='sale_items', to='inventory.product', verbose_name='Produto')),
                ('professional', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='sale_items', to=settings.AUTH_USER_MODEL, verbose_name='Profissional')),
                ('sale', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='pos.sale', verbose_name='Venda')),
                ('service', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='sale_items', to='scheduling.service', verbose_name='Serviço')),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='%(app_label)s_%(class)s_items', to='core.tenant', verbose_name='Tenant')),
            ],
            options={
                'verbose_name': 'Item da Venda',
                'verbose_name_plural': 'Itens da Venda',
                'db_table': 'pos_sale_item',
                'ordering': ['id'],
            },
        ),
    ]
