"""
Funções de envio de email
"""
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags


def send_invite_email(user_email, user_name, temporary_password, company_name, invited_by_name):
    """
    Envia email de convite para novo usuário
    
    Args:
        user_email: Email do novo usuário
        user_name: Nome do novo usuário
        temporary_password: Senha temporária gerada
        company_name: Nome da empresa
        invited_by_name: Nome de quem convidou
    """
    subject = f'Você foi convidado para {company_name}'
    
    # Contexto para o template
    context = {
        'user_name': user_name,
        'company_name': company_name,
        'invited_by_name': invited_by_name,
        'email': user_email,
        'temporary_password': temporary_password,
        'login_url': f"{settings.FRONTEND_URL}/login",
    }
    
    # Mensagem HTML
    html_message = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2563eb;">Bem-vindo ao {company_name}!</h2>
                
                <p>Olá <strong>{user_name}</strong>,</p>
                
                <p>{invited_by_name} convidou você para fazer parte da equipe no sistema ERP.</p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Suas credenciais de acesso:</h3>
                    <p style="margin: 10px 0;">
                        <strong>Email:</strong> {user_email}<br>
                        <strong>Senha temporária:</strong> <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px;">{temporary_password}</code>
                    </p>
                </div>
                
                <p>
                    <a href="{context['login_url']}" 
                       style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                        Acessar Sistema
                    </a>
                </p>
                
                <p style="color: #dc2626; font-size: 14px;">
                    <strong>⚠️ Importante:</strong> Por segurança, altere sua senha no primeiro acesso.
                </p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="color: #6b7280; font-size: 12px;">
                    Este é um email automático. Se você não esperava este convite, pode ignorá-lo.
                </p>
            </div>
        </body>
    </html>
    """
    
    # Versão texto puro
    plain_message = f"""
Bem-vindo ao {company_name}!

Olá {user_name},

{invited_by_name} convidou você para fazer parte da equipe no sistema ERP.

Suas credenciais de acesso:
- Email: {user_email}
- Senha temporária: {temporary_password}

Acesse: {context['login_url']}

⚠️ Importante: Por segurança, altere sua senha no primeiro acesso.

---
Este é um email automático. Se você não esperava este convite, pode ignorá-lo.
    """
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Erro ao enviar email: {str(e)}")
        return False


def send_appointment_confirmation_email(appointment):
    """
    Envia email de confirmação de agendamento
    
    Args:
        appointment: Objeto Appointment
    """
    from django.utils import timezone
    from datetime import datetime
    
    # Só envia se tiver email do cliente
    if not appointment.customer_email:
        return False
    
    subject = f'Agendamento Confirmado - {appointment.tenant.company_name}'
    
    # Formata data e hora
    start_time = appointment.start_time
    if timezone.is_aware(start_time):
        start_time = timezone.localtime(start_time)
    
    date_formatted = start_time.strftime('%d/%m/%Y')
    time_formatted = start_time.strftime('%H:%M')
    
    context = {
        'customer_name': appointment.customer_name,
        'company_name': appointment.tenant.company_name,
        'service_name': appointment.service.name if appointment.service else 'Serviço',
        'professional_name': appointment.professional.name if appointment.professional else 'Profissional',
        'date': date_formatted,
        'time': time_formatted,
        'price': f'R$ {appointment.price:.2f}' if appointment.price else 'A combinar',
    }
    
    html_message = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #10b981;">✅ Agendamento Confirmado!</h2>
                
                <p>Olá <strong>{context['customer_name']}</strong>,</p>
                
                <p>Seu agendamento foi confirmado com sucesso!</p>
                
                <div style="background-color: #f0fdf4; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #059669;">Detalhes do Agendamento:</h3>
                    <p style="margin: 8px 0;"><strong>Serviço:</strong> {context['service_name']}</p>
                    <p style="margin: 8px 0;"><strong>Profissional:</strong> {context['professional_name']}</p>
                    <p style="margin: 8px 0;"><strong>Data:</strong> {context['date']}</p>
                    <p style="margin: 8px 0;"><strong>Horário:</strong> {context['time']}</p>
                    <p style="margin: 8px 0;"><strong>Valor:</strong> {context['price']}</p>
                </div>
                
                <p style="color: #6b7280; font-size: 14px;">
                    Em caso de imprevistos, entre em contato com antecedência para reagendar.
                </p>
                
                <p>Aguardamos você!</p>
                <p><strong>{context['company_name']}</strong></p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="color: #6b7280; font-size: 12px;">
                    Este é um email automático de confirmação.
                </p>
            </div>
        </body>
    </html>
    """
    
    plain_message = f"""
✅ Agendamento Confirmado!

Olá {context['customer_name']},

Seu agendamento foi confirmado com sucesso!

Detalhes do Agendamento:
- Serviço: {context['service_name']}
- Profissional: {context['professional_name']}
- Data: {context['date']}
- Horário: {context['time']}
- Valor: {context['price']}

Em caso de imprevistos, entre em contato com antecedência para reagendar.

Aguardamos você!
{context['company_name']}

---
Este é um email automático de confirmação.
    """
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[appointment.customer_email],
            html_message=html_message,
            fail_silently=True,  # Não falha se email não enviar
        )
        return True
    except Exception as e:
        print(f"Erro ao enviar email de confirmação: {str(e)}")
        return False
