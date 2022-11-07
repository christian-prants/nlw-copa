import Fastify from "fastify";
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';

import { poolRoute } from "./roots/pool";
import { authRoute } from "./roots/auth";
import { gameRoute } from "./roots/game";
import { userRoute } from "./roots/user";
import { guessRoute } from "./roots/guess";

async function start() {
    const fastify = Fastify({
        logger: true,
    })

    await fastify.register(cors, {origin: true,})

    await fastify.register(jwt, {
        secret: 'copa',
    })

    await fastify.register(poolRoute);
    await fastify.register(authRoute);
    await fastify.register(gameRoute);
    await fastify.register(guessRoute);
    await fastify.register(userRoute);

    await fastify.listen({port: 3333, host: '0.0.0.0'})
}

start()