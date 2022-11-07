import { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../lib/authenticate";
import { prisma } from "../lib/prisma";

export async function guessRoute(fastify: FastifyInstance){
    fastify.get('/guesses/count', async () => {
        const count = await prisma.guess.count()

        return {count}
    })

    fastify.post('/pools/:poolId/game/:gameId/guesses', {
        onRequest: [authenticate]
    }, async (request, reply) => {
        const createGuessParams = z.object({
            poolId: z.string(),
            gameId: z.string(),
        })

        const createGuessBody = z.object({
            firstTeamPoints: z.number(),
            secondTeamPoints: z.number(),
        })

        const {poolId, gameId} = createGuessParams.parse(request.params)
        const {firstTeamPoints, secondTeamPoints} = createGuessBody.parse(request.body)

        const participant = await prisma.participant.findUnique({
            where: {
                userId_poolId: {
                    poolId,
                    userId: request.user.sub,
                }
            }
        })

        if (!participant) {
            return reply.status(400).send({
                message: 'Você não possui permissão para dar um palpite nesse bolão.'
            })
        }

        const guess = await prisma.guess.findUnique({
            where: {
                participantId_gameId: {
                    participantId: participant.id,
                    gameId
                }                
            }
        })

        if (guess) {
            return reply.status(400).send({
                message: 'Você já criou um palpite para essa partida nesse bolão.'
            })
        }
        
        const game = await prisma.game.findUnique({
            where: {
                id: gameId,
            }
        })

        if (!game) {
            return reply.status(400).send({
                message: 'Partida não encontrada.'
            })
        }

        if (game.date < new Date()){
            return reply.status(400).send({
                message: 'Não é possível registrar palpites após a partida.'
            })
        }

        await prisma.guess.create({
            data: {
                gameId,
                participantId: participant.id,
                firstTeamPoints,
                secondTeamPoints,
            }
        })

        return reply.status(201).send()
    })
}