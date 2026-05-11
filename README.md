# ctrl-alt-me

Hobby job application tracking system

## Development

1. Clone the repo
2. Copy `.env` from `.env.example` and fill in the values
3. Run the setup script:

   ```shell
   bin/setup
   ```

4. Start the dev server:

   ```shell
   bin/dev
   ```

## Testing

```shell
bin/rails test        # unit & integration tests
bin/rails test:system # system tests (headless Chrome)
```

## Linting & Security

```shell
bin/rubocop       # Ruby linting
bin/brakeman      # static security analysis
bin/bundler-audit # dependency vulnerability scan
```

## Deployment

The app is deployed with [Kamal](https://kamal-deploy.org/). Configuration lives in `config/deploy.yml`.

Required environment variables (see `.env`):

| Variable | Description |
| --- | --- |
| `KAMAL_SERVER_IP` | IP address of the deployment server |
| `KAMAL_SERVER_USER` | SSH user on the deployment server |
| `KAMAL_REGISTRY_USERNAME` | Container registry username |
| `KAMAL_REGISTRY_PASSWORD` | Container registry password |
| `RAILS_MASTER_KEY` | Rails master key for credentials |

Deploy with:

```shell
bin/kamal deploy
```

### Database Backup

Back up the production SQLite database from the running container:

```shell
bin/backup-db [output_path]  # default: storage/backup.sqlite3
```

## License

[MIT](LICENSE)
