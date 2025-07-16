# ctrl-alt-me

Hobby job application tracking system.

## Purpose

This application has been built as a hobby project to run on a Raspberry Pi and be accessed from other machines on the local network.

## Deployment

1. Clone the repo
1. Create a `.env.` file (see `.env.example` for more information)
1. Deploy the application

   - Using `docker-compose`

      ```shell
      docker-compose --env-file <path_to_env_file> up [-d]
      ```

## Development

1. Clone the repo
1. Create a `.env.` file (see `.env.example` for more information)
1. Run the application in `dev` mode using `make run-dev`
   - This will run both the frontend and backend services
