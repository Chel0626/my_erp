"""
Modelo de Clientes
Gerencia informações de clientes da barbearia/salão
"""
from django.db import models
from django.core.validators import EmailValidator, RegexValidator
from core.models import TenantAwareModel, Tenant


class Customer(TenantAwareModel):
    """
    Modelo de Cliente
    Armazena informações completas de clientes
    """
    
    # Informações Pessoais
    name = models.CharField(
        max_length=255,
        verbose_name='Nome Completo',
        help_text='Nome completo do cliente'
    )
    
    cpf = models.CharField(
        max_length=14,
        blank=True,
        null=True,
        verbose_name='CPF',
        validators=[
            RegexValidator(
                regex=r'^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$',
                message='CPF deve estar no formato XXX.XXX.XXX-XX ou apenas números'
            )
        ],
        help_text='CPF do cliente (opcional)'
    )
    
    email = models.EmailField(
        blank=True,
        null=True,
        validators=[EmailValidator()],
        verbose_name='E-mail',
        help_text='E-mail do cliente'
    )
    
    phone = models.CharField(
        max_length=20,
        verbose_name='Telefone Principal',
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message='Telefone deve conter entre 9 e 15 dígitos'
            )
        ],
        help_text='Telefone principal (obrigatório)'
    )
    
    phone_secondary = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name='Telefone Secundário',
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message='Telefone deve conter entre 9 e 15 dígitos'
            )
        ],
        help_text='Telefone secundário (opcional)'
    )
    
    birth_date = models.DateField(
        blank=True,
        null=True,
        verbose_name='Data de Nascimento',
        help_text='Data de nascimento do cliente'
    )
    
    gender = models.CharField(
        max_length=20,
        choices=[
            ('M', 'Masculino'),
            ('F', 'Feminino'),
            ('O', 'Outro'),
            ('N', 'Prefiro não informar'),
        ],
        blank=True,
        null=True,
        verbose_name='Gênero'
    )
    
    # Endereço
    address_street = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='Rua/Avenida',
        help_text='Endereço - Rua ou Avenida'
    )
    
    address_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name='Número',
        help_text='Número do endereço'
    )
    
    address_complement = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Complemento',
        help_text='Complemento (apto, bloco, etc.)'
    )
    
    address_neighborhood = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Bairro'
    )
    
    address_city = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Cidade'
    )
    
    address_state = models.CharField(
        max_length=2,
        blank=True,
        null=True,
        verbose_name='Estado (UF)',
        help_text='Sigla do estado (ex: SP, RJ)'
    )
    
    address_zipcode = models.CharField(
        max_length=10,
        blank=True,
        null=True,
        verbose_name='CEP',
        validators=[
            RegexValidator(
                regex=r'^\d{5}-?\d{3}$',
                message='CEP deve estar no formato XXXXX-XXX'
            )
        ]
    )
    
    # Preferências e Observações
    preferences = models.TextField(
        blank=True,
        null=True,
        verbose_name='Preferências',
        help_text='Preferências do cliente (corte favorito, alergias, etc.)'
    )
    
    notes = models.TextField(
        blank=True,
        null=True,
        verbose_name='Observações',
        help_text='Observações gerais sobre o cliente'
    )
    
    # Categorização
    TAG_CHOICES = [
        ('VIP', 'Cliente VIP'),
        ('REGULAR', 'Cliente Regular'),
        ('NOVO', 'Cliente Novo'),
        ('INATIVO', 'Cliente Inativo'),
    ]
    
    tag = models.CharField(
        max_length=20,
        choices=TAG_CHOICES,
        default='NOVO',
        verbose_name='Tag/Categoria',
        help_text='Categoria do cliente'
    )
    
    # Avatar/Foto
    avatar_url = models.URLField(
        blank=True,
        null=True,
        verbose_name='URL do Avatar',
        help_text='URL da foto do cliente'
    )
    
    # Status
    is_active = models.BooleanField(
        default=True,
        verbose_name='Ativo',
        help_text='Cliente ativo no sistema'
    )
    
    # Metadata
    last_visit = models.DateField(
        blank=True,
        null=True,
        verbose_name='Última Visita',
        help_text='Data da última visita (atualizado automaticamente)'
    )
    
    created_at = models.DateTimeField('Criado em', auto_now_add=True)
    updated_at = models.DateTimeField('Atualizado em', auto_now=True)
    
    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant', 'name']),
            models.Index(fields=['tenant', 'phone']),
            models.Index(fields=['tenant', 'email']),
            models.Index(fields=['tenant', 'tag']),
            models.Index(fields=['tenant', 'is_active']),
            models.Index(fields=['created_at']),
        ]
        # CPF único por tenant (se fornecido)
        constraints = [
            models.UniqueConstraint(
                fields=['tenant', 'cpf'],
                name='unique_customer_cpf_per_tenant',
                condition=models.Q(cpf__isnull=False)
            ),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.phone}"
    
    def get_full_address(self):
        """Retorna endereço completo formatado"""
        parts = []
        if self.address_street:
            street_part = self.address_street
            if self.address_number:
                street_part += f", {self.address_number}"
            if self.address_complement:
                street_part += f" - {self.address_complement}"
            parts.append(street_part)
        
        if self.address_neighborhood:
            parts.append(self.address_neighborhood)
        
        if self.address_city and self.address_state:
            parts.append(f"{self.address_city}/{self.address_state}")
        elif self.address_city:
            parts.append(self.address_city)
        
        if self.address_zipcode:
            parts.append(f"CEP: {self.address_zipcode}")
        
        return ", ".join(parts) if parts else "Endereço não cadastrado"
    
    def get_age(self):
        """Calcula idade do cliente"""
        if not self.birth_date:
            return None
        
        from datetime import date
        today = date.today()
        age = today.year - self.birth_date.year
        
        # Ajusta se ainda não fez aniversário este ano
        if today.month < self.birth_date.month or \
           (today.month == self.birth_date.month and today.day < self.birth_date.day):
            age -= 1
        
        return age
    
    def is_birthday_this_month(self):
        """Verifica se faz aniversário este mês"""
        if not self.birth_date:
            return False
        
        from datetime import date
        today = date.today()
        return self.birth_date.month == today.month

