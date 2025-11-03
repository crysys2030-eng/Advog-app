# Deploy na Vercel - LegalAI Admin Helper

## Pré-requisitos

1. Conta na Vercel (https://vercel.com)
2. Projeto configurado no GitHub (opcional, mas recomendado)

## Passos para Deploy

### Opção 1: Deploy via GitHub (Recomendado)

1. **Crie um repositório no GitHub**
   - Vá para https://github.com/new
   - Crie um novo repositório para o projeto

2. **Faça push do código**
   ```bash
   git init
   git add .
   git commit -m "Preparar para deploy"
   git branch -M main
   git remote add origin https://github.com/seu-usuario/seu-repositorio.git
   git push -u origin main
   ```

3. **Conecte com a Vercel**
   - Vá para https://vercel.com/new
   - Clique em "Import Project"
   - Selecione seu repositório do GitHub
   - A Vercel detectará automaticamente as configurações do `vercel.json`

4. **Configure as variáveis de ambiente (se necessário)**
   - No dashboard da Vercel, vá em Settings > Environment Variables
   - Adicione qualquer variável necessária

5. **Deploy**
   - Clique em "Deploy"
   - A Vercel fará o build e deploy automaticamente

### Opção 2: Deploy via Vercel CLI

1. **Instale a Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Faça login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Siga as instruções no terminal
   - Confirme as configurações
   - O primeiro deploy será um preview

4. **Deploy para produção**
   ```bash
   vercel --prod
   ```

## Configurações do Projeto

O projeto está configurado com:

- **Build Command**: `npx expo export -p web`
- **Output Directory**: `dist`
- **Framework**: Expo (React Native Web)

## URLs Após Deploy

Após o deploy, você receberá:
- **Preview URL**: Para testes (cada commit gera um preview)
- **Production URL**: URL principal do projeto (exemplo: seu-projeto.vercel.app)

## Domínio Customizado

Para adicionar um domínio personalizado:

1. Vá para Settings > Domains no dashboard da Vercel
2. Adicione seu domínio
3. Configure os DNS conforme instruções

## Troubleshooting

### Build falha

Se o build falhar, verifique:
- Todas as dependências estão no `package.json`
- Não há erros de TypeScript no código
- Os arquivos de assets existem

### App não carrega

- Verifique o console do navegador para erros
- Certifique-se que todas as rotas estão configuradas corretamente
- Verifique se o AsyncStorage está funcionando no navegador

### Performance

Para melhorar a performance:
- Otimize imagens
- Use lazy loading quando possível
- Minimize o bundle size

## Atualizações Automáticas

Com GitHub conectado:
- Todo push para a branch `main` faz deploy automático em produção
- Todo pull request gera um preview único
- Rollback fácil para versões anteriores

## Monitoramento

A Vercel oferece:
- Analytics integrado
- Logs de build e runtime
- Métricas de performance
- Error tracking

## Suporte

Para mais informações:
- Documentação Vercel: https://vercel.com/docs
- Documentação Expo: https://docs.expo.dev
