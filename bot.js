
//ESM
import { createRequire } from 'module';
const require = createRequire(import.meta.url);


//CJS
const Eris = require("eris");
const axios = require('axios');
const MessageEmbed = require("davie-eris-embed");
const { QuickDB } = require("quick.db");
const db = new QuickDB({ filePath: "db.sqlite" });

const emoji = {
	pokedollar: '<:pokedollar:1012763697829122068>'
}


const bot = new Eris.CommandClient("Bot TOKEN", {}, {
    description: "Pokemon",
    owner: "DatGamerAgainYT#0466",
    prefix: "p>"
});

bot.on("ready", () => {
    console.log("Ditto is online.");
		bot.editStatus('dnd',{
		type: 3,
		name: `Pokemon Master Journeys.`
	});
});

bot.on("error", (err) => {
    console.error(err);
});


bot.on("messageCreate", async (msg) => {
	const UID = msg.author.id;
	
	const guild = msg.channel.guild;
	if(msg.author.bot) return;
	
	// Create data for new Users
	if (!await db.get(`${UID}`)) {
		await db.set(`${UID}`, {
			inventory: [],
			pokedollars: 0,
			pokemon: [],
			battlestats: {},
			pokedex: {}
		});
	};
	if(msg.content.toLowerCase() === 'go pokeball'){
		if(!await db.get(`$[guild.id}.currentpoke`)) 
			return msg.channel.createMessage(new MessageEmbed().setColor('#ff0000').setTitle(`There is no pokemon to catch currently.`).setFooter("Type 'p>help' for more commands.").create).catch(err => console.error(err));
		const NAME = await db.get(`$[guild.id}.currentpoke`);
		const IVS = {
				Atk: Math.floor(Math.random() * 32),
				SpAtk: Math.floor(Math.random() * 32),
				Def: Math.floor(Math.random() * 32),
				SpDef: Math.floor(Math.random() * 32),
				Speed: Math.floor(Math.random() * 32)
			};
		const LEVEL = Math.floor(Math.random() * 51);
			
		await db.push(`${UID}.pokemon`, {
			name: NAME,
			ivs: IVS,
			level: LEVEL,
			exp: 0
		});
		
		await db.set(`$[guild.id}.currentpoke`, '');
		
		const embed = new MessageEmbed()
		.setColor('#00FF00.')
		.setAuthor(`Level ${LEVEL} ${NAME} was caught!`)
		.setTimestamp();
		msg.channel.createMessage(embed.create).catch(err => console.error(err))
	}
	if(Math.floor(Math.random() * 40) + 1 === 1) { 
		const poke = Math.floor(Math.random() * 807) + 1;
		const config = {
        method: 'get',
        url: `https://pokeapi.glitch.me/v1/pokemon/${poke}/`
		}
		axios(config).then(function (res) {
			const embed = new MessageEmbed()
			.setColor('#0099ff')
			.setAuthor(`A wild ${res.data[0].name} appeared!`)
			.setThumbnail(res.data[0].sprite)
			.setTimestamp()
			.setFooter(`Type 'go pokeball' to catch ${res.data[0].name}!`);
			msg.channel.createMessage(embed.create).catch(err => console.error(err))
			
			db.set(`$[guild.id}`, {
				currentpoke: res.data[0].name
			})
		})
		
	}
})

bot.registerCommand("pokemon", async (msg, args) => {
	let pokeString = '';
	const pokeVar = await db.get(`${msg.author.id}.pokemon`);
	if(pokeVar.length === 0)
		return msg.channel.createMessage(new MessageEmbed().setColor('#ff0000').setTitle(`You don't have any pokemon.`).setFooter("Type 'p>help' for more commands.").create).catch(err => console.error(err));
	for (let i = 0; i < pokeVar.length; i++){
		pokeString += `\n${i+1} - ${pokeVar[i].name} (Level ${pokeVar[i].level})`
	}
	const embed = new MessageEmbed()
		.setColor('#0099ff')
		.setAuthor(`${msg.author.username}'s Pokemon`)
		.setThumbnail(`https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`)
		.setDescription(`${pokeString}`)
		.setFooter("Type 'p>help' for more commands.");
	msg.channel.createMessage(embed.create);
}, {
    description: "",
    fullDescription: ""
});


bot.registerCommand("random", (msg, args) => {
	const poke = Math.floor(Math.random() * 807) + 1;
    const config = {
        method: 'get',
        url: `https://pokeapi.glitch.me/v1/pokemon/${poke}/`
    }
    axios(config).then(function (res) {
		const embed = new MessageEmbed()
		.setColor('#0099ff')
		.setAuthor(`${res.data[0].name} (#${poke < 10 ? '0':''}${poke < 100 ? '0':''}${poke})`)
		.setThumbnail(res.data[0].sprite)
		.setTitle(`${res.data[0].species} Pokemon`)
		.addField('Types:', `${res.data[0].types[0]}, ${res.data[0].types[1] || 'None'}\n\n*${res.data[0].description}*`, true)
		.setTimestamp()
		.setDescription(`Height: ${res.data[0].height}\nWeight: ${res.data[0].weight}`)
		.setFooter("Type 'p>help' for more commands.");
		msg.channel.createMessage(embed.create).catch(err => console.error(err))
    })

}, {
    description: "Get a random Pokemon's info.",
    fullDescription: "Get a random Pokemon's pokedex info."
});

bot.registerCommand("pokedex", (msg, args) => {
	if(!args) return msg.channel.createMessage('No arguments specified.').catch(err => console.error(err));
    const config = {
        method: 'get',
        url: `https://pokeapi.glitch.me/v1/pokemon/${args.join('%20')}/`
    }
    axios(config).then(function (res) {
		const poke = res.data[0].number;
		const embed = new MessageEmbed()
		.setColor('#0099ff')
		.setAuthor(`${res.data[0].name} (#${poke < 10 ? '0':''}${poke < 100 ? '0':''}${poke})`)
		.setThumbnail(res.data[0].sprite)
		.setTitle(`${res.data[0].species} Pokemon`)
		.addField('Types:', `${res.data[0].types[0]}, ${res.data[0].types[1] || 'None'}\n\n*${res.data[0].description}*`, true)
		.setTimestamp()
		.setDescription(`Height: ${res.data[0].height}\nWeight: ${res.data[0].weight}`)
		.setFooter("Type 'p>help' for more commands.");
		msg.channel.createMessage(embed.create).catch(err => console.log(err));
    }).catch(err =>
		msg.channel.createMessage(new MessageEmbed().setColor('#ff0000').setTitle(`Pokemon not found.`).setFooter("Type 'p>help' for more commands.").create).catch(err => console.error(err))
	);
},
{
    description: "Look up a Pokemon's info.",
    fullDescription: "Look up a Pokemon's pokedex info.",
	usage: '<name/id>'
});

bot.connect();