#Requires -Version 5.1
# 解压后双击 start.bat / 启动.bat。
# 检查 JDK 17 和 Node.js，缺失时用 winget 安装，再启动后端和前端。
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Frontend = Join-Path $Root 'web'
$Backend = Join-Path $Root 'server'

function Refresh-EnvPath {
  $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
  $user = [Environment]::GetEnvironmentVariable('Path', 'User')
  if ($machine -or $user) {
    $env:Path = "$machine;$user"
  }
}

function Add-Path([string]$Dir) {
  if ($Dir -and (Test-Path -LiteralPath $Dir)) {
    $env:Path = "$Dir;$env:Path"
  }
}

function Get-JavaMajor {
  if (-not (Get-Command java -ErrorAction SilentlyContinue)) { return 0 }
  $out = & java -version 2>&1 | Out-String
  if ($out -match 'version "(?<m>\d+)') { return [int]$Matches.m }
  if ($out -match 'version "1\.(?<m>\d+)') { return [int]$Matches.m }
  return 0
}

function Find-Jdk17 {
  $roots = @(
    'C:\Program Files\Eclipse Adoptium',
    'C:\Program Files\Java',
    'C:\Program Files\Microsoft',
    'C:\Program Files\Amazon Corretto',
    'C:\Program Files\Zulu'
  )
  foreach ($dir in $roots) {
    if (-not (Test-Path -LiteralPath $dir)) { continue }
    $hit = Get-ChildItem -LiteralPath $dir -Directory -ErrorAction SilentlyContinue |
      Where-Object { $_.Name -match 'jdk-?17|17(\.|$)' } |
      Sort-Object Name -Descending |
      Select-Object -First 1
    if ($hit -and (Test-Path -LiteralPath (Join-Path $hit.FullName 'bin\javac.exe'))) {
      return $hit.FullName
    }
  }
  return $null
}

function Install-WithWinget([string]$Id, [string]$Label) {
  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    throw "未找到 winget，无法自动安装 $Label。请手动安装后重新双击启动脚本。"
  }
  Write-Host "正在安装 $Label ..." -ForegroundColor Yellow
  & winget install -e --id $Id --accept-package-agreements --accept-source-agreements --disable-interactivity
  # 0 = 成功，-1978335189 = 已经安装过
  if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne -1978335189) {
    throw "安装 $Label 失败（winget 退出码 $LASTEXITCODE）。请用管理员身份重新运行，或手动安装。"
  }
  Refresh-EnvPath
}

function Ensure-Java {
  Refresh-EnvPath
  $jdk = Find-Jdk17
  if ($jdk) {
    $env:JAVA_HOME = $jdk
    Add-Path (Join-Path $jdk 'bin')
  }
  $major = Get-JavaMajor
  $hasJavac = [bool](Get-Command javac -ErrorAction SilentlyContinue)
  if ($major -ge 17 -and $hasJavac) {
    Write-Host "Java $major 已就绪。" -ForegroundColor Green
    return
  }
  Write-Host "未检测到 JDK 17（当前 Java 主版本：$major）。" -ForegroundColor Yellow
  Install-WithWinget 'EclipseAdoptium.Temurin.17.JDK' 'JDK 17'
  $jdk = Find-Jdk17
  if (-not $jdk) {
    throw 'JDK 17 已安装，但当前窗口还找不到。请关闭窗口后重新双击启动脚本。'
  }
  $env:JAVA_HOME = $jdk
  Add-Path (Join-Path $jdk 'bin')
  Write-Host "Java $(Get-JavaMajor) 已就绪。" -ForegroundColor Green
}

function Ensure-Node {
  Refresh-EnvPath
  Add-Path 'C:\Program Files\nodejs'
  if ((Get-Command node -ErrorAction SilentlyContinue) -and (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "Node $(node -v) 已就绪。" -ForegroundColor Green
    return
  }
  Write-Host '未检测到 Node.js。' -ForegroundColor Yellow
  Install-WithWinget 'OpenJS.NodeJS.LTS' 'Node.js LTS'
  Add-Path 'C:\Program Files\nodejs'
  if (-not (Get-Command node -ErrorAction SilentlyContinue) -or -not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw 'Node.js 已安装，但当前窗口还找不到。请关闭窗口后重新双击启动脚本。'
  }
  Write-Host "Node $(node -v) 已就绪。" -ForegroundColor Green
}

function Ensure-FrontendDeps {
  $modules = Join-Path $Frontend 'node_modules'
  $vite = Join-Path $modules 'vite\package.json'
  if (Test-Path -LiteralPath $vite) {
    Write-Host '前端依赖已存在。' -ForegroundColor Green
    return
  }
  Write-Host '正在安装前端依赖 (npm install)...' -ForegroundColor Yellow
  Push-Location -LiteralPath $Frontend
  try {
    npm install
    if ($LASTEXITCODE -ne 0) {
      Write-Host 'npm install 失败，正在清理后重试...' -ForegroundColor Yellow
      if (Test-Path -LiteralPath $modules) {
        Remove-Item -LiteralPath $modules -Recurse -Force
      }
      npm install
      if ($LASTEXITCODE -ne 0) { throw 'npm install 失败。请检查网络后重新运行。' }
    }
  } finally {
    Pop-Location
  }
}

function Warn-IfPortBusy([int]$Port, [string]$Name) {
  $busy = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  if ($busy) {
    Write-Host "端口 $Port 已被占用（$Name）。如果启动失败，请先关掉占用该端口的程序。" -ForegroundColor Yellow
  }
}

if (-not (Test-Path -LiteralPath (Join-Path $Backend 'mvnw.cmd'))) {
  throw "找不到后端：$Backend"
}
if (-not (Test-Path -LiteralPath (Join-Path $Frontend 'package.json'))) {
  throw "找不到前端：$Frontend"
}

Write-Host '检查运行环境...' -ForegroundColor Cyan
Ensure-Java
Ensure-Node
Ensure-FrontendDeps
Warn-IfPortBusy 8080 '后端'
Warn-IfPortBusy 5173 '前端'

function Start-DevWindow([string]$WorkDir, [string]$Command) {
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = 'powershell.exe'
  $psi.WorkingDirectory = $WorkDir
  $psi.Arguments = "-NoExit -NoProfile -ExecutionPolicy Bypass -Command $Command"
  # false：子窗口继承本脚本刚装好的 JAVA_HOME / PATH
  $psi.UseShellExecute = $false
  [void][System.Diagnostics.Process]::Start($psi)
}

Write-Host '启动后端 :8080 ...' -ForegroundColor Cyan
Start-DevWindow $Backend '".\mvnw.cmd spring-boot:run"'

Write-Host '等待后端就绪...' -ForegroundColor Yellow
$ready = $false
for ($i = 1; $i -le 90; $i++) {
  try {
    $res = Invoke-WebRequest -Uri 'http://127.0.0.1:8080/api/meta/categories' -UseBasicParsing -TimeoutSec 2
    if ($res.StatusCode -ge 200 -and $res.StatusCode -lt 500) {
      $ready = $true
      break
    }
  } catch {}
  Start-Sleep -Seconds 2
  if ($i % 5 -eq 0) { Write-Host ("  已等待 {0} 秒（首次会下载 Maven 依赖，可能更久）" -f ($i * 2)) }
}
if (-not $ready) {
  Write-Host '后端还没响应。前端仍会启动；页面打不开时请看后端窗口里的报错，稍后刷新。' -ForegroundColor Yellow
} else {
  Write-Host '后端已就绪。' -ForegroundColor Green
}

Write-Host '启动前端 :5173 ...' -ForegroundColor Cyan
Start-DevWindow $Frontend '"npm run dev"'

Start-Sleep -Seconds 2
Start-Process 'http://localhost:5173/'

Write-Host ''
Write-Host '已启动：' -ForegroundColor Green
Write-Host '  前端  http://localhost:5173/'
Write-Host '  后端  http://localhost:8080'
Write-Host '  账号  admin / password123'
Write-Host ''
Write-Host '关闭标题为 Forum Backend / Forum Frontend 的窗口即可停止。'
Write-Host '按任意键关闭本窗口...'
try { $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown') } catch {}
