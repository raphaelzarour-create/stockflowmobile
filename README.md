# StockFlow Mobile

Aplicativo mobile para controle de estoque e eventos da empresa parceira 4K Leds e Eventos.

## Objetivo

O StockFlow ajuda colaboradores a cadastrar equipamentos, consultar disponibilidade, movimentar estoque e reservar itens para eventos usando apenas o celular.

O foco do projeto é mobile-first: telas simples, botões grandes, formulários curtos, cards em vez de tabelas e navegação por abas inferiores.

## Problema Resolvido

A empresa realiza eventos com materiais de iluminação, painéis de LED, cabos, estruturas, som e acessórios. Parte do controle era manual ou informal, o que dificultava saber rapidamente quais itens estavam disponíveis, em uso, em manutenção ou reservados para eventos.

## Público-Alvo

- Colaboradores operacionais da 4K Leds e Eventos.
- Gestores que acompanham estoque e agenda de eventos.
- Usuários com pouca familiaridade com sistemas complexos.

## Tecnologias

- Expo SDK 56
- React Native 0.85
- React 19
- TypeScript
- Expo Router
- Expo SQLite
- Jest com jest-expo

## Como Instalar

```bash
npm install
```

## Como Rodar

Iniciar o Metro/Expo:

```bash
npm start
```

Rodar no Android:

```bash
npm run android
```

Rodar no navegador apenas para inspeção visual:

```bash
npm run web
```

Para uso real, a prioridade é Android/Expo Go, não dashboard web.

## Como rodar no emulador Android

Esta etapa valida o StockFlow como aplicativo mobile real em uma tela Android, não apenas no navegador.

### 1. Conferir o projeto Expo

No PowerShell, dentro da pasta do projeto:

```powershell
node -v
npm -v
npx expo --version
npm install
npx expo install --check
npm run typecheck
npm test
```

O projeto usa Expo SDK 56, Expo Router, Expo SQLite, React Native e TypeScript.

### 2. Instalar Android Studio no Windows

Baixe e instale pelo site oficial:

```text
https://developer.android.com/studio
```

No instalador, mantenha selecionados:

- Android Studio
- Android Virtual Device

Ao abrir pela primeira vez, use o Setup Wizard em modo Standard e aceite as licencas.

Opcionalmente, se preferir usar winget:

```powershell
winget install --id Google.AndroidStudio -e --source winget --accept-source-agreements --accept-package-agreements
```

### 3. Instalar componentes do SDK

No Android Studio:

1. Abra `More Actions > SDK Manager`.
2. Em `SDK Platforms`, instale uma plataforma Android estavel. Para Expo SDK 56, use Android API 36 se estiver disponivel; Android API 35 tambem funciona para desenvolvimento local.
3. Em `SDK Tools`, marque:
   - Android SDK Build-Tools
   - Android Emulator
   - Android SDK Platform-Tools
   - Android SDK Command-line Tools
4. Clique em `Apply` e aceite as licencas.

O SDK costuma ficar em:

```text
%LOCALAPPDATA%\Android\Sdk
```

### 4. Configurar variaveis de ambiente

Abra um PowerShell novo depois da instalacao e confira:

```powershell
$env:ANDROID_HOME
where.exe adb
where.exe emulator
```

Se estiver faltando, configure:

```powershell
$SdkPath = "$env:LOCALAPPDATA\Android\Sdk"
setx ANDROID_HOME "$SdkPath"
setx ANDROID_SDK_ROOT "$SdkPath"

$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
$Additions = "$SdkPath\platform-tools;$SdkPath\emulator"
if ($UserPath -notlike "*$SdkPath\platform-tools*") {
  [Environment]::SetEnvironmentVariable("Path", "$UserPath;$Additions", "User")
}
```

Feche e abra o PowerShell novamente. Depois valide:

```powershell
adb --version
emulator -version
```

### 5. Criar um Android Virtual Device

No Android Studio:

1. Abra `More Actions > Virtual Device Manager`.
2. Clique em `Create Device`.
3. Escolha um aparelho da linha Pixel. Recomendado para este projeto:
   - Pixel 5 para emulador mais leve.
   - Pixel 6 ou Pixel 7 se a maquina tiver mais memoria.
4. Escolha uma imagem estavel com Google APIs ou Google Play.
   - Recomendado: API 35 ou API 36 x86_64.
5. Clique em `Finish`.
6. Na lista de dispositivos, clique no botao Play para abrir o emulador.

Se o emulador ficar muito lento, reduza a resolucao do AVD ou use Pixel 5.

### 6. Rodar o StockFlow no Android

Com o emulador aberto e desbloqueado:

```powershell
adb devices
npx expo start
```

Na tela do Expo, pressione `a` para abrir no Android.

Ou execute diretamente:

```powershell
npx expo start --android
```

Se o emulador nao abrir automaticamente, abra manualmente pelo Android Studio em `More Actions > Virtual Device Manager > Play` e rode novamente:

```powershell
npx expo start --android
```

### 7. Diagnostico rapido de erros

- `adb nao reconhecido`: revise `ANDROID_HOME` e adicione `%LOCALAPPDATA%\Android\Sdk\platform-tools` ao `Path`.
- `emulator nao reconhecido`: adicione `%LOCALAPPDATA%\Android\Sdk\emulator` ao `Path`.
- `No Android connected device found`: abra o AVD manualmente e rode `adb devices`.
- Emulador lento ou nao inicia: confirme virtualizacao habilitada na BIOS/UEFI e feche apps pesados.
- Erro de dependencias Expo: rode `npx expo install --check`.
- Metro travado: feche o terminal e rode `npx expo start -c`.

## Como Testar

TypeScript:

```bash
npm run typecheck
```

Testes automatizados:

```bash
npm test
```

## Funcionalidades

- Dashboard com resumo do estoque, itens disponíveis, itens em uso, eventos ativos e alertas.
- Cadastro, edição e exclusão de itens de estoque.
- Filtro de itens por busca, categoria e status.
- Movimentações de entrada, saída, devolução, manutenção e item danificado.
- Cadastro, edição e exclusão de eventos.
- Associação de itens disponíveis a eventos.
- Redução automática da disponibilidade ao reservar item para evento.
- Devolução automática de itens ao finalizar evento.
- Histórico de movimentações.
- Tela de informações do projeto e da empresa parceira.

## Estrutura de Pastas

```text
src/
  app/              Rotas do Expo Router
  components/       Componentes reutilizáveis
  constants/        Tema, labels e opções
  hooks/            Controlador de estado do app
  navigation/       Definição das abas principais
  screens/          Telas mobile-first
  services/         Regras de negócio
  storage/          SQLite e repositório local
  tests/            Testes automatizados
  types/            Tipos de domínio
  utils/            Formatadores e utilitários
```

## Decisões Técnicas

SQLite foi escolhido para a primeira versão porque os dados possuem relacionamento claro entre itens, eventos, vínculos e movimentações. Isso evita estruturas soltas em armazenamento chave-valor e facilita uma futura migração para Supabase ou Firebase.

A lógica de negócio fica em `src/services`, a persistência em `src/storage` e as telas usam o hook `useStockFlow`. Assim, a interface não mistura regras de estoque diretamente nos componentes visuais.

## Próximas Melhorias

- Autenticação por perfil de usuário.
- Sincronização em nuvem com Supabase ou Firebase.
- Exportação de relatórios em PDF.
- Scanner de QR Code para identificar equipamentos.
- Fotos dos itens.
- Permissões por cargo.
