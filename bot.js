const { Telegraf, Markup } = require("telegraf");
require("dotenv").config();
const { readFile, writeFile, unLink } = require("fs").promises;
let usersArr = [];

const COMMANDS = [
  {
    command: "now",
    description: "Current events",
  },
  {
    command: "whatsup",
    description: "Current side events",
  },
  {
    command: "program",
    description: "Show conference program",
  },
  {
    command: "sideevents",
    description: "Side events",
  },
  {
    command: "ticket",
    description: "Buy tickets",
  },
  {
    command: "venue",
    description: "The Venue",
  },
  {
    command: "help",
    description: "Show help/main menu",
  },
];

module.exports = COMMANDS;

const getHelp = () => {
  let helpText = `*Here's how I can help:*\n`;
  helpText += COMMANDS.map((command) => `*/${command.command}* ${command.description}`).join(`\n`);
  return helpText;
};

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.telegram.setMyCommands(COMMANDS);

bot.start(async (ctx) => {
  const users = usersArr;
  const username = ctx.message.from.username;
  const chatId = ctx.message.chat.id;
  const newUser = {
    chatId: chatId,
    username: username,
  };
  if (!users[0]) {
    const newUsers = [{ userId: 1, ...newUser }];
    usersArr = newUsers;
  } else {
    let findUser = false;
    users.filter((user) => {
      if (user.username === username) {
        findUser = true;
      }
    });
    if (!findUser) {
      const newArr = users.map((us) => {
        return us.userId;
      });
      userId = Math.max(...newArr) + 1;

      const newUsers = [...users, { userId, ...newUser }];
      usersArr = newUsers;
    }
  }

  ctx.replyWithMarkdown(
    `Hi!
I'm a chatbot Devcon Bogota 🦄 and I'm here to help you spend time on conferences with benefit and pleasure. \n
Devcon is an intensive introduction for new Ethereum explorers, a global family reunion for those already a part of our ecosystem, and a source of energy and creativity for all.\n\n\
Use the convenient menu to quickly find the information you need👇\n\n` + getHelp()
  );
});

const report = async (usersArr, ctx, type) => {
  try {
    usersArr.map((user) => {
      bot.telegram.sendMessage(user.chatId, "hi");
    });
  } catch (error) {
    console.error(error);
  }
};

let reportMessage = ``;

bot.action("send_report", (ctx) => {
  usersArr.map((user) => {
    bot.telegram.sendMessage(user.chatId, reportMessage);
  });
  ctx.replyWithHTML("success 🎉");
});

bot.action("edit_report", (ctx) => {
  ctx.replyWithHTML(`What do you want to send?
    Example: /report Hi! user :)`);
});

bot.action("delete_report", (ctx) => {
  reportMessage = "";
  ctx.replyWithHTML("success 🎉");
});

bot.command("report", (ctx) => {
  try {
    const message = ctx.message.text.split(" ");
    if (message.length < 2) {
      ctx.replyWithHTML(`What do you want to send?
Example: /report Hi! user :)`);
    } else {
      delete message[0];
      reportMessage = message.join(" ");
      ctx.replyWithHTML(
        `check the message 👇
      ${reportMessage}
      
      `,
        Markup.inlineKeyboard([
          [Markup.button.callback("✅ Send", "send_report")],
          [Markup.button.callback("✏ Edit", "edit_report")],
          [Markup.button.callback("❌ Delete", "delete_report")],
        ])
      );
    }
  } catch (error) {
    console.error(error);
  }
});
bot.command("getallusers", (ctx) => {
  report();
  const users = usersArr;
  const res = users.map((user) => {
    return `${user.userId} : @${user.username} | ${user.chatId}`;
  });
  ctx.replyWithHTML(`All users ethparisbot:

${res.join(`
`)}

Total number of users: ${users.length}`);
});
bot.help((ctx) =>
  ctx.replyWithHTML(`Hi, ${ctx.message.from.username}
Here's how I can help:

/now - Current events
/program - Show conference program
/sideevents - Side events
/whatsup - Current side events
/ticket - Buy tickets
/venue - The Venue
/help - Show help/main menu

Contact developers @sashanoxon @Nasirdin1`)
);
bot.command("help", (ctx) => {
  return ctx.replyWithMarkdown(getHelp());
});

bot.command("ticket", (ctx) => {
  ctx.replyWithHTML(`To buy conference tickets follow the link below 👇

  https://devcon.org/tickets`);
});

let programEvents = {
  oct11: [
    {
      date: "Octobe 2nd",
      startTime: "10:00",
      endTime: "12:00",
      duation: "15 min",
      venue: "Monge",
      eventName: "Web3 and the Future of Banking",
      speaker: "Peter Grosskopf - Unstoppable Finance",
      type: "Talk | Web 3.0",
    },
  ],
  oct12: [
    {
      date: "July 20th",
      startTime: "15:40",
      endTime: "15:55",
      duation: "15 min",
      venue: "Main Stage",
      eventName: "Uniswap v3, or How I Learned To Stop Worrying And Love Concentrated Liquidity",
      speaker: "Daniel Robinson - Paradigm",
      type: "Talk | Decentralised Finance",
    },
  ],
  oct13: [
    {
      date: "July 21th",
      startTime: "17:30",
      endTime: "18:00",
      duation: "30min",
      venue: "Main Stage",
      eventName: "Closing Ceremony",
      speaker: "EthCC Team - EthCC",
      type: "Talk | Other",
    },
  ],
  oct14: [
    {
      date: "July 21th",
      startTime: "09:30",
      endTime: "09:45",
      duation: "15 min",
      venue: "Sorbonne",
      eventName: "DVT - Decentralized Validator Tech and mainnet launch",
      speaker: "Alon Muroch - SSV.Network",
      type: "Talk |  Ethereum Layers",
    },
  ],
};

let sideEvents = {
  oct5: [
    {
      eventsName: "Happy Hour by Minteo",
      date: "2022-10-5",
      startTime: "19:00",
      endTime: "21:00",
      location: "MICROCERVECERIA BY BRUDER 12a-11 Calle 83 Bogotá, Bogotá 110221 Colombia",
      price: "Free",
      link: "https://www.eventbrite.com/e/happy-hour-by-minteo-tickets-422302818097",
    },
  ],
  oct6: [
    {
      eventsName: "Cartesi Hacker Home | ETH Bogota & Devcon 2022",
      date: "2022-10-6",
      startTime: "19:00",
      endTime: "22:00",
      location: "Suba Suba, Bogotá 111121 Bogotá, Bogota Colombia",
      price: "Free",
      link: "https://www.eventbrite.com/e/cartesi-hacker-home-eth-bogota-devcon-2022-tickets-418359433327",
    },
  ],
  oct7: [
    {
      eventsName: "Infinite Hackaton",
      date: "2022-10-7",
      startTime: "",
      endTime: "",
      location: "Hilton DoubleTree Conference Salitre, Bogotá",
      price: "Free",
      link: "https://infinite-hackathons.eth.limo",
    },
    {
      eventsName: "ETHBogota Hackathon",
      date: "2022-10-7",
      startTime: "12:00",
      endTime: "23:30",
      location: "Agora Bogotá CAc. 24 #38-47 Bogotá, Colombia",
      price: "Free",
      link: "https://bogota.ethglobal.com/",
    },
    {
      eventsName: "Cartesi Hacker Home | ETH Bogota & Devcon 2022",
      date: "2022-10-7",
      startTime: "19:00",
      endTime: "22:00",
      location: "Suba Suba, Bogotá 111121 Bogotá, Bogota Colombia",
      price: "Free",
      link: "https://www.eventbrite.com/e/cartesi-hacker-home-eth-bogota-devcon-2022-tickets-418359433327",
    },
  ],
  oct8: [
    {
      eventsName: "BOGO Hacks",
      date: "2022-10-8",
      startTime: "09:00",
      endTime: "17:00",
      location: "Casa Dann Carlton Hotel & Spa 🇨🇴 Bogota, Colombia",
      price: "Free",
      link: "https://gitcoin.co/hackathon/metis-bogota/onboard",
    },
    {
      eventsName: "Infinite Hackaton",
      date: "2022-10-8",
      startTime: "",
      endTime: "",
      location: "Hilton DoubleTree Conference Salitre, Bogotá",
      price: "Free",
      link: "https://infinite-hackathons.eth.limo",
    },
    {
      eventsName: "ETHBogota Hackathon",
      date: "2022-10-8",
      startTime: "08:00",
      endTime: "23:30",
      location: "Agora Bogotá CAc. 24 #38-47 Bogotá, Colombia",
      price: "Free",
      link: "https://bogota.ethglobal.com/",
    },
    {
      eventsName: "Cartesi Hacker Home | ETH Bogota & Devcon 2022",
      date: "2022-10-8",
      startTime: "19:00",
      endTime: "22:00",
      location: "Suba Suba, Bogotá 111121 Bogotá, Bogota Colombia",
      price: "Free",
      link: "https://www.eventbrite.com/e/cartesi-hacker-home-eth-bogota-devcon-2022-tickets-418359433327",
    },
  ],
  oct9: [
    {
      eventsName: "The DAOist",
      date: "2022-10-9",
      startTime: "",
      endTime: "",
      location: "Cra. 5 #12C-73, La Candelaria, Bogotá, Colombia",
      price: "Free",
      link: "https://www.thedaoist.co/event/bogota-2022",
    },
    {
      eventsName: "Leading Privacy Alliance @ DevCon",
      date: "2022-10-9",
      startTime: "16:30",
      endTime: "21:00",
      location:
        "Hyatt Place Bogota, Av. Calle 24 # 40 - 47, Bogota, 111321 Av. Calle 24 # 40 - 47 Bogota, 111321 Colombia",
      price: "Free",
      link: "https://www.eventbrite.com/e/leading-privacy-alliance-devcon-tickets-401214632767",
    },
    {
      eventsName: "Infinite Hackaton",
      date: "2022-10-9",
      startTime: "",
      endTime: "",
      location: "TBD",
      price: "TBD",
      link: "https://infinite-hackathons.eth.limo",
    },
    {
      eventsName: "BOGO Hacks",
      date: "2022-10-9",
      startTime: "09:00",
      endTime: "19:00",
      location: "Casa Dann Carlton Hotel & Spa 🇨🇴 Bogota, Colombia",
      price: "Free",
      link: "https://gitcoin.co/hackathon/metis-bogota/onboard",
    },
    {
      eventsName: "The Dawn of Decent Builder Houses",
      date: "2022-10-9",
      startTime: "",
      endTime: "",
      location: "TBD",
      price: "Free",
      link: "https://mirror.xyz/decent-dao.eth/wjWOhHKHoLm1iVZxbCss2KLwJsnpozEOkOqDk5uYlfk",
    },
    {
      eventsName: "Cartesi Hacker Home | ETH Bogota & Devcon 2022",
      date: "2022-10-",
      startTime: "19:00",
      endTime: "22:00",
      location: "Suba Suba, Bogotá 111121 Bogotá, Bogota Colombia",
      price: "Free",
      link: "https://www.eventbrite.com/e/cartesi-hacker-home-eth-bogota-devcon-2022-tickets-418359433327",
    },
    {
      eventsName: "ETHBogota Hackathon",
      date: "2022-10-9",
      startTime: "08:00",
      endTime: "21:00",
      location: "Agora Bogotá CAc. 24 #38-47 Bogotá, Colombia",
      price: "Free",
      link: "https://bogota.ethglobal.com/",
    },
  ],
  oct10: [
    {
      eventsName: "Polygon Connect Bogota: After Party",
      date: "2022-10-10",
      startTime: "18:00",
      endTime: "20:00",
      location: "Polygon Connect Bogota: After Party",
      price: "Free",
      link: "https://www.eventbrite.com/e/polygon-connect-bogota-tickets-418910401287",
    },
    {
      eventsName: "Schelling Point",
      date: "2022-10-10",
      startTime: "",
      endTime: "",
      location: "Gran Americas Pavillon",
      price: "TBD",
      link: "https://schellingpoint.gitcoin.co/",
    },
    {
      eventsName: "HUMANS, MACHINES, JOURNALISTS & DRINKS",
      date: "2022-10-10",
      startTime: "18:20",
      endTime: "20:30",
      location:
        "Black Tower Premium Hotel Bogota Corferias 43a-21 Avenida La Esperanza Bogota, Cundinamarca 111321 Colombia",
      price: "Free",
      link: "https://www.eventbrite.com/e/humans-machines-journalists-drinks-tickets-425727952767",
    },
    {
      eventsName: "Reserve Protocol Launch Event",
      date: "2022-10-10",
      startTime: "09:00",
      endTime: "16:00",
      location: "Reserve Protocol Launch Event",
      price: "Free",
      link: "https://www.eventbrite.com/e/reserve-protocol-launch-event-tickets-393454782847",
    },
    {
      eventsName: "Mina zkApp Developers Meetup - Bogota",
      date: "2022-10-10",
      startTime: "18:00",
      endTime: "20:30",
      location: "TBD",
      price: "Free",
      link: "https://www.eventbrite.com/e/mina-zkapp-developers-meetup-bogota-tickets-382900083457",
    },
    {
      eventsName: "Talent Brunch by Talent Protocol & Celo",
      date: "2022-10-10",
      startTime: "11:00",
      endTime: "16:00",
      location: "Mesa Salvaje, Dg. 55 #4-14, Bogotá",
      price: "Free",
      link: "https://lu.ma/talentbrunchBogota",
    },
    {
      eventsName: "Panel - Making wallets safer and more private than ever before with HOPR",
      date: "2022-10-10",
      startTime: "17:00",
      endTime: "20:00",
      location: "Hyatt Place Bogota / Convention Center 40 - 47 Avenida Calle 24 Bogotá, Bogotá 111311 Colombia",
      price: "Free",
      link: "https://www.eventbrite.pt/e/panel-making-wallets-safer-and-more-private-than-ever-before-with-hopr-tickets-424050144397",
    },
    {
      eventsName: "BOGO Hacks",
      date: "2022-10-10",
      startTime: "11:00",
      endTime: "23:00",
      location: "Casa Dann Carlton Hotel & Spa 🇨🇴 Bogota, Colombia",
      price: "Free",
      link: "https://gitcoin.co/hackathon/metis-bogota/onboard",
    },
    {
      eventsName: "Rollup Day",
      date: "2022-10-10",
      startTime: "12:30",
      endTime: "18:00",
      location: "Grand Hyatt Bogotá # 57 – 60 Calle 24a Bogotá, Bogotá 111321 Colombia",
      price: "Free",
      link: "https://www.eventbrite.com/e/rollup-day-tickets-424113834897?aff=erellivmlt",
    },
    {
      eventsName: "Metis Fest",
      date: "2022-10-10",
      startTime: "18:00",
      endTime: "",
      location: "Bogotá, Bogotá, Colombia",
      price: "Free",
      link: "https://www.eventbrite.sg/e/metis-fest-tickets-419323988337",
    },
    {
      eventsName: "Polygon Connect Bogota",
      date: "2022-10-10",
      startTime: "09:00",
      endTime: "17:30",
      location: "Corferias 24 - 67 Carrera 37 Bogotá, Bogotá 111321 Colombia",
      price: "Free",
      link: "Corferias 24 - 67 Carrera 37 Bogotá, Bogotá 111321 Colombia",
    },
    {
      eventsName: "Crypto Nomads Club, BanklessDAO",
      date: "2022-10-10",
      startTime: "13:00",
      endTime: "18:30",
      location: "TBD",
      price: "Free",
      link: "https://www.cryptonomadsclub.xyz/bogota-walking-tour",
    },
    {
      eventsName: "The Dawn of Decent Builder Houses",
      date: "2022-10-10",
      startTime: "",
      endTime: "",
      location: "TBD",
      price: "Free",
      link: "https://mirror.xyz/decent-dao.eth/wjWOhHKHoLm1iVZxbCss2KLwJsnpozEOkOqDk5uYlfk",
    },
    {
      eventsName: "Cartesi Hacker Home | ETH Bogota & Devcon 2022",
      date: "2022-10-10",
      startTime: "19:00",
      endTime: "20:00",
      location: "Suba Suba, Bogotá 111121 Bogotá, Bogota Colombia",
      price: "Free",
      link: "https://www.eventbrite.com/e/cartesi-hacker-home-eth-bogota-devcon-2022-tickets-418359433327",
    },
    {
      eventsName: "DeFi Bogota",
      date: "2022-10-10",
      startTime: "11:00",
      endTime: "17:00",
      location: "Hilton Bogota Corferias Cra. 37 #24 29, Bogotá, Cundinamarca",
      price: "Free",
      link: "https://2022.defibogota.org",
    },
  ],
  oct11: [
    {
      eventsName: "La Fiesta Balancer Libre Hosted by Balancer Ecosystem Partners",
      date: "2022-10-11",
      startTime: "19:00",
      endTime: "00:00",
      location: "La Fiesta Balancer Libre Hosted by Balancer Ecosystem Partners",
      price: "Free",
      link: "https://bit.ly/CarnavaldeBalancer",
    },
    {
      eventsName: "WELL EXTRACTED: Breakfast, Coffee, & Web3's role in the Coffee Industry",
      date: "2022-10-11",
      startTime: "07:30",
      endTime: "10:00",
      location: "Azahar Café 13-91 Calle 93b Bogotá, DC 110221 Colombia",
      price: "0.05 ETH",
      link: "https://www.eventbrite.com/e/well-extracted-breakfast-coffee-web3s-role-in-the-coffee-industry-registration-427178952747",
    },
    {
      eventsName: "Ethereum for the Next Billion | Panel discussion and Happy hour",
      date: "2022-10-11",
      startTime: "17:00",
      endTime: "21:00",
      location: "Hilton Bogota Corferias 24 29 Carrera 37 Bogotá, Cundinamarca 111321 Colombia",
      price: "Free",
      link: "https://www.eventbrite.com/e/ethereum-for-the-next-billion-panel-discussion-and-happy-hour-tickets-406804612547",
    },
    {
      eventsName: "GamesCon: The Gamefi Collective - A Meetup",
      date: "2022-10-11",
      startTime: "17:00",
      endTime: "23:00",
      location: "The Click Clack Hotel Bogotá, Carrera 11#93-77, Bogotá, Cundinamarca, Colombia",
      price: "Free",
      link: "https://lu.ma/xjcxtmfv",
    },
    {
      eventsName: "The Dawn of Decent Builder Houses",
      date: "2022-10-11",
      startTime: "",
      endTime: "",
      location: "TBD",
      price: "Free",
      link: "https://mirror.xyz/decent-dao.eth/wjWOhHKHoLm1iVZxbCss2KLwJsnpozEOkOqDk5uYlfk",
    },
    {
      eventsName: "Cocktails and conversations in the sky by ChainSafe Systems",
      date: "2022-10-11",
      startTime: "18:00",
      endTime: "22:00",
      location: "Astoria Rooftop # 12 - 66 Avenida Calle 85 Bogotá, Bogotá 110221 Colombia",
      price: "Free",
      link: "Cocktails and conversations in the sky by ChainSafe Systems",
    },
    {
      eventsName: "Oasis Cafe @ DevCon",
      date: "2022-10-11",
      startTime: "10:00",
      endTime: "18:00",
      location:
        "Érase una vez café de especialidad 25-76 Carrera 38a #Piso 1 Bogotá, Bogotá 111321 ColombiaÉrase una vez café de especialidad 25-76 Carrera 38a #Piso 1 Bogotá, Bogotá 111321 Colombia",
      price: "Free",
      link: "https://www.eventbrite.com/e/oasis-cafe-devcon-tickets-424223753667",
    },
    {
      eventsName: "Cartesi Hacker Home | ETH Bogota & Devcon 2022",
      date: "2022-10-11",
      startTime: "19:00",
      endTime: "22:00",
      location: "Suba Suba, Bogotá 111121 Bogotá, Bogota Colombia",
      price: "Free",
      link: "https://www.eventbrite.com/e/cartesi-hacker-home-eth-bogota-devcon-2022-tickets-418359433327",
    },
  ],
  oct12: [
    {
      eventsName: "ETH / DEVCON BOGOTA- The Future of Human Connection - In/Out Games",
      date: "2022-10-12",
      startTime: "14:30",
      endTime: "20:00",
      location: "Hyatt Place Bogota / Convention Center 40 - 47 Avenida Calle 24 Bogotá, Bogotá 111311 Colombia",
      price: "Free",
      link: "https://www.eventbrite.com/e/eth-devcon-bogota-the-future-of-human-connection-inout-games-tickets-402242948487",
    },
    {
      eventsName: "Sustainable Blockchain Summit LATAM by Protocol Labs",
      date: "2022-10-12",
      startTime: "18:00",
      endTime: "20:30",
      location: "TBD",
      price: "Donation",
      link: "https://www.eventbrite.com/e/sustainable-blockchain-summit-latam-tickets-397452199227",
    },
    {
      eventsName: "The Future of Human Connection - In/Out Games",
      date: "2022-10-12",
      startTime: "14:30",
      endTime: "20:00",
      location: "Hyatt Place Bogota, Av. Calle 24 # 40 - 47, Bogota, 111321",
      price: "Free",
      link: "https://www.eventbrite.pt/e/eth-devcon-bogota-the-future-of-human-connection-inout-games-tickets-402242948487",
    },
    {
      eventsName: "Reserve Rangwers Night by Reserve Protocol",
      date: "2022-10-12",
      startTime: "18:00",
      endTime: "",
      location: "RSVP after signing up on the website",
      price: "Free",
      link: "https://partiful.com/e/fhsR2ndCm52AZFJRI9gh",
    },
    {
      eventsName: "Meet EEA Leadership at Web3 Retreat",
      date: "2022-10-12",
      startTime: "15:00",
      endTime: "17:00",
      location: "Andrés Paradero Hyatt Place, Ac. 24 # 40 - 51, Bogotá, Cundinamarca, Colombia",
      price: "Free",
      link: "https://lu.ma/meet.EEA.Leadership",
    },
    {
      eventsName: "The Cross Chain Cocktail Party",
      date: "2022-10-12",
      startTime: "17:00",
      endTime: "02:00",
      location: "Mónaco Rooftop, calle 90 #16-34, #Piso 22",
      price: "Free",
      link: "https://www.eventbrite.com/e/cross-chain-cocktail-event-in-bogota-tickets-404357603477",
    },
    {
      eventsName: "Cartesi Hacker Home | ETH Bogota & Devcon 2022",
      date: "2022-10-12",
      startTime: "19:00",
      endTime: "22:00",
      location: "Suba Suba, Bogotá 111121 Bogotá, Bogota Colombia",
      price: "Free",
      link: "https://www.eventbrite.com/e/cartesi-hacker-home-eth-bogota-devcon-2022-tickets-418359433327",
    },
  ],
  oct13: [
    {
      eventsName: "Avalanche House | Bogota",
      date: "2022-10-13",
      startTime: "22:00",
      endTime: "03:00",
      location: "Secret Location",
      price: "Free",
      link: "https://mail.google.com/mail/u/0/#inbox/FMfcgzGqQmSFMTllBXPfHPwRFQScBwQg",
    },
    {
      eventsName: "NEAR Space at DEVCON VI",
      date: "2022-10-13",
      startTime: "09:30",
      endTime: "20:00",
      location: "DoubleTree by Hilton Bogota Salitre AR 22-99 Carrera 60 Bogotá, Cundinamarca 111321 Colombia",
      price: "Free",
      link: "https://www.eventbrite.com/e/near-space-at-devcon-vi-tickets-410199677277",
    },
    {
      eventsName: "A Hitchhiker's Guide to ZK: An Aleo Developer Workshop by Aleo",
      date: "2022-10-13",
      startTime: "08:00",
      endTime: "18:00",
      location: "Hilton Bogota Corferias 24 29 Carrera 37 Bogotá, Cundinamarca 111321 Colombia",
      price: "$10",
      link: "https://www.eventbrite.com/e/a-hitchhikers-guide-to-zk-an-aleo-developer-workshop-tickets-407605849067",
    },
    {
      eventsName: "Etherna's Community Party",
      date: "2022-10-13",
      startTime: "19:30",
      endTime: "23:00",
      location: "Cervecería Lateral Candelaria Calle 12 12c 69 Carrera 5 Bogotá, Bogotá 110321 Colombia",
      price: "Free",
      link: "https://www.eventbrite.com/e/ethernas-community-party-tickets-413257784157",
    },
    {
      eventsName: "DAIVinity",
      date: "2022-10-13",
      startTime: "",
      endTime: "",
      location: "TBD",
      price: "Free",
      link: "https://twitter.com/Daivinity/status/1554538554881196032?s=20&t=cU6V_uK_5tj32aDTK1ZP5w",
    },
    {
      eventsName: "Into the K-Blockchain (Devcon Side Event)",
      date: "2022-10-13",
      startTime: "15:00",
      endTime: "19:00",
      location: "Grand Hyatt Bogotá # 57 – 60 Calle 24a Bogotá, Bogotá 111321 Colombia",
      price: "Free",
      link: "https://www.eventbrite.pt/e/into-the-k-blockchain-devcon-side-event-tickets-427732919677",
    },
    {
      eventsName: "La Womxn in Web3",
      date: "2022-10-13",
      startTime: "09:00",
      endTime: "12:00",
      location: "La Womxn in Web3",
      price: "Free",
      link: "https://www.eventbrite.com/e/cartesi-hacker-home-eth-bogota-devcon-2022-tickets-418359433327",
    },
    {
      eventsName: "Cartesi Hacker Home | ETH Bogota & Devcon 2022",
      date: "2022-10-13",
      startTime: "10:00",
      endTime: "22:00",
      location: "Suba Suba, Bogotá 111121 Bogotá, Bogota Colombia",
      price: "Free",
      link: "https://www.eventbrite.com/e/cartesi-hacker-home-eth-bogota-devcon-2022-tickets-418359433327",
    },
    {
      eventsName: "Blu3 Day Colombia",
      date: "2022-10-13",
      startTime: "12:00",
      endTime: "17:00",
      location: "Hyatt Place Bogota Convention Center Ac. 24 #40 - 47 Bogotá, Bogotá 110221 Colombia",
      price: "Free",
      link: "https://www.eventbrite.com/e/blu3-day-colombia-tickets-421437600207",
    },
  ],
  oct14: [
    {
      eventsName: "ConsenSys Connect Bogota 2022",
      date: "2022-10-14",
      startTime: "10:00",
      endTime: "22:00",
      location: "Hilton Bogota Corferias 24 29 Carrera 37 Bogotá, Cundinamarca 111321 Colombia",
      price: "Free",
      link: "https://www.eventbrite.com/e/consensys-connect-bogota-2022-tickets-415977870007",
    },
    {
      eventsName: "Cartesi Hacker Home | ETH Bogota & Devcon 2022",
      date: "2022-10-14",
      startTime: "10:00",
      endTime: "22:00",
      location: "Suba Suba, Bogotá 111121 Bogotá, Bogota Colombia",
      price: "Free",
      link: "https://www.eventbrite.com/e/cartesi-hacker-home-eth-bogota-devcon-2022-tickets-418359433327",
    },
  ],
  oct15: [
    {
      eventsName: "Cartesi Hacker Home | ETH Bogota & Devcon 2022",
      date: "2022-10-15",
      startTime: "10:00",
      endTime: "22:00",
      location: "Suba Suba, Bogotá 111121 Bogotá, Bogota Colombia",
      price: "Free",
      link: "https://www.eventbrite.com/e/cartesi-hacker-home-eth-bogota-devcon-2022-tickets-418359433327",
    },
  ],
};

const program_by_day_keyboard = [
  [
    {
      text: "11-October",
      callback_data: "program_by_day_11",
    },
  ],
  [
    {
      text: "12-October",
      callback_data: "program_by_day_12",
    },
  ],
  [
    {
      text: "13-October",
      callback_data: "program_by_day_13",
    },
  ],
  [
    {
      text: "14-October",
      callback_data: "program_by_day_14",
    },
  ],
];
const type_con_by_day_keyboard_11 = [
  [
    {
      text: "Talk",
      callback_data: "type_talk_11",
    },
    {
      text: "Workshop",
      callback_data: "type_workshop_12",
    },
  ],
  [
    {
      text: "↩ Back to selection",
      callback_data: "back_to_selection_program",
    },
  ],
];
const type_con_by_day_keyboard_12 = [
  [
    {
      text: "Talk",
      callback_data: "type_talk_12",
    },
    {
      text: "Workshop",
      callback_data: "type_workshop_12",
    },
  ],
  [
    {
      text: "↩ Back to selection",
      callback_data: "back_to_selection_program",
    },
  ],
];
const type_con_by_day_keyboard_13 = [
  [
    {
      text: "Talk",
      callback_data: "type_talk_13",
    },
    {
      text: "Workshop",
      callback_data: "type_workshop_13",
    },
  ],
  [
    {
      text: "↩ Back to selection",
      callback_data: "back_to_selection_program",
    },
  ],
];
const type_con_by_day_keyboard_14 = [
  [
    {
      text: "Talk",
      callback_data: "type_talk_14",
    },
    {
      text: "Workshop",
      callback_data: "type_workshop_14",
    },
  ],
  [
    {
      text: "↩ Back to selection",
      callback_data: "back_to_selection_program",
    },
  ],
];

bot.command("program", (ctx) => {
  try {
    ctx.reply(`Choose a day:                 .`, {
      reply_markup: {
        inline_keyboard: program_by_day_keyboard,
      },
    });
  } catch (error) {
    console.error(error);
  }
});

bot.action("program_by_day_11", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  ctx.reply(`Program list is empty`);
  // ctx.reply(`Select conference type:`, {
  //   reply_markup: {
  //     inline_keyboard: type_con_by_day_keyboard_11,
  //   },
  // });
});
bot.action("program_by_day_12", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  ctx.reply(`Program list is empty`);

  // ctx.reply(`Select conference type:`, {
  // reply_markup: {
  // inline_keyboard: type_con_by_day_keyboard_12,
  // },
  // });
});
bot.action("program_by_day_13", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  ctx.reply(`Program list is empty`);

  // ctx.reply(`Select conference type:`, {
  // reply_markup: {
  // inline_keyboard: type_con_by_day_keyboard_13,
  // },
  // });
});
bot.action("program_by_day_14", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  ctx.reply(`Program list is empty`);

  // ctx.reply(`Select conference type:`, {
  // reply_markup: {
  // inline_keyboard: type_con_by_day_keyboard_14,
  // },
  // });
});

const lastResFunc = (res, count) => {
  return res[count].map((event) => {
    return `
📌 <b>${event.eventName}</b>
🗣 ${event.speaker}
🕒 ${event.date} | ${event.startTime} - ${event.endTime} | ${event.duation}
📍 ${event.venue}
📢 ${event.type}`;
  });
};

const programViewFunc = (res, count) => {
  if (res.length > 0 && res.length < 11) {
    const lastResult = lastResFunc([res], count);
    return [lastResult];
  } else if (res.length > 10) {
    const arr = [];
    for (let i = 0; i < res.length; i += 10) {
      const chunk = res.slice(i, i + 10);
      arr.push(chunk);
    }
    const lastResult = lastResFunc(arr, count);
    return [lastResult];
  } else {
    console.log("error");
  }
};
// Talk Talk Talk
bot.action("type_talk_19", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july19.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 0);
  ctx.replyWithHTML(
    `<b>Tuesday, July 19th</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("➡ Next", "next_talk_by_day_19_1")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});

bot.action("next_talk_by_day_19_1", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july19.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 1);
  ctx.replyWithHTML(
    `<b>Tuesday, July 19th</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅ Prev", "type_talk_19")],
      [Markup.button.callback("➡ Next", "next_talk_by_day_19_2")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});
bot.action("next_talk_by_day_19_2", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july19.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 2);
  ctx.replyWithHTML(
    `<b>Tuesday, July 19th</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅ Prev", "next_talk_by_day_19_1")],
      [Markup.button.callback("➡ Next", "next_talk_by_day_19_3")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});
bot.action("next_talk_by_day_19_3", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july19.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 3);
  ctx.replyWithHTML(
    `<b>Tuesday, July 19th</b>
${newRes[0].join(`
`)}
@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅ Prev", "next_talk_by_day_19_2")],
      [Markup.button.callback("➡ Next", "next_talk_by_day_19_4")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});
bot.action("next_talk_by_day_19_4", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july19.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 4);
  ctx.replyWithHTML(
    `<b>Tuesday, July 19th</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅ Prev", "next_talk_by_day_19_3")],
      [Markup.button.callback("➡ Next", "next_talk_by_day_19_5")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});
bot.action("next_talk_by_day_19_5", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july19.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 5);
  ctx.replyWithHTML(
    `<b>Tuesday, July 19th</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅ Prev", "next_talk_by_day_19_4")],
      [Markup.button.callback("➡ Next", "next_talk_by_day_19_6")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});
bot.action("next_talk_by_day_19_6", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july19.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 6);
  ctx.replyWithHTML(
    `<b>Tuesday, July 19th</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅ Prev", "next_talk_by_day_19_5")],
      [Markup.button.callback("➡ Next", "next_talk_by_day_19_7")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});
bot.action("next_talk_by_day_19_7", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july19.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 7);
  ctx.replyWithHTML(
    `<b>Tuesday, July 19th</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅ Prev", "next_talk_by_day_19_6")],
      [Markup.button.callback("➡ Next", "next_talk_by_day_19_8")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});
bot.action("next_talk_by_day_19_8", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july19.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 8);
  ctx.replyWithHTML(
    `<b>Tuesday, July 19th</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅ Prev", "next_talk_by_day_19_7")],
      [Markup.button.callback("➡ Next", "next_talk_by_day_19_9")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});
bot.action("next_talk_by_day_19_9", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july19.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 9);
  ctx.replyWithHTML(
    `<b>Tuesday, July 19th</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅ Prev", "next_talk_by_day_19_8")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});
bot.action("type_workshop_19", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july19.filter((event) => {
    return event.type[0] == "W";
  });
  const newRes = programViewFunc(res, 0);
  ctx.replyWithHTML(
    `<b>Tuesday, July 19th</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([[Markup.button.callback("↩ Bact to select", "back_to_selection_program")]])
  );
});

bot.action("type_talk_20", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july20.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 0);
  ctx.replyWithHTML(
    `<b>Wednesday, July 20th</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("➡ Next", "next_talk_by_day_20_1")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});
bot.action("next_talk_by_day_20_1", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july20.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 1);
  ctx.replyWithHTML(
    `<b>Wednesday, July 20th</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅ Prev", "type_talk_20")],
      [Markup.button.callback("➡ Next", "next_talk_by_day_20_2")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});
bot.action("next_talk_by_day_20_2", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july20.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 2);
  ctx.replyWithHTML(
    `<b>Wednesday, July 20th</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅ Prev", "next_talk_by_day_20_1")],
      [Markup.button.callback("➡ Next", "next_talk_by_day_20_3")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});
bot.action("next_talk_by_day_20_3", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july20.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 3);
  ctx.replyWithHTML(
    `<b>Wednesday, July 20th</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅ Prev", "next_talk_by_day_20_2")],
      [Markup.button.callback("➡ Next", "next_talk_by_day_20_4")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});
bot.action("next_talk_by_day_20_4", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july20.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 4);
  ctx.replyWithHTML(
    `<b>Wednesday, July 20th</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅ Prev", "next_talk_by_day_20_3")],
      [Markup.button.callback("➡ Next", "next_talk_by_day_20_5")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});
bot.action("next_talk_by_day_20_5", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july20.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 5);
  ctx.replyWithHTML(
    `<b>Wednesday, July 20th</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅ Prev", "next_talk_by_day_20_4")],
      [Markup.button.callback("➡ Next", "next_talk_by_day_20_6")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});
bot.action("next_talk_by_day_20_6", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july20.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 6);
  ctx.replyWithHTML(
    `<b>Wednesday, July 20th</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅ Prev", "next_talk_by_day_20_5")],
      [Markup.button.callback("➡ Next", "next_talk_by_day_20_7")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});
bot.action("next_talk_by_day_20_7", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july20.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 7);
  ctx.replyWithHTML(
    `<b>Wednesday, July 20th</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅ Prev", "next_talk_by_day_20_6")],
      [Markup.button.callback("➡ Next", "next_talk_by_day_20_8")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});
bot.action("next_talk_by_day_20_8", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july20.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 8);
  ctx.replyWithHTML(
    `<b>Wednesday, July 20th</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅ Prev", "next_talk_by_day_20_7")],
      [Markup.button.callback("➡ Next", "next_talk_by_day_20_9")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});
bot.action("next_talk_by_day_20_9", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july20.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 9);
  ctx.replyWithHTML(
    `<b>Wednesday, July 20th</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅ Prev", "next_talk_by_day_20_8")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});
bot.action("type_workshop_20", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july20.filter((event) => {
    return event.type[0] == "W";
  });
  const newRes = programViewFunc(res, 0);
  ctx.replyWithHTML(
    `<b>Wednesday, July 20th</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([[Markup.button.callback("↩ Bact to select", "back_to_selection_program")]])
  );
});

bot.action("type_talk_21", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july21.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 0);
  ctx.replyWithHTML(
    `<b>Thursday, July 21st</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("➡ Next", "next_talk_by_day_21_1")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});
bot.action("next_talk_by_day_21_1", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july21.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 1);
  ctx.replyWithHTML(
    `<b>Thursday, July 21st</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅ Prev", "type_talk_21")],
      [Markup.button.callback("➡ Next", "next_talk_by_day_21_2")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});
bot.action("next_talk_by_day_21_2", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july21.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 2);
  ctx.replyWithHTML(
    `<b>Thursday, July 21st</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅ Prev", "next_talk_by_day_21_1")],
      [Markup.button.callback("➡ Next", "next_talk_by_day_21_3")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});
bot.action("next_talk_by_day_21_3", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july21.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 3);
  ctx.replyWithHTML(
    `<b>Thursday, July 21st</b>
  ${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅ Prev", "next_talk_by_day_21_2")],
      [Markup.button.callback("➡ Next", "next_talk_by_day_21_4")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});
bot.action("next_talk_by_day_21_4", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july21.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 4);
  ctx.replyWithHTML(
    `<b>Thursday, July 21st</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅ Prev", "next_talk_by_day_21_3")],
      [Markup.button.callback("➡ Next", "next_talk_by_day_21_5")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});
bot.action("next_talk_by_day_21_5", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july21.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 5);
  ctx.replyWithHTML(
    `<b>Thursday, July 21st</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅ Prev", "next_talk_by_day_21_4")],
      [Markup.button.callback("➡ Next", "next_talk_by_day_21_6")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});
bot.action("next_talk_by_day_21_6", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july21.filter((event) => {
    return event.type[0] == "T";
  });
  const newRes = programViewFunc(res, 6);
  ctx.replyWithHTML(
    `<b>Thursday, July 21st</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅ Prev", "next_talk_by_day_21_5")],
      [Markup.button.callback("↩ Bact to select", "back_to_selection_program")],
    ])
  );
});
bot.action("type_workshop_21", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july21.filter((event) => {
    return event.type[0] == "W";
  });
  const newRes = programViewFunc(res, 0);
  ctx.replyWithHTML(
    `<b>Thursday, July 21st</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([[Markup.button.callback("↩ Bact to select", "back_to_selection_program")]])
  );
});
bot.action("type_idea_21", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const res = programEvents.july21.filter((event) => {
    return event.type[0] == "I";
  });
  const newRes = programViewFunc(res, 0);
  ctx.replyWithHTML(
    `<b>Thursday, July 21st</b>
${newRes[0].join(`
`)}

@devconbogotabot stay tuned without leaving telegram.`,
    Markup.inlineKeyboard([[Markup.button.callback("↩ Bact to select", "back_to_selection_program")]])
  );
});

const zeroTime = (date) => {
  if (date.toString().length == 1 && date !== 0) {
    return `0${date}`;
  } else if (date == 0) {
    return `0${date}`;
  } else {
    return date;
  }
};

bot.command("now", async (ctx) => {
  const nDate = new Date().toLocaleString("ru-RU", {
    timeZone: "America/Bogota",
  });
  const newDate = nDate.split(" ");
  const newTime = newDate[1].split(":");
  const getTime = `${zeroTime(newTime[0])}:${zeroTime(newTime[1])}`;
  const newGetDate = newDate[0].split(".");
  const getDate = newGetDate[0];
  const getMonth = newGetDate[1];
  const newEvents = () => {
    if (getDate == 11 && getMonth == 10) {
      const events = programEvents.oct11;
      const nowArrayEvents = events.filter((event) => {
        if (getTime >= event.startTime && getTime <= event.endTime) {
          return event;
        }
      });
      return nowArrayEvents;
    } else if (getDate == 12 && getMonth == 10) {
      const events = programEvents.oct12;
      const nowArrayEvents = events.filter((event) => {
        if (getTime >= event.startTime && getTime <= event.endTime) {
          return event;
        }
      });
      return nowArrayEvents;
    } else if (getDate == 13 && getMonth == 10) {
      const events = programEvents.oct13;
      const nowArrayEvents = events.filter((event) => {
        if (getTime >= event.startTime && getTime <= event.endTime) {
          return event;
        }
      });
      return nowArrayEvents;
    } else if (getDate == 14 && getMonth == 10) {
      const events = programEvents.oct14;
      const nowArrayEvents = events.filter((event) => {
        if (getTime >= event.startTime && getTime <= event.endTime) {
          return event;
        }
      });
      return nowArrayEvents;
    } else {
      return false;
    }
  };

  const newEventsArr = newEvents();
  if (newEventsArr.length <= 0 || !newEventsArr) {
    ctx.replyWithHTML("Porgram list is empty");
    return false;
  }
  const nowEvents = newEventsArr.map((event) => {
    return `
📌 <b>${event.eventName}</b>
🗣 ${event.speaker}
🕒 ${event.date} | ${event.startTime} - ${event.endTime} | ${event.duation}
📍 ${event.venue}`;
  });
  ctx.replyWithHTML(`Now:
${nowEvents.join(`

`)}`);
});

bot.action("back_to_selection_program", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  ctx.reply(`Choose a day:                 .`, {
    reply_markup: {
      inline_keyboard: program_by_day_keyboard,
    },
  });
});

const sideEvents_by_day_keyboard = [
  [
    {
      text: "5-October",
      callback_data: "sideEvents_by_day_5",
    },
    {
      text: "6-October",
      callback_data: "sideEvents_by_day_6",
    },
    {
      text: "7-October",
      callback_data: "sideEvents_by_day_7",
    },
  ],
  [
    {
      text: "8-October",
      callback_data: "sideEvents_by_day_8",
    },
    {
      text: "9-October",
      callback_data: "sideEvents_by_day_9",
    },
    {
      text: "10-October",
      callback_data: "sideEvents_by_day_10",
    },
  ],
  [
    {
      text: "11-October",
      callback_data: "sideEvents_by_day_11",
    },
    {
      text: "12-October",
      callback_data: "sideEvents_by_day_12",
    },
    {
      text: "13-October",
      callback_data: "sideEvents_by_day_13",
    },
  ],
  [
    {
      text: "14-October",
      callback_data: "sideEvents_by_day_14",
    },
    {
      text: "15-October",
      callback_data: "sideEvents_by_day_15",
    },
  ],
];

const sideEventsFunc = (sideEventsArray) => {
  if (!sideEventsArray || sideEventsArray.length === 0) {
    ctx.replyWithHTML("Side Events are empty");
  } else {
    const res = sideEventsArray.map((events) => {
      return `
📌 <b>${events.eventsName}</b>
🕓 ${events.date} | ${!events.startTime ? "TBD" : `${events.startTime} - ${!events.endTime ? "" : `${events.endTime}`}`}
📍 ${events.location}
💶 ${events.price}
${!events.link ? "" : `<i><a href='${events.link}'>Website</a></i> ↗`}
`;
    });
    return [res];
  }
};

bot.command("sideevents", (ctx) => {
  try {
    ctx.reply(`Choose a day:                 .`, {
      reply_markup: {
        inline_keyboard: sideEvents_by_day_keyboard,
      },
    });
  } catch (error) {
    console.error(error);
  }
});

bot.action("sideEvents_by_day_5", async (ctx) => {
  try {
    const sideEventsArray = sideEvents.oct5;
    const res = sideEventsFunc(sideEventsArray);
    res.map((events) => {
      ctx.replyWithHTML(
        `Wednesday, October 15
      
  ${events.join(``)}
  
  @devconbogotabot stay tuned without leaving telegram.`,
        Markup.inlineKeyboard([[Markup.button.callback("↩️ Back to selection", "back_to_selection")]]),
        {
          disable_web_page_preview: true,
        }
      );
    });
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  } catch (error) {
    console.error(error);
  }
});
bot.action("sideEvents_by_day_6", async (ctx) => {
  try {
    const sideEventsArray = sideEvents.oct6;
    const res = sideEventsFunc(sideEventsArray);
    res.map((events) => {
      ctx.replyWithHTML(
        `Thursday, October 6
      
  ${events.join(``)}
  
  @devconbogotabot stay tuned without leaving telegram.`,
        Markup.inlineKeyboard([[Markup.button.callback("↩️ Back to selection", "back_to_selection")]]),
        {
          disable_web_page_preview: true,
        }
      );
    });
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  } catch (error) {
    console.error(error);
  }
});
bot.action("sideEvents_by_day_7", async (ctx) => {
  try {
    const sideEventsArray = sideEvents.oct7;
    const res = sideEventsFunc(sideEventsArray);
    res.map((events) => {
      ctx.replyWithHTML(
        `Friday, October 7
      
  ${events.join(``)}
  
  @devconbogotabot stay tuned without leaving telegram.`,
        Markup.inlineKeyboard([[Markup.button.callback("↩️ Back to selection", "back_to_selection")]]),
        {
          disable_web_page_preview: true,
        }
      );
    });
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  } catch (error) {
    console.error(error);
  }
});
bot.action("sideEvents_by_day_8", async (ctx) => {
  try {
    const sideEventsArray = sideEvents.oct8;
    const res = sideEventsFunc(sideEventsArray);
    res.map((events) => {
      ctx.replyWithHTML(
        `Saturday, October 8
      
  ${events.join(``)}
  
  @devconbogotabot stay tuned without leaving telegram.`,
        Markup.inlineKeyboard([[Markup.button.callback("↩️ Back to selection", "back_to_selection")]]),
        {
          disable_web_page_preview: true,
        }
      );
    });
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  } catch (error) {
    console.error(error);
  }
});
bot.action("sideEvents_by_day_9", async (ctx) => {
  try {
    const sideEventsArray = sideEvents.oct9;
    const res = sideEventsFunc(sideEventsArray);
    res.map((events) => {
      ctx.replyWithHTML(
        `Sunday, October 9
      
  ${events.join(``)}
  
  @devconbogotabot stay tuned without leaving telegram.`,
        Markup.inlineKeyboard([[Markup.button.callback("↩️ Back to selection", "back_to_selection")]]),
        {
          disable_web_page_preview: true,
        }
      );
    });
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  } catch (error) {
    console.error(error);
  }
});
bot.action("sideEvents_by_day_10", async (ctx) => {
  try {
    const sideEventsArray = sideEvents.oct10;
    const res = sideEventsFunc(sideEventsArray);
    res.map((events) => {
      ctx.replyWithHTML(
        `Monday, October 10
      
  ${events.join(``)}
  
  @devconbogotabot stay tuned without leaving telegram.`,
        Markup.inlineKeyboard([[Markup.button.callback("↩️ Back to selection", "back_to_selection")]]),
        {
          disable_web_page_preview: true,
        }
      );
    });
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  } catch (error) {
    console.error(error);
  }
});
bot.action("sideEvents_by_day_11", async (ctx) => {
  try {
    const sideEventsArray = sideEvents.oct11;
    const res = sideEventsFunc(sideEventsArray);
    res.map((events) => {
      ctx.replyWithHTML(
        `Tuesday, October 11
      
  ${events.join(``)}
  
  @devconbogotabot stay tuned without leaving telegram.`,
        Markup.inlineKeyboard([[Markup.button.callback("↩️ Back to selection", "back_to_selection")]]),
        {
          disable_web_page_preview: true,
        }
      );
    });
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  } catch (error) {
    console.error(error);
  }
});
bot.action("sideEvents_by_day_12", async (ctx) => {
  try {
    const sideEventsArray = sideEvents.oct12;
    const res = sideEventsFunc(sideEventsArray);
    res.map((events) => {
      ctx.replyWithHTML(
        `Wednesday, October 12
      
  ${events.join(``)}
  
  @devconbogotabot stay tuned without leaving telegram.`,
        Markup.inlineKeyboard([[Markup.button.callback("↩️ Back to selection", "back_to_selection")]]),
        {
          disable_web_page_preview: true,
        }
      );
    });
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  } catch (error) {
    console.error(error);
  }
});
bot.action("sideEvents_by_day_13", async (ctx) => {
  try {
    const sideEventsArray = sideEvents.oct13;
    const res = sideEventsFunc(sideEventsArray);
    res.map((events) => {
      ctx.replyWithHTML(
        `Thursday, October 13
      
  ${events.join(``)}
  
  @devconbogotabot stay tuned without leaving telegram.`,
        Markup.inlineKeyboard([[Markup.button.callback("↩️ Back to selection", "back_to_selection")]]),
        {
          disable_web_page_preview: true,
        }
      );
    });
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  } catch (error) {
    console.error(error);
  }
});
bot.action("sideEvents_by_day_14", async (ctx) => {
  try {
    const sideEventsArray = sideEvents.oct14;
    const res = sideEventsFunc(sideEventsArray);
    res.map((events) => {
      ctx.replyWithHTML(
        `Friday, October 14
      
  ${events.join(``)}
  
  @devconbogotabot stay tuned without leaving telegram.`,
        Markup.inlineKeyboard([[Markup.button.callback("↩️ Back to selection", "back_to_selection")]]),
        {
          disable_web_page_preview: true,
        }
      );
    });
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  } catch (error) {
    console.error(error);
  }
});
bot.action("sideEvents_by_day_15", async (ctx) => {
  try {
    const sideEventsArray = sideEvents.oct15;
    const res = sideEventsFunc(sideEventsArray);
    res.map((events) => {
      ctx.replyWithHTML(
        `Saturday, October 15
      
  ${events.join(``)}
  
  @devconbogotabot stay tuned without leaving telegram.`,
        Markup.inlineKeyboard([[Markup.button.callback("↩️ Back to selection", "back_to_selection")]]),
        {
          disable_web_page_preview: true,
        }
      );
    });
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  } catch (error) {
    console.error(error);
  }
});

bot.command("whatsup", (ctx) => {
  const nDate = new Date().toLocaleString("ru-RU", {
    timeZone: "America/Bogota",
  });

  const newDate = nDate.split(" ");
  const newTime = newDate[1].split(":");
  const getTime = `${zeroTime(newTime[0])}:${zeroTime(newTime[1])}`;
  const newGetDate = newDate[0].split(".");
  const getDate = newGetDate[0];
  const getMonth = newGetDate[1];
  const newEvents = () => {
    if (getDate == 5 && getMonth == 10) {
      const events = sideEvents.oct5;
      const nowArrayEvents = events.filter((event) => {
        if (getTime >= event.startTime && getTime <= (!event.endTime ? "00:00" : event.endTime)) {
          return event;
        }
        return false;
      });
      return nowArrayEvents;
    } else if (getDate == 6 && getMonth == 10) {
      const events = sideEvents.oct6;
      const nowArrayEvents = events.filter((event) => {
        if (getTime >= event.startTime && getTime <= (!event.endTime ? "00:00" : event.endTime)) {
          return event;
        }
      });
      return nowArrayEvents;
    } else if (getDate == 7 && getMonth == 10) {
      const events = sideEvents.oct7;
      const nowArrayEvents = events.filter((event) => {
        if (getTime >= event.startTime && getTime <= (!event.endTime ? "00:00" : event.endTime)) {
          return event;
        }
      });
      return nowArrayEvents;
    } else if (getDate == 8 && getMonth == 10) {
      const events = sideEvents.oct8;
      const nowArrayEvents = events.filter((event) => {
        if (getTime >= event.startTime && getTime <= (!event.endTime ? "00:00" : event.endTime)) {
          return event;
        }
      });
      return nowArrayEvents;
    } else if (getDate == 9 && getMonth == 10) {
      const events = sideEvents.oct9;
      const nowArrayEvents = events.filter((event) => {
        if (getTime >= event.startTime && getTime <= (!event.endTime ? "00:00" : event.endTime)) {
          return event;
        }
      });
      return nowArrayEvents;
    } else if (getDate == 10 && getMonth == 10) {
      const events = sideEvents.oct10;
      const nowArrayEvents = events.filter((event) => {
        if (getTime >= event.startTime && getTime <= (!event.endTime ? "00:00" : event.endTime)) {
          return event;
        }
      });
      return nowArrayEvents;
    } else if (getDate == 12 && getMonth == 10) {
      const events = sideEvents.oct12;
      const nowArrayEvents = events.filter((event) => {
        if (getTime >= event.startTime && getTime <= (!event.endTime ? "00:00" : event.endTime)) {
          return event;
        }
      });
      return nowArrayEvents;
    } else if (getDate == 13 && getMonth == 10) {
      const events = sideEvents.oct13;
      const nowArrayEvents = events.filter((event) => {
        if (getTime >= event.startTime && getTime <= (!event.endTime ? "00:00" : event.endTime)) {
          return event;
        }
      });
      return nowArrayEvents;
    } else if (getDate == 14 && getMonth == 10) {
      const events = sideEvents.oct14;
      const nowArrayEvents = events.filter((event) => {
        if (getTime >= event.startTime && getTime <= (!event.endTime ? "00:00" : event.endTime)) {
          return event;
        }
      });
      return nowArrayEvents;
    } else if (getDate == 15 && getMonth == 10) {
      const events = sideEvents.oct15;
      const nowArrayEvents = events.filter((event) => {
        if (getTime >= event.startTime && getTime <= (!event.endTime ? "00:00" : event.endTime)) {
          return event;
        }
      });
      return nowArrayEvents;
    } else {
      return false;
    }
  };
  const newEventsArr = newEvents();
  if (newEventsArr.length <= 0 || !newEventsArr) {
    ctx.replyWithHTML("Porgram list is empty");
    return false;
  }
  const nowEvents = newEventsArr.map((events) => {
    return `📌 <b>${events.eventsName}</b>
🕓 ${events.date} | ${events.startTime} ${!events.endTime ? "" : `- ${events.endTime}`}
📍 ${events.location}
💶 ${events.price}
${!events.link ? "" : `<i><a href='${events.link}'>Website</a></i> ↗`}
    `;
  });
  ctx.replyWithHTML(
    `Now:
${nowEvents.join(`

`)}

@devconbogotabot stay tuned without leaving telegram.`,
    {
      disable_web_page_preview: true,
    }
  );
});

bot.action("back_to_selection", async (ctx) => {
  try {
    ctx.reply(`Choose a day:                 .`, {
      reply_markup: {
        inline_keyboard: sideEvents_by_day_keyboard,
      },
    });
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  } catch (error) {
    console.error(error);
  }
});

bot.command("venue", async (ctx) => {
  ctx.replyWithHTML(`<b>The Venue</b>
Devcon VI will be held in beautiful Bogotá, Colombia.

<b>Devcon Oct 11-14</b> 📌  Agora Bogotá Convention Center
<b>Devcon Week</b> — October 7-16 in Bogotá, Colombia.

<a href="https://goo.gl/maps/RXtWiEzVPyhtnQSw6">Open with Google Maps</a>`);
});

bot.launch();

module.exports.handler = async function (event, context) {
  const message = JSON.parse(event.body);
  await bot.handleUpdate(message);
  return {
    statusCode: 200,
    body: "",
  };
};
// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
