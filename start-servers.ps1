# Script para iniciar Backend e Frontend do My ERP
# Execute este arquivo: .\start-servers.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🚀 MY ERP - Iniciando Servidores" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Caminho do Python (pyenv)
$pythonPath = "C:\Users\carol\.pyenv\pyenv-win\versions\3.11.5\python.exe"
$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"

# Verificar se os diretórios existem
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Erro: Pasta backend não encontrada!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Erro: Pasta frontend não encontrada!" -ForegroundColor Red
    exit 1
}

# Verificar Python
if (-not (Test-Path $pythonPath)) {
    Write-Host "❌ Erro: Python não encontrado em: $pythonPath" -ForegroundColor Red
    Write-Host "   Verifique se o pyenv está instalado corretamente" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Python encontrado: $pythonPath" -ForegroundColor Green
Write-Host ""

# Iniciar Backend Django em nova janela
Write-Host "📦 Iniciando Backend Django..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$backendPath'; Write-Host '🟢 Backend Django' -ForegroundColor Green; Write-Host 'Rodando em: http://127.0.0.1:8000/' -ForegroundColor Cyan; Write-Host ''; & '$pythonPath' manage.py runserver"
)

Write-Host "✅ Backend iniciado em nova janela" -ForegroundColor Green
Write-Host ""

# Aguardar 2 segundos
Start-Sleep -Seconds 2

# Iniciar Frontend Next.js em nova janela
Write-Host "⚛️  Iniciando Frontend Next.js..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$frontendPath'; Write-Host '🟢 Frontend Next.js' -ForegroundColor Green; Write-Host 'Rodando em: http://localhost:3000 ou 3002' -ForegroundColor Cyan; Write-Host ''; npm run dev"
)

Write-Host "✅ Frontend iniciado em nova janela" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Servidores Iniciados!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Backend:  http://127.0.0.1:8000/" -ForegroundColor Cyan
Write-Host "📌 Frontend: http://localhost:3000/ (ou 3002)" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔐 Login:" -ForegroundColor Magenta
Write-Host "   Email: joao@barbearia.com" -ForegroundColor White
Write-Host "   Senha: senha123" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Para parar: Feche as 2 janelas do PowerShell" -ForegroundColor Yellow
Write-Host ""
