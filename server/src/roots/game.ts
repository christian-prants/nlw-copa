import { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../lib/authenticate";
import { prisma } from "../lib/prisma";

export async function gameRoute(fastify: FastifyInstance){
    fastify.get('/pools/:id/game', {
        onRequest: [authenticate],
    }, async (request) => {
        const getPoolParams = z.object({
            id: z.string(),
        })

        const { id } = getPoolParams.parse(request.params)

        const games = await prisma.game.findMany({
            orderBy: {
                date: 'desc',
            },
            include: {
                guesses: {
                    where: {
                        participant: {
                            userId: request.user.sub,
                            poolId: id,
                        }
                    }
                }
            }
        })

        return {
            games: games.map(game => {
                return {
                    ...game,
                    guess: game.guesses.length > 0 ? game.guesses[0] : null,
                    guesses: undefined,
                }
            })
        }
    })
}