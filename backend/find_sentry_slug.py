import requests

token = "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"
org = "vrbtech"
project_id = "4510268455387136"

headers = {'Authorization': f'Bearer {token}'}

# Buscar detalhes do projeto
url = f'https://sentry.io/api/0/projects/{org}/{project_id}/'
response = requests.get(url, headers=headers)

if response.status_code == 200:
    project = response.json()
    print(f"✅ Projeto encontrado!")
    print(f"Nome: {project.get('name')}")
    print(f"Slug: {project.get('slug')}")
    print(f"ID: {project.get('id')}")
    print(f"\n📝 Use este slug: {project.get('slug')}")
else:
    print(f"❌ Erro {response.status_code}: {response.text}")
    
    # Tentar listar todos os projetos
    print("\n📋 Listando todos os projetos:")
    url2 = f'https://sentry.io/api/0/organizations/{org}/projects/'
    response2 = requests.get(url2, headers=headers)
    
    if response2.status_code == 200:
        projects = response2.json()
        for p in projects:
            print(f"  - Slug: {p['slug']} | Nome: {p['name']} | ID: {p['id']}")
    else:
        print(f"❌ Erro ao listar projetos: {response2.status_code}")
