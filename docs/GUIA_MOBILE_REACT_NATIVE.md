# 📱 Guia Completo: App Mobile React Native

## 🎯 **RESUMO EXECUTIVO**

**Nível de Dificuldade:** ⭐⭐⭐ (Médio)
**Tempo Estimado:** 4-6 semanas (desenvolvimento completo)
**Complexidade CI/CD:** ⭐⭐⭐⭐ (Média-Alta para iOS)

---

## 📊 **ANÁLISE DE VIABILIDADE**

### **✅ VANTAGENS**
1. **Reutilização de Código:** ~80% do código compartilhado entre iOS e Android
2. **API Pronta:** Seu backend Django já está pronto
3. **TypeScript:** Mesma linguagem do frontend web
4. **Comunidade Grande:** React Native tem excelente suporte
5. **Hot Reload:** Desenvolvimento rápido

### **⚠️ DESAFIOS**
1. **Configuração Inicial:** Setup de ambiente complexo
2. **CI/CD iOS:** Apple requer Mac para build (caro no GitHub Actions)
3. **Aprovação nas Lojas:** App Store e Play Store têm processos de review
4. **Notificações Push:** Requer configuração adicional (Firebase)
5. **Atualizações:** Manter 3 plataformas (Web + iOS + Android)

---

## 🛠️ **STACK TECNOLÓGICA RECOMENDADA**

### **Core**
- **React Native** 0.73+ (framework)
- **Expo** (build e deploy simplificado) - **RECOMENDADO**
- **TypeScript** (type safety)

### **Navegação**
- **React Navigation** (navegação entre telas)

### **State Management**
- **React Query / TanStack Query** (mesma biblioteca do web)
- **Zustand** ou **Context API** (estado local)

### **UI Components**
- **React Native Paper** (Material Design)
- **NativeBase** (cross-platform)
- **Tamagui** (performance otimizada)

### **Funcionalidades**
- **React Native Calendars** (agenda)
- **React Native Camera** (fotos de perfil, comprovantes)
- **React Native Push Notifications** (avisos de agendamento)
- **React Native Permissions** (câmera, notificações)
- **React Native Gesture Handler** (interações touch)

---

## 📁 **ESTRUTURA DO PROJETO**

```
my_erp_mobile/
├── .github/
│   └── workflows/
│       ├── build-android.yml
│       └── build-ios.yml
├── android/              # Código nativo Android
├── ios/                  # Código nativo iOS
├── src/
│   ├── api/             # Cliente API (axios)
│   ├── components/      # Componentes reutilizáveis
│   │   ├── appointments/
│   │   ├── customers/
│   │   ├── financial/
│   │   └── ui/
│   ├── contexts/        # AuthContext, etc
│   ├── hooks/           # Custom hooks (useAppointments, etc)
│   ├── navigation/      # Configuração de rotas
│   ├── screens/         # Telas do app
│   │   ├── Auth/
│   │   ├── Dashboard/
│   │   ├── Appointments/
│   │   ├── Customers/
│   │   ├── Financial/
│   │   └── Profile/
│   ├── services/        # Notificações, storage
│   ├── theme/           # Cores, fontes, estilos
│   ├── types/           # TypeScript types
│   └── utils/           # Funções utilitárias
├── app.json             # Configuração Expo
├── eas.json             # Configuração EAS Build
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 **PLANO DE IMPLEMENTAÇÃO**

### **FASE 1: Setup Inicial (1 semana)**

#### **1.1 Criar Projeto**
```bash
# Instalar Expo CLI
npm install -g expo-cli

# Criar projeto
npx create-expo-app my_erp_mobile --template blank-typescript

cd my_erp_mobile

# Instalar dependências
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install @tanstack/react-query
npm install axios
npm install react-native-paper
npm install @react-native-async-storage/async-storage
npm install expo-notifications
npm install expo-camera
npm install expo-image-picker
```

#### **1.2 Configurar `app.json`**
```json
{
  "expo": {
    "name": "Meu ERP",
    "slug": "meu-erp",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.seuerp.app",
      "buildNumber": "1.0.0",
      "infoPlist": {
        "NSCameraUsageDescription": "Precisamos acessar sua câmera para foto de perfil",
        "NSPhotoLibraryUsageDescription": "Precisamos acessar suas fotos"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.seuerp.app",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "NOTIFICATIONS"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-notifications",
      [
        "expo-camera",
        {
          "cameraPermission": "Permitir $(PRODUCT_NAME) acessar sua câmera"
        }
      ]
    ]
  }
}
```

---

### **FASE 2: Autenticação (1 semana)**

#### **2.1 API Client**
```typescript
// src/api/client.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://api.seuerp.com/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/core/auth/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        await AsyncStorage.setItem('access_token', access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        // Navegar para login
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

#### **2.2 Auth Context**
```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        const response = await api.get('/core/users/me/');
        setUser(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/core/auth/login/', { email, password });
    await AsyncStorage.setItem('access_token', response.data.access);
    await AsyncStorage.setItem('refresh_token', response.data.refresh);
    await loadUser();
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

### **FASE 3: Telas Principais (2 semanas)**

#### **3.1 Dashboard**
- Lista de agendamentos do dia
- Resumo financeiro
- Atalhos rápidos

#### **3.2 Agenda**
- Calendário interativo
- Lista de agendamentos
- Criar/editar agendamento

#### **3.3 Clientes**
- Lista de clientes
- Busca e filtros
- Detalhes do cliente

#### **3.4 Financeiro**
- Resumo de receitas
- Lançamentos
- Gráficos

---

### **FASE 4: Notificações Push (1 semana)**

#### **4.1 Configurar Firebase**
```bash
# Instalar Firebase
expo install @react-native-firebase/app @react-native-firebase/messaging
```

#### **4.2 Backend - Enviar Notificações**
```python
# backend/services/push_notifications.py
from firebase_admin import messaging

def send_push_notification(user_token, title, body, data=None):
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        data=data or {},
        token=user_token,
    )
    
    response = messaging.send(message)
    return response
```

---

## 🤖 **CI/CD com GitHub Actions**

### **DESAFIO: Build iOS**
- Apple requer **macOS** para compilar iOS
- GitHub Actions macOS runners custam **10x mais** que Linux
- **Solução:** Usar **EAS Build** (Expo Application Services)

### **EAS Build (RECOMENDADO)**

#### **Configurar EAS**
```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurar
eas build:configure
```

#### **`.github/workflows/mobile-build.yml`**
```yaml
name: Build Mobile Apps

on:
  push:
    branches: [main]
    paths:
      - 'mobile/**'

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        working-directory: mobile
        run: npm ci
      
      - name: Build Android APK
        working-directory: mobile
        run: eas build --platform android --profile preview --non-interactive
      
      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-release.apk
          path: mobile/build/*.apk

  build-ios:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        working-directory: mobile
        run: npm ci
      
      - name: Build iOS IPA
        working-directory: mobile
        run: eas build --platform ios --profile preview --non-interactive
        env:
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_PASSWORD: ${{ secrets.APPLE_APP_PASSWORD }}
      
      - name: Upload IPA
        uses: actions/upload-artifact@v3
        with:
          name: app-release.ipa
          path: mobile/build/*.ipa

  submit-to-stores:
    needs: [build-android, build-ios]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Submit to Play Store
        run: eas submit --platform android --latest
        
      - name: Submit to App Store
        run: eas submit --platform ios --latest
```

---

## 💰 **CUSTOS CI/CD**

### **GitHub Actions (Self-Hosted)**
- **Linux runners:** Grátis (2000 min/mês)
- **macOS runners:** $0.08/min (~$80 para 1000 builds)
- ❌ **Muito caro para iOS!**

### **EAS Build (Expo) - RECOMENDADO**
- **Free:** 30 builds/mês
- **Production ($29/mês):** Builds ilimitados
- ✅ **Melhor custo-benefício**

### **Alternativas**
- **Bitrise:** $36/mês (75 builds)
- **Codemagic:** $28/mês (500 min)
- **AppCenter:** Grátis (limitado)

---

## 📱 **PUBLICAÇÃO NAS LOJAS**

### **Google Play Store**
- **Custo:** $25 (pagamento único)
- **Tempo de aprovação:** 1-3 dias
- **Review:** Relativamente fácil

### **Apple App Store**
- **Custo:** $99/ano
- **Tempo de aprovação:** 1-7 dias
- **Review:** Mais rigorosa

### **Requisitos**
- [ ] Ícone (1024x1024)
- [ ] Screenshots (5+ por tamanho de tela)
- [ ] Descrição do app
- [ ] Política de privacidade (URL)
- [ ] Termos de uso (URL)
- [ ] Video preview (opcional)

---

## ⏱️ **TIMELINE REALISTA**

### **Desenvolvimento**
- **Semana 1-2:** Setup + Autenticação
- **Semana 3-4:** Telas principais (Dashboard, Agenda)
- **Semana 5:** Clientes + Financeiro
- **Semana 6:** Notificações + Testes
- **Semana 7:** Polimento + Bug fixes
- **Semana 8:** Preparação para lojas

### **Publicação**
- **Semana 9:** Submissão às lojas
- **Semana 10:** Review e ajustes

**TOTAL:** 10 semanas (2.5 meses)

---

## 🎨 **CONSIDERAÇÕES IMPORTANTES**

### **UX/UI Mobile**
- Design adaptado para touch
- Tamanhos de botões adequados (mínimo 44x44 pixels)
- Navegação simplificada (máximo 3 níveis)
- Loading states claros
- Feedback visual de ações

### **Performance**
- Lazy loading de imagens
- Virtualização de listas longas
- Cache de dados (React Query)
- Minimizar re-renders

### **Offline First**
- Cache local de dados críticos
- Sincronização quando online
- Indicador de conexão

---

## 🆚 **ALTERNATIVAS AO REACT NATIVE**

### **Flutter**
- **Vantagens:** Performance superior, UI consistente
- **Desvantagens:** Linguagem Dart (curva de aprendizado)

### **Ionic + Capacitor**
- **Vantagens:** Reutiliza código web Next.js
- **Desvantagens:** Performance inferior para animações

### **PWA (Progressive Web App)**
- **Vantagens:** Zero setup, um código só
- **Desvantagens:** Limitações de recursos nativos

---

## ✅ **RECOMENDAÇÃO FINAL**

### **Para começar:**
1. **Considere PWA primeiro** - Muito mais rápido
2. **Se precisar de app nativo:**
   - Use **Expo + EAS Build**
   - Comece só com **Android** (mais barato)
   - iOS depois de validar mercado

### **ROI (Return on Investment)**
- **PWA:** ROI mais rápido, menos custos
- **React Native:** Melhor experiência, mais custos
- **Decisão:** Depende do seu público-alvo

---

## 📚 **RECURSOS DE APRENDIZADO**

- **React Native Docs:** https://reactnative.dev/
- **Expo Docs:** https://docs.expo.dev/
- **React Navigation:** https://reactnavigation.org/
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **Curso React Native:** https://www.udemy.com/react-native-the-practical-guide/

---

**Conclusão:** É **viável**, mas requer investimento significativo de tempo e dinheiro. Considere começar com PWA para validar o mercado primeiro.
