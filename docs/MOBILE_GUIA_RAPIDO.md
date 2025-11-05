# 📱 Guia Rápido: Padrões Mobile - VRB ERP

## 🎯 Como criar uma nova página responsiva

Este guia mostra como aplicar os padrões mobile em novas páginas do sistema.

---

## 🏗️ Template Base

```tsx
'use client';

export default function MinhaNovaPage() {
  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Título da Página</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Descrição da página
        </p>
      </div>

      {/* Conteúdo */}
      {/* Use os padrões abaixo */}
    </div>
  );
}
```

---

## 📊 KPI Cards

```tsx
<div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2">
      <CardTitle className="text-xs sm:text-sm font-medium">
        Total
      </CardTitle>
      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
    </CardHeader>
    <CardContent>
      <div className="text-xl sm:text-2xl font-bold">1,234</div>
      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
        +12% este mês
      </p>
    </CardContent>
  </Card>
</div>
```

---

## 🔘 Botões de Ação

### Botão Principal (Full Width Mobile)

```tsx
<Button 
  onClick={handleAction} 
  className="w-full sm:w-auto h-11 sm:h-12"
>
  <Icon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
  Ação Principal
</Button>
```

### Botões Secundários (Grid Mobile)

```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
  <Button variant="outline" size="sm" className="px-3">
    <Download className="h-4 w-4 sm:mr-2" />
    <span className="hidden sm:inline">CSV</span>
  </Button>
  
  <Button variant="outline" size="sm" className="px-3">
    <FileText className="h-4 w-4 sm:mr-2" />
    <span className="hidden sm:inline">Excel</span>
  </Button>
  
  <Button variant="outline" size="sm" className="px-3">
    <Filter className="h-4 w-4 sm:mr-2" />
    <span className="hidden sm:inline">Filtros</span>
  </Button>
</div>
```

### Grupo de Botões (Stack Mobile)

```tsx
<div className="flex flex-col sm:flex-row gap-2">
  <Button className="w-full sm:w-auto">
    <Plus className="mr-2 h-4 w-4" />
    Novo Item
  </Button>
  
  <div className="grid grid-cols-2 gap-2 sm:flex">
    <Button variant="outline" size="sm">Exportar</Button>
    <Button variant="outline" size="sm">Filtrar</Button>
  </div>
</div>
```

---

## 📝 Formulários

```tsx
<div className="space-y-3 sm:space-y-4">
  {/* Input básico */}
  <div className="space-y-1.5 sm:space-y-2">
    <Label className="text-xs sm:text-sm">Nome *</Label>
    <Input 
      placeholder="Digite o nome"
      className="h-9 sm:h-10 text-sm"
    />
  </div>

  {/* Select */}
  <div className="space-y-1.5 sm:space-y-2">
    <Label className="text-xs sm:text-sm">Categoria</Label>
    <Select>
      <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
        <SelectValue placeholder="Selecione" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">Opção 1</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* Grid de inputs (2 colunas mobile) */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
    <div className="space-y-1.5">
      <Label className="text-xs sm:text-sm">Campo 1</Label>
      <Input className="h-9 sm:h-10" />
    </div>
    <div className="space-y-1.5">
      <Label className="text-xs sm:text-sm">Campo 2</Label>
      <Input className="h-9 sm:h-10" />
    </div>
  </div>
</div>
```

---

## 🎯 Filtros

```tsx
<Card className="p-3 sm:p-4">
  <div className="flex items-center justify-between mb-3 sm:mb-4">
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
      <h2 className="text-sm sm:text-base font-semibold">Filtros</h2>
    </div>
    {hasFilters && (
      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 sm:px-4">
        <X className="h-3.5 w-3.5 sm:mr-2" />
        <span className="hidden sm:inline">Limpar</span>
      </Button>
    )}
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
    {/* Campos de filtro */}
  </div>
</Card>
```

---

## 📋 Listas e Cards

### Grid de Cards

```tsx
<div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {items.map((item) => (
    <Card key={item.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-sm sm:text-base truncate">
          {item.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
          {item.description}
        </p>
      </CardContent>
    </Card>
  ))}
</div>
```

### Lista com Stack Vertical Mobile

```tsx
<div className="space-y-2 sm:space-y-3">
  {items.map((item) => (
    <div 
      key={item.id}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 p-3 border rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
    >
      <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-0.5 sm:mt-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm sm:text-base truncate">
            {item.title}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            {item.subtitle}
          </p>
        </div>
      </div>
      <Badge className="text-xs self-start sm:self-center">
        {item.status}
      </Badge>
    </div>
  ))}
</div>
```

---

## 💬 Modais e Dialogs

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="w-[95vw] sm:w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="text-lg sm:text-xl">
        Título do Modal
      </DialogTitle>
      <DialogDescription className="text-xs sm:text-sm">
        Descrição opcional do modal
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-3 sm:space-y-4">
      {/* Conteúdo do modal */}
    </div>

    <DialogFooter className="flex-col sm:flex-row gap-2">
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(false)}
        className="w-full sm:w-auto"
      >
        Cancelar
      </Button>
      <Button 
        onClick={handleSubmit}
        className="w-full sm:w-auto"
      >
        Confirmar
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## 📊 Tabelas Responsivas

```tsx
{/* Mobile: Cards empilhados */}
<div className="block md:hidden space-y-2">
  {items.map((item) => (
    <Card key={item.id} className="p-3">
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">Nome:</span>
          <span className="text-sm font-medium">{item.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">Status:</span>
          <Badge className="text-xs">{item.status}</Badge>
        </div>
        {/* Mais campos */}
      </div>
    </Card>
  ))}
</div>

{/* Desktop: Tabela tradicional */}
<div className="hidden md:block overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr>
        <th className="text-left p-2 text-sm">Nome</th>
        <th className="text-left p-2 text-sm">Status</th>
        {/* Mais colunas */}
      </tr>
    </thead>
    <tbody>
      {items.map((item) => (
        <tr key={item.id} className="border-t hover:bg-gray-50">
          <td className="p-2 text-sm">{item.name}</td>
          <td className="p-2 text-sm">{item.status}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

## 🎨 Loading States

```tsx
{isLoading && (
  <div className="flex items-center justify-center py-8 sm:py-12">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-3 sm:mb-4"></div>
      <p className="text-xs sm:text-sm text-muted-foreground">
        Carregando...
      </p>
    </div>
  </div>
)}
```

---

## 🚫 Empty States

```tsx
{items.length === 0 && (
  <div className="text-center py-8 sm:py-12 text-muted-foreground">
    <Icon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-50" />
    <p className="text-sm sm:text-base font-medium">Nenhum item encontrado</p>
    <p className="text-xs sm:text-sm mt-1">
      Clique em "Novo Item" para começar
    </p>
  </div>
)}
```

---

## 🎯 Checklist para Nova Página

Antes de finalizar, verifique:

- [ ] Container tem `pb-20 lg:pb-6` (clearance para bottom nav)
- [ ] Header com `text-2xl sm:text-3xl`
- [ ] Espaçamentos progressivos (`space-y-4 sm:space-y-6`)
- [ ] Botões principais com `w-full sm:w-auto`
- [ ] Inputs com altura `h-9 sm:h-10`
- [ ] Ícones com `flex-shrink-0`
- [ ] Textos longos com `truncate` ou `line-clamp-2`
- [ ] Modais com `w-[95vw] sm:w-full`
- [ ] Touch targets ≥ 44px altura
- [ ] Sem scroll horizontal no mobile
- [ ] Testado no iPhone SE (375px)

---

## 🧪 Como Testar

```bash
# 1. Abra Chrome DevTools (F12)
# 2. Toggle Device Toolbar (Ctrl+Shift+M)
# 3. Selecione "iPhone SE"
# 4. Teste a nova página

# Breakpoints para testar:
- 375px  (iPhone SE - menor)
- 640px  (sm breakpoint)
- 768px  (md breakpoint - tablet)
- 1024px (lg breakpoint - laptop)
- 1280px (xl breakpoint - desktop)
```

---

## 📚 Referências

- **Tailwind Docs:** https://tailwindcss.com/docs/responsive-design
- **Documentação completa:** `docs/MOBILE_RESPONSIVO.md`
- **Exemplos reais:** Veja as páginas em `frontend/app/dashboard/`

---

**Última atualização:** 15/01/2025  
**Versão:** 1.0.0
