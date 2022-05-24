import { join } from 'node:path'
import { ShardingManager } from 'discord.js'
import 'dotenv/config'

const manager = new ShardingManager(join(__dirname, './bot.js'), { token: process.env.TOKEN })

manager.on('shardCreate', (shard) => console.log(`Launched shard ${shard.id}`))

manager.spawn()
// TODO add a logger
