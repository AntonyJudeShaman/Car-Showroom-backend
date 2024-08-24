# Car Showroom Application

### This project uses pnpm as package manager

#### To install pnpm globally, run the following command:

```bash
npm install -g pnpm
```

#### To install the dependencies, run the following command:

```bash
pnpm i
```

#### Copy the `.env.example` file to `.env.local` and set the environment variables.

```bash
cp .env.example .env.local
```

#### To start the development server, run the following command:

```bash
pnpm dev
```

```bash
# docker commands to build and run the application

# using docker-compose for development
docker-compose up --build

# using docker for production
docker build --target production -t car-showroom-app:prod .

docker run --env-file .env.local -p 3000:3000 car-showroom-app:prod

```

> [!WARNING]
>
> Docker Desktop must be installed on the machine to run the application using Docker.  
> Get Docker Desktop from [here](https://docs.docker.com/desktop/install/windows-install/) for windows and [here](https://docs.docker.com/desktop/install/linux-install/) for linux.

> [!NOTE]
>
> The application will be available at http://localhost:3000
