# Como Acessar Django Admin no Railway

## URLs
- **Django Admin**: https://myerp-production-4bb9.up.railway.app/admin/
- **Frontend (referência)**: https://vrb-erp-frontend.vercel.app

## Problema
O Django Admin não está acessível porque:
1. O domínio do Railway pode não estar em `ALLOWED_HOSTS`
2. Pode não ter um superuser criado

## Solução

### Passo 1: Configurar ALLOWED_HOSTS

No Railway, adicione a variável de ambiente:

1. Acesse https://railway.app
2. Entre no projeto → Serviço backend
3. Vá em **Variables**
4. Adicione ou edite:
   ```
   ALLOWED_HOSTS=localhost,127.0.0.1,myerp-production-4bb9.up.railway.app,.railway.app
   ```

### Passo 2: Criar Superuser

**Opção A: Via Railway CLI**

```bash
railway run python backend/manage.py createsuperuser
```

**Opção B: Via Script (Recomendado)**

Já existe um script `create_superuser.py`. Execute:

```bash
railway run python backend/create_superuser.py
```

Isso criará:
- **Email**: admin@admin.com
- **Password**: Admin@123
- **Nome**: Super Admin
- **Role**: superadmin
- **Tenant**: Auto-criado "Sistema Principal"

**Opção C: Via Terminal Web do Railway**

1. No dashboard do Railway → Backend service
2. Procure por "Shell" ou "Terminal"
3. Execute:
   ```bash
   cd backend
   python manage.py createsuperuser --username admin --email admin@admin.com
   # Digite a senha quando solicitado
   ```

### Passo 3: Verificar Acesso

1. Acesse: https://myerp-production-4bb9.up.railway.app/admin/
2. Faça login com:
   - **Email/Username**: admin@admin.com
   - **Password**: Admin@123

## Troubleshooting

### Erro "DisallowedHost"
- Verifique se o domínio está no `ALLOWED_HOSTS`
- Adicione `.railway.app` para permitir todos os subdomínios

### Página 404
- Verifique se `django.contrib.admin` está em `INSTALLED_APPS` ✅ (já está)
- Verifique se `path("admin/", admin.site.urls)` está em `urls.py` ✅ (já está)

### Superuser Não Funciona
- Execute `railway run python backend/manage.py shell` e verifique:
  ```python
  from django.contrib.auth import get_user_model
  User = get_user_model()
  users = User.objects.filter(is_superuser=True)
  for u in users:
      print(f"{u.email} - Superuser: {u.is_superuser} - Staff: {u.is_staff}")
  ```

## Credenciais Padrão

Se usar o script `create_superuser.py`:

```
Email: admin@admin.com
Senha: Admin@123
```

Se criar manualmente, use suas próprias credenciais.
