1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Production (systemd)

This repo includes `systemd` unit templates and scripts under `ops/` to:
- start the app automatically on boot
- restart automatically if it crashes (`Restart=always`)
- monitor and restart if it is found stopped (`thegame-monitor.timer`)

### Install/enable services (system-wide)

```bash
cd /home/dev/thegame
chmod +x ops/scripts/*.sh
./ops/scripts/install-systemd.sh
```

### Install/enable services (user-mode, no sudo)

If you don't have `sudo` access, you can run the services as a user unit:

```bash
cd /home/dev/thegame
chmod +x ops/scripts/*.sh
./ops/scripts/install-systemd-user.sh
```

This uses:
- unit files in `ops/systemd-user/`
- env file at `~/.config/thegame/thegame.env`

### Configure environment

Put required variables in:
- `/etc/thegame/thegame.env`

Add any required environment variables there (optional).

### Restart server (apply updates)

This rebuilds and restarts all services (useful after pulling updates):

```bash
cd /home/dev/thegame
chmod +x ops/scripts/restart-server.sh
./ops/scripts/restart-server.sh
```

User-mode restart:

```bash
cd /home/dev/thegame
chmod +x ops/scripts/restart-server-user.sh
./ops/scripts/restart-server-user.sh
```

## Troubleshooting: `/index.css` MIME `text/html`

Se o navegador mostrar:
"A folha de estilo https://.../index.css não foi carregada porque seu tipo MIME, 'text/html', não é 'text/css'",
isso quase sempre significa que o *reverse proxy/CDN* está devolvendo o `index.html` (fallback SPA) para a rota `/index.css`.

O projeto já inclui um fallback em `public/index.css` (gera `dist/index.css`). Verifique no servidor:

- `curl -I https://app.thegamebrasil.com.br/index.css` (deve retornar `Content-Type: text/css`)
- confirme que `dist/index.css` existe e está sendo servido/publicado

Se você usa Nginx na frente, veja o exemplo em `ops/nginx/app.thegamebrasil.com.br.conf`.
