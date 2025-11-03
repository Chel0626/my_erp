"""
Permissões personalizadas para Multi-Tenant
Implementa BLOCO 3: Regras de Segurança
"""
from rest_framework import permissions


class IsTenantAdmin(permissions.BasePermission):
    """
    Permissão que verifica se o usuário é admin do seu tenant
    """
    message = 'Você precisa ser administrador para realizar esta ação.'

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_admin()
        )


class IsSameTenant(permissions.BasePermission):
    """
    Permissão que verifica se o objeto pertence ao mesmo tenant do usuário
    Regra Universal: "Um usuário só pode ver/editar dados que pertencem ao seu próprio Tenant."
    """
    message = 'Você não tem permissão para acessar este recurso.'

    def has_object_permission(self, request, view, obj):
        # Verifica se o objeto tem o atributo tenant
        if not hasattr(obj, 'tenant'):
            # Se for um User, verifica se é o próprio usuário ou admin do mesmo tenant
            if hasattr(obj, 'tenant_id'):
                return obj.tenant_id == request.user.tenant_id
            # Se não tem tenant, permite (ex: Tenant model)
            return True

        # Verifica se o tenant do objeto é o mesmo do usuário
        return obj.tenant_id == request.user.tenant_id


class IsSameTenantOrAdmin(permissions.BasePermission):
    """
    Permissão que verifica se:
    - O objeto pertence ao mesmo tenant do usuário, OU
    - O usuário é admin do tenant
    """
    message = 'Você não tem permissão para acessar este recurso.'

    def has_object_permission(self, request, view, obj):
        # Admins podem fazer tudo no seu tenant
        if request.user.is_admin():
            if hasattr(obj, 'tenant'):
                return obj.tenant_id == request.user.tenant_id
            if hasattr(obj, 'tenant_id'):
                return obj.tenant_id == request.user.tenant_id

        # Outros usuários só podem acessar seus próprios dados
        return obj.id == request.user.id


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permissão que permite acesso apenas ao próprio usuário ou admin do tenant
    """
    message = 'Você não tem permissão para acessar este recurso.'

    def has_object_permission(self, request, view, obj):
        # Permite se for o próprio usuário
        if obj.id == request.user.id:
            return True

        # Permite se for admin do mesmo tenant
        return (
            request.user.is_admin() and
            obj.tenant_id == request.user.tenant_id
        )


class IsTenantUser(permissions.BasePermission):
    """
    Permissão básica que verifica se o usuário está autenticado e tem um tenant
    """
    message = 'Você precisa estar autenticado e vinculado a um tenant.'

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'tenant_id') and
            request.user.tenant_id is not None
        )
