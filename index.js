import dotenv from 'dotenv'
dotenv.config() 
/*
    1. Login into user (optional) 
    2. if user is not logged in user could just keep track of which items are in stock 
        The only feature that would be ommitted is the add to cart feature, which the user would 
        have to be logged in for 
    (user will be seperate for everyone)
    3. function ideas 
        - function to log into user pop mart profile (optional feature for user) 
            a. Libraries used
                -puppeteer 

        - function to display items to user (out of stock & in stock display)
        - function to track a specific item, and notify the user when it is avaliable. [add it to a list]
        - function to untrack a specific item. [add it to a list]
        - function to display commands user is able to use and how to use them 

*/
import {Client, 
        GatewayIntentBits,
        ButtonBuilder,
        ButtonStyle,
        ModalBuilder,
        TextInputBuilder,
        TextInputStyle,
        ActionRowBuilder
    } from 'discord.js'
import request from 'request';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer'; 

const url = "https://www.popmart.com/us/collection/11"; 


/* request('https://www.popmart.com/us/collection/11', (error, response, body) => {
    var $ = cheerio.load(body);

    if(!error && response.statusCode == 200){
        console.log(body); 
    }
})
*/ 

// Create a new Discord client instance takes an array of intents for data you want to receive
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
}); 

client.login(process.env.DISCORD_TOKEN); 

request(url, (error, response, body) => {
    if (error) {
        console.log("Error:", error);
    } else if (response) {
        console.log("Status code cheerio:", response.statusCode);
    }
    
}); 

// IIFE - Immediatly invoked function expression
/*
(async() => {
    const browser = await puppeteer.launch(); 
    
    const page = await browser.newPage(); 
    await page.goto(url); 

    // await page.screenshot({path: "image.png"});

    let statusCode;
    page.on('response', response => {
        if (response.url() === url) {
            statusCode = response.status();
        }
    });
    
    const html = await page.evaluate(() => {
        return document.documentElement.innerHTML;

    })
    
    console.log(html);
    console.log("Puppeter Status Code: " + statusCode);
    await browser.close(); 
})();
*/ 

async function fetchHtml(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    const html = await page.content(); 
    console.log(html); 

    await browser.close();
    return html; 
}

// FIX THIS 
async function displayItems(message) {
    try {
        const html = await fetchHtml(url);
        const $ = cheerio.load(html);
        let reply = "**Items and In Stock Status**\n";
        $('div.index_productGrid__6CXzT > a').each((i, el) => {
            const container = $(el).find('.index_productItemContainer__rDwtr');
            const name = container.find('h2.index_itemUsTitle__7oLxa').text().trim();
            const inStock = container.find('span.index_tagStyle__gQ1MP').text().trim();
            const price = container.find('div.index_itemPrice__AQoMy').text().trim();
            const inStockStatus = inStock !== "OUT OF STOCK";
            reply += `${name} - ${inStockStatus ? "In Stock" : "Out of Stock"} ${price}\n`;
        });
        if (reply === "**Items and In Stock Status**\n") {
            await message.channel.send("No items found or failed to parse items.");
        } else {
            await message.channel.send(reply);
        }
    } catch (err) {
        console.error(err);
        await message.channel.send("Failed to retrieve items.");
    }
}

client.on('messageCreate', async(message)=> {
    console.log(message); 
    console.log("hello I'm here!"); 
    if (!message.author.bot && message.guild && message.content === '!displaybubu')
    {
        // Display items in the channel
        console.log("Displaying items...");
        await displayItems(message) 
    }
}); 

// Function to log in user to pop mart 

/* Build a button
const btn = new ButtonBuilder()
    .setCustomId('sup')
    .setLabel('sup')
    .setStyle(ButtonStyle.Primary);

const row = new ActionRowBuilder().addComponents(btn);
*/

/* Responed and interact with messages in channel and button press 
client.on('messageCreate', async (message) => {
    console.log(message); 

    if (!message.author.bot && message.guild) { // Only send in guild channels
        await message.channel.send({
            content: 'hello',
            components: [row]
        });
    }
});

client.on('interactionCreate', async interaction =>
{
    if (interaction.customId === 'sup') {
        await interaction.reply ({
            content: 'sup',

        })
    }
}
)
*/

async function getStatusCode(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const response = await page.goto(url, { waitUntil: 'networkidle0' });
    if (response) {
        console.log('Puppeteer Status code:', response.status());
    } else {
        console.log('No response received');
    }
    await browser.close();
}

getStatusCode('https://www.popmart.com/us/collection/11');