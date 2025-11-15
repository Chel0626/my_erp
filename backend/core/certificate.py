"""
Sistema de gerenciamento de certificados digitais para emissão de NF-e
"""
import os
from datetime import datetime
from pathlib import Path
from django.conf import settings
from django.core.exceptions import ValidationError

try:
    from cryptography import x509
    from cryptography.hazmat.backends import default_backend
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.primitives.serialization import pkcs12
    from OpenSSL import crypto
    CRYPTO_AVAILABLE = True
except ImportError:
    CRYPTO_AVAILABLE = False


class CertificateManager:
    """Gerenciador de certificados digitais A1"""
    
    def __init__(self, tenant):
        """
        Args:
            tenant: Instância do Tenant
        """
        self.tenant = tenant
        
        if not CRYPTO_AVAILABLE:
            raise ValidationError('Bibliotecas de criptografia não instaladas. Execute: pip install cryptography pyOpenSSL')
    
    def validate_certificate(self, certificate_file, password):
        """
        Valida um certificado digital .pfx
        
        Args:
            certificate_file: Arquivo do certificado (.pfx)
            password: Senha do certificado
            
        Returns:
            dict: Informações do certificado validado
            
        Raises:
            ValidationError: Se o certificado for inválido
        """
        try:
            # Lê o arquivo do certificado
            certificate_data = certificate_file.read()
            
            # Tenta carregar o certificado com a senha fornecida
            private_key, certificate, ca_certs = pkcs12.load_key_and_certificates(
                certificate_data,
                password.encode() if isinstance(password, str) else password,
                backend=default_backend()
            )
            
            if not certificate:
                raise ValidationError('Certificado não encontrado no arquivo')
            
            # Extrai informações do certificado
            subject = certificate.subject
            issuer = certificate.issuer
            not_valid_after = certificate.not_valid_after_utc
            not_valid_before = certificate.not_valid_before_utc
            
            # Verifica se o certificado está dentro do período de validade
            now = datetime.now(not_valid_after.tzinfo)
            
            if now < not_valid_before:
                raise ValidationError('Certificado ainda não é válido')
            
            if now > not_valid_after:
                raise ValidationError('Certificado expirado')
            
            # Extrai CNPJ do certificado (campo CN)
            cn = None
            for attr in subject:
                if attr.oid._name == 'commonName':
                    cn = attr.value
                    break
            
            # Extrai serial number
            serial_number = certificate.serial_number
            
            return {
                'cn': cn,
                'issuer': issuer.rfc4514_string(),
                'serial_number': str(serial_number),
                'not_valid_before': not_valid_before,
                'not_valid_after': not_valid_after,
                'days_until_expiry': (not_valid_after - now).days,
                'is_valid': True,
            }
            
        except Exception as e:
            raise ValidationError(f'Erro ao validar certificado: {str(e)}')
    
    def install_certificate(self, certificate_file, password):
        """
        Instala e valida um certificado digital para o tenant
        
        Args:
            certificate_file: Arquivo do certificado (.pfx)
            password: Senha do certificado
            
        Returns:
            dict: Informações do certificado instalado
        """
        # Valida o certificado
        cert_info = self.validate_certificate(certificate_file, password)
        
        # Verifica se tem pelo menos 30 dias até expirar
        if cert_info['days_until_expiry'] < 30:
            raise ValidationError(
                f'Certificado expira em {cert_info["days_until_expiry"]} dias. '
                'Por favor, renove o certificado antes de instalá-lo.'
            )
        
        # Salva o certificado
        certificate_file.seek(0)  # Reseta o ponteiro do arquivo
        self.tenant.digital_certificate = certificate_file
        
        # Salva a senha criptografada (em produção, usar django-encrypted-model-fields)
        from cryptography.fernet import Fernet
        
        # Gera uma chave de criptografia (em produção, usar settings.SECRET_KEY derivado)
        key = settings.SECRET_KEY.encode()[:32].ljust(32, b'0')
        cipher = Fernet(key)
        encrypted_password = cipher.encrypt(password.encode())
        
        self.tenant.certificate_password = encrypted_password.decode()
        self.tenant.certificate_expiry = cert_info['not_valid_after'].date()
        self.tenant.save()
        
        return cert_info
    
    def get_certificate_info(self):
        """
        Obtém informações do certificado instalado
        
        Returns:
            dict: Informações do certificado ou None se não houver certificado
        """
        if not self.tenant.digital_certificate:
            return None
        
        try:
            password = self._decrypt_password()
            
            with self.tenant.digital_certificate.open('rb') as cert_file:
                return self.validate_certificate(cert_file, password)
                
        except Exception as e:
            return {
                'error': str(e),
                'is_valid': False,
            }
    
    def remove_certificate(self):
        """Remove o certificado digital do tenant"""
        if self.tenant.digital_certificate:
            # Deleta o arquivo físico
            certificate_path = self.tenant.digital_certificate.path
            if os.path.exists(certificate_path):
                os.remove(certificate_path)
        
        self.tenant.digital_certificate = None
        self.tenant.certificate_password = ''
        self.tenant.certificate_expiry = None
        self.tenant.save()
    
    def _decrypt_password(self):
        """
        Descriptografa a senha do certificado
        
        Returns:
            str: Senha descriptografada
        """
        if not CRYPTO_AVAILABLE:
            raise ValidationError('Bibliotecas de criptografia não instaladas')
            
        from cryptography.fernet import Fernet
        
        key = settings.SECRET_KEY.encode()[:32].ljust(32, b'0')
        cipher = Fernet(key)
        
        encrypted_password = self.tenant.certificate_password.encode()
        password = cipher.decrypt(encrypted_password).decode()
        
        return password
    
    def is_certificate_valid(self):
        """
        Verifica se o certificado está válido
        
        Returns:
            bool: True se válido, False caso contrário
        """
        if not self.tenant.digital_certificate or not self.tenant.certificate_expiry:
            return False
        
        # Verifica se não expirou
        from datetime import date
        if self.tenant.certificate_expiry < date.today():
            return False
        
        # Verifica se está perto de expirar (30 dias)
        days_until_expiry = (self.tenant.certificate_expiry - date.today()).days
        if days_until_expiry < 30:
            return False
        
        return True
    
    def get_certificate_for_signing(self):
        """
        Obtém o certificado para assinatura de NF-e
        
        Returns:
            tuple: (private_key, certificate, ca_certs)
            
        Raises:
            ValidationError: Se o certificado não estiver disponível ou válido
        """
        if not self.is_certificate_valid():
            raise ValidationError('Certificado digital não está disponível ou válido')
        
        password = self._decrypt_password()
        
        with self.tenant.digital_certificate.open('rb') as cert_file:
            certificate_data = cert_file.read()
            
        private_key, certificate, ca_certs = pkcs12.load_key_and_certificates(
            certificate_data,
            password.encode(),
            backend=default_backend()
        )
        
        return private_key, certificate, ca_certs
