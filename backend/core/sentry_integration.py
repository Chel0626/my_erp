"""
Integração com Sentry API para buscar métricas de erros
"""
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from decouple import config


class SentryIntegration:
    """
    Cliente para interagir com a API do Sentry
    Documentação: https://docs.sentry.io/api/
    """
    
    def __init__(self):
        self.auth_token = config('SENTRY_AUTH_TOKEN', default='')
        self.organization_slug = config('SENTRY_ORG_SLUG', default='')
        self.project_slug = config('SENTRY_PROJECT_SLUG', default='')
        self.base_url = 'https://sentry.io/api/0'
        
        if not self.auth_token:
            print("⚠️ SENTRY_AUTH_TOKEN não configurado")
    
    def _make_request(self, endpoint: str, params: Optional[Dict] = None) -> Optional[Dict]:
        """Faz requisição à API do Sentry"""
        if not self.auth_token:
            return None
        
        headers = {
            'Authorization': f'Bearer {self.auth_token}',
            'Content-Type': 'application/json',
        }
        
        url = f"{self.base_url}/{endpoint}"
        
        try:
            response = requests.get(url, headers=headers, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"❌ Erro ao buscar dados do Sentry: {e}")
            return None
    
    def get_project_stats(self, period: str = '24h') -> Optional[Dict]:
        """
        Busca estatísticas do projeto
        
        Args:
            period: '24h', '7d', '30d'
        
        Returns:
            {
                'total_events': int,
                'unique_issues': int,
                'affected_users': int,
            }
        """
        endpoint = f"projects/{self.organization_slug}/{self.project_slug}/stats/"
        params = {'stat': 'received', 'resolution': '1h'}
        
        data = self._make_request(endpoint, params)
        
        if not data:
            return None
        
        # Calcula totais
        total_events = sum(point[1] for point in data)
        
        return {
            'total_events': total_events,
            'period': period,
            'data_points': data,
        }
    
    def get_recent_issues(self, limit: int = 10) -> List[Dict]:
        """
        Busca issues recentes
        
        Returns:
            Lista de issues com:
            - id
            - title
            - count (quantas vezes aconteceu)
            - userCount (usuários afetados)
            - lastSeen
            - level (error, warning, info)
            - status (resolved, unresolved)
        """
        endpoint = f"projects/{self.organization_slug}/{self.project_slug}/issues/"
        params = {
            'statsPeriod': '24h',
            'limit': limit,
            'sort': 'freq',  # Mais frequentes primeiro
        }
        
        issues = self._make_request(endpoint, params)
        
        if not issues:
            return []
        
        # Formata dados
        formatted = []
        for issue in issues:
            formatted.append({
                'id': issue.get('id'),
                'title': issue.get('title'),
                'culprit': issue.get('culprit'),  # Linha de código
                'count': issue.get('count'),
                'userCount': issue.get('userCount'),
                'lastSeen': issue.get('lastSeen'),
                'firstSeen': issue.get('firstSeen'),
                'level': issue.get('level'),
                'status': issue.get('status'),
                'permalink': issue.get('permalink'),
                'metadata': issue.get('metadata', {}),
            })
        
        return formatted
    
    def get_issues_by_tag(self, tag: str, value: str, limit: int = 10) -> List[Dict]:
        """
        Busca issues filtradas por tag
        
        Args:
            tag: Nome da tag (ex: 'api_module', 'tenant_name')
            value: Valor da tag (ex: 'pos', 'inventory')
        """
        endpoint = f"projects/{self.organization_slug}/{self.project_slug}/issues/"
        params = {
            'query': f'{tag}:{value}',
            'statsPeriod': '24h',
            'limit': limit,
        }
        
        return self._make_request(endpoint, params) or []
    
    def get_project_details(self) -> Optional[Dict]:
        """Busca detalhes do projeto"""
        endpoint = f"projects/{self.organization_slug}/{self.project_slug}/"
        return self._make_request(endpoint)
    
    def get_dashboard_summary(self) -> Dict:
        """
        Retorna resumo completo para dashboard
        
        Returns:
            {
                'stats': {...},
                'recent_issues': [...],
                'errors_by_module': {...},
                'is_configured': bool,
            }
        """
        if not self.auth_token:
            return {
                'is_configured': False,
                'message': 'Sentry não configurado. Configure SENTRY_AUTH_TOKEN nas variáveis de ambiente.',
            }
        
        stats = self.get_project_stats('24h')
        recent_issues = self.get_recent_issues(10)
        
        # Agrupa erros por módulo
        errors_by_module = {}
        for issue in recent_issues:
            # Extrai módulo do metadata ou tags
            module = 'other'
            if 'tags' in issue.get('metadata', {}):
                for tag in issue['metadata']['tags']:
                    if tag[0] == 'api_module':
                        module = tag[1]
                        break
            
            # Garante que count é int
            count = issue.get('count', 0)
            if isinstance(count, str):
                count = int(count) if count.isdigit() else 0
            
            errors_by_module[module] = errors_by_module.get(module, 0) + count
        
        return {
            'is_configured': True,
            'stats': stats,
            'recent_issues': recent_issues,
            'errors_by_module': errors_by_module,
            'sentry_url': f"https://sentry.io/organizations/{self.organization_slug}/issues/",
        }


# Instância global
sentry_client = SentryIntegration()
