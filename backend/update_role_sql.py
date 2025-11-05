"""
Script para atualizar role via SQL direto no Supabase
Execute este comando no Railway CLI:
railway run python backend/update_role_sql.py
"""
import psycopg2
import os

# Pegar a DATABASE_URL do ambiente
database_url = os.environ.get('DATABASE_URL')

if not database_url:
    print("❌ DATABASE_URL não encontrada")
    exit(1)

try:
    # Conectar ao banco
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    # Verificar role atual
    cur.execute("SELECT email, role, is_superuser, is_staff FROM core_user WHERE email = %s", 
                ('michelhm91@gmail.com',))
    result = cur.fetchone()
    
    if result:
        print(f"\n📋 Dados atuais:")
        print(f"   Email: {result[0]}")
        print(f"   Role atual: {result[1]}")
        print(f"   Is Superuser: {result[2]}")
        print(f"   Is Staff: {result[3]}")
        
        # Atualizar role
        print(f"\n🔧 Atualizando role para 'superadmin'...")
        cur.execute(
            "UPDATE core_user SET role = %s WHERE email = %s",
            ('superadmin', 'michelhm91@gmail.com')
        )
        conn.commit()
        
        # Verificar atualização
        cur.execute("SELECT role FROM core_user WHERE email = %s", 
                    ('michelhm91@gmail.com',))
        new_role = cur.fetchone()[0]
        
        print(f"✅ Role atualizado com sucesso!")
        print(f"   Novo role: {new_role}")
    else:
        print("❌ Usuário não encontrado")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Erro: {e}")
    import traceback
    traceback.print_exc()
