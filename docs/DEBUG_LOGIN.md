# 🔍 DEBUG - Login não está funcionando

## 🎯 Problema
O signup funciona, mas o login não loga (sem erro aparente).

## ✅ O que já verificamos
- ✅ Backend respondendo 200 (sucesso) para login
- ✅ Tokens sendo gerados corretamente
- ✅ Signup funcionando perfeitamente

## 🐛 Como debugar

### 1. **Abra o Console do Navegador**
- Pressione `F12`
- Vá na aba **Console**
- Limpe o console (ícone 🚫)

### 2. **Tente fazer login**
- Email: `joao@barbearia.com`
- Senha: `senha123`
- Clique em "Entrar"

### 3. **Observe os logs no Console**

Você deve ver algo como:
```
📝 Form submetido { email: "joao@barbearia.com", password: "***" }
🔐 Chamando função login...
🔐 Iniciando login... { email: "joao@barbearia.com" }
✅ Login bem-sucedido, dados recebidos: { access: "...", refresh: "..." }
💾 Tokens salvos no localStorage
👤 Carregando dados do usuário...
🔑 Token encontrado: Sim
📡 Buscando dados do usuário...
👤 Dados do usuário: { id: "...", email: "...", ... }
📡 Buscando dados do tenant...
🏢 Dados do tenant: { id: "...", name: "..." }
✅ Dados do usuário carregados
🚀 Redirecionando para dashboard...
✅ Login concluído com sucesso!
🏁 handleSubmit finalizado
```

### 4. **Identifique onde para**

Se você ver:
- **"Form submetido" mas não vê "Chamando função login"** 
  → Problema: O useAuth não está funcionando

- **"Login bem-sucedido" mas não vê "Tokens salvos"**
  → Problema: localStorage não está funcionando

- **"Tokens salvos" mas não vê "Buscando dados do usuário"**
  → Problema: loadUser() travou

- **"Carregando dados do usuário" mas erro depois**
  → Problema: API de usuário/tenant

- **"Redirecionando para dashboard" mas não redireciona**
  → Problema: router.push() não está funcionando

### 5. **Verifique o localStorage**

No Console do navegador, execute:
```javascript
localStorage.getItem('access_token')
localStorage.getItem('refresh_token')
```

Se retornar `null` = tokens não foram salvos  
Se retornar uma string longa = tokens salvos ✅

### 6. **Verifique o Network (Rede)**

- Vá na aba **Network** (Rede)
- Filtre por "login"
- Veja se a requisição foi feita
- Verifique o Status Code (deve ser 200)
- Veja a Response (resposta)

---

## 🔧 Possíveis Soluções

### Solução 1: Limpar Cache
```javascript
// No Console do navegador
localStorage.clear()
location.reload()
```

### Solução 2: Verificar se o middleware não está bloqueando
O arquivo `middleware.ts` pode estar redirecionando antes do login completar.

### Solução 3: Verificar se AuthProvider está envolvendo a aplicação
O `layout.tsx` deve ter:
```tsx
<AuthProvider>
  <QueryProvider>
    {children}
  </QueryProvider>
</AuthProvider>
```

---

## 📋 Checklist de Debug

- [ ] Console aberto (F12)
- [ ] Logs aparecendo no console
- [ ] Identificou onde o processo para
- [ ] Verificou localStorage
- [ ] Verificou Network tab
- [ ] Testou limpar cache

---

## 📝 Me envie estas informações:

Depois de seguir os passos acima, me informe:

1. **Último log que apareceu no console antes de parar**
2. **O que aparece no localStorage** (access_token e refresh_token)
3. **Status da requisição /api/auth/login/** (200? 401? 500?)
4. **Algum erro em vermelho no console?**

Com essas informações consigo identificar exatamente o problema! 🎯
