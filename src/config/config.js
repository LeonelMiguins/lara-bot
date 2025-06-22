module.exports = 
{

  botName: 'ＬＡＲＡ ＢＯＴ Ｖ１ ☘︎',
  version: '1.0.0',
  prefix: '#',
  author: 'Leonel Miguins',
  collaborators: 'Isabella, Cipher',
  github: '',
  owner: {
    name: 'Leonel',
    number: '5599999999999', // com DDI
},

// lista negra de links
blacklist: {
    whatsappGroupLinks: [
      'chat.whatsapp.com',
      'whatsapp.com/otp', // grupos e links oficiais
      'whatsapp.com/channel',
      'whatsapp.com/community',
    ],

    adultSites: [
      'xvideos.com',
      'pornhub.com',
      'xnxx.com',
      'redtube.com',
      'youjizz.com',
      'porn.com',
      'sex.com',
      'tube8.com',
      'spankbang.com',
      'hentai.com',
      // Pode adicionar mais...
    ],

    betsSites: [
      'bet365.com',
      'betfair.com',
      'betway.com',
      '1xbet.com',
      'sportingbet.com',
      'bumbet.com',
      'betano.com',
      'betboo.com',
      'betsul.com',
      'betfair.com',
      'netbet.com',
      // Pode adicionar mais sites famosos no Brasil
    ]
},

//itens da loja
store: {
  feijao:     { nome: '🥫 Feijão Mágico', preco: 50 },
  chinelo:    { nome: '🩴 Chinelo da Vovó', preco: 75 },
  cat:        { nome: '🐱 Gatinho Sapeca', preco: 250 },
  banana:     { nome: '🍌 Banana de Plástico', preco: 300 },
  pizza:      { nome: '🍕 Pizza Gelada', preco: 500 },
  patins:     { nome: '🛼 Patins Enferrujado', preco: 600 },
  chapeu:     { nome: '🍎 Maçã de Bruxa', preco: 700 },
  lagrima:    { nome: '😭 Lágrima de Admin', preco: 800 },
  radio:      { nome: '📻 Rádio Quebrado', preco: 900 },
  peixe:      { nome: '🐟 Peixe Falante', preco: 1000 },
  kimono:      { nome: '🥋 Kimono', preco: 1000 },
  varinha:    { nome: '🪄 Varinha de Mentira', preco: 1200 },
  tijolo:     { nome: '🧱 Tijolo Invisível', preco: 1500 },
  dente:     { nome: '🦷 Dente do Admin', preco: 1500 },
  sapato:     { nome: '👞 Sapato de Um Pé Só', preco: 1800 },
  oculos:     { nome: '🕶️ Óculos Anti-Ban', preco: 3000 },
  drone:      { nome: '🛸 Mini Drone Espião', preco: 4000 },
  corona:     { nome: '🍺 Corona do Apocalipse', preco: 5000 },
  relicario:  { nome: '📿 Relicário Bugado', preco: 6000 },
  nuds:       { nome: '📸😏 Nudes da Isa', preco: 8000 },
  tanque:     { nome: '🚓 Tanque de Resgate do Grupo', preco: 10000 },
  vidaExtra:  { nome: '💖 Vida Extra', preco: 12000 },
  trono:      { nome: '🪑 Trono do ADM Supremo', preco: 15000 },
  tempo:      { nome: '⌛ Tempo pra Dormir', preco: 20000 }
},

drinks: [
    `🍻 @quem ofereceu uma cerveja geladinha para @alvo!\n\n“Bebe tudinho, até seu cérebro congelar!” 😏\n`,
    `🍺 @quem quer conquistar @alvo com uma cerveja artesanal feita no quintal da própria casa. Vai que cola! 😂\n`,
    `🥂 @quem disse: "Bebo sim, e ofereço também!"\n\n — brindando com @alvo enquanto dança sem música em sima da mesa.\n`,
    `🍷 Uma taça de vinho tinto importado pra @alvo, cortesia de @quem!\n\n “Só não vale cair da cadeira!”\n\n`,
    `🍸 @quem preparou um drink chique chamado "Desmaia Leão" especialmente para @alvo.\n\n “So não vai exagerar no álcool!” 😎\n`,
    `🍼 @quem mandou uma mamadeira com energético para @alvo.\n\n “Ta na hora do nenêm mamar! 😏😏” ⚡\n\n`,
    `🍹 @quem fez um coquetel tropical com guarda-chuvinha só pra impressionar @alvo.\n “Sabor férias em Copacabana meu amor!\n”`,
    `🥃 @quem pediu um uísque duplo com três pedras de gelo pra @alvo.\n\n “Hoje é dia de esquecer os boletos!” 💸\n`,
    `🍵 @quem serviu um chá gelado com vodca para @alvo.\n\n “Começa saudável, termina jogado na sarjeta!”\n\n`,
    `🍾 @quem estourou uma champanhe molhou todo mundo no grupo e deu um gole pra @alvo.\n\n “Não me olha com essa cara, so bebe!\n”`,
    `🧉 @quem mandou um chimarrão turbinado com rum pra @alvo.\n\n “Coisa de gaúcho tchê!” 😁\n`,
    `🥤 @quem comprou uma soda batizada na feira pra @alvo.\n\n “Sabor infância... com álcool!”\n`,
    `🥛 @quem mandou um copão de leite fermentado com pinga pra @alvo.\n\n “Vai dar bom... eu acho.”\n`,
    `🍶 @quem trouxe um saquê direto do Japão pra @alvo.\n\n “Nem sei o que é isso, mas beba! 😏🤌”\n`,
    `☕ @quem ofereceu um café com cachaça pra @alvo.\n\n “Pra acordar e esquecer que acordou.”\n`,
    `🍯 @quem criou um licor de mel e gasolina e deu um shot pra @alvo.\n\n “É doce e mortal!” 🐝💥\n`,
    `🍋 @quem espremeu limão, jogou gelo e tacou tequila no coração de @alvo.\n\n “Drink de paixão amarga!”\n`,
    `🥗 @quem preparou uma salada líquida com vodka orgânica e mandou pra @alvo.\n\n “Fitness e bêbado ao mesmo tempo!\n”`,
    `🍨 @quem serviu uma caipirinha de sorvete pra @alvo.\n\n “Derrete na boca e na dignidade!” 😵‍💫\n`,
    `🍻 @quem apareceu com dois barris de chopp e serviu o primeiro copo pra @alvo.\n\n “Tô afim de chapar o côco!”\n`,
    `🧊 @quem congelou uma bebida no nitrogênio líquido e deu pra @alvo.\n\n “Alta tecnologia a serviço da cachaçada!”\n`,
    //mais frases
  ],

drinksAll: [
    `🍻 @quem subiu na mesa do bar virtual, ergueu o copo e gritou:\n“HOJE A BEBIDA É POR MINHA CONTA!!!” 🗣️🔥\n\n🍺 Rodada liberada pra geral! *{preco} moedas* evaporaram, mas a diversão tá garantida!\n🥳 Copos se chocam, gente tropeça no grupo, e @quem já tá dançando no topo da geladeira!\n\n⚠️ Aviso: o uso prolongado de bebidas oferecidas por @quem pode causar risadas incontroláveis, figurinhas aleatórias e declarações de amor no grupo.\n\n💸 *Saldo atual:* {saldo} moedas`,

    `🍻 @quem gritou lá do fundo do grupo:\n “TOMA QUE HOJE É POR MINHA CONTA!”\n\n🥴 A galera foi à loucura! *{preco} moedas* sumiram como mágica, e o bar abriu oficialmente no grupo!\n🎊 @quem começou a distribuir copos, tropeçou no bot e ainda tirou selfie com o admin!\n\n💸 *Saldo de @quem:* {saldo} moedas`,

    `🍹 @quem jogou moedas pro alto e disse:\n\n“BEBIDA PRA GERAL! NÃO PERGUNTA, SÓ ACEITA!” 💃🕺\n\n🥳 Entre um gole e outro, *{preco} moedas* foram embora, mas a alegria ficou!\n📣 A festa começou e ninguém sabe quando vai acabar!\n\n💸 *Saldo atual:* {saldo} moedas`,

    `🍸 @quem chegou com bandeja cheia de shots e anunciou:\n\n“ABASTECE OS COPOS, QUE HOJE EU TÔ RICO!” 🍾💸\n\n🍻 Todo mundo brindando enquanto o bot tenta entender o caos. Foram *{preco} moedas* bem gastas!\n\n💸 *Novo saldo:* {saldo} moedas`,

    `🎉 @quem abriu um bar temporário no grupo e já gritou:\n\n"PROMOÇÃO RELÂMPAGO: BEBIDA DE GRAÇA PRA GERAL!" ⚡\n\n🤑 Só que custou *{preco} moedas* do bolso de @quem... mas valeu cada centavo!\n🍺 Todos estão com copo na mão e ninguém lembra onde tá a dignidade!\n\n💸 *Restaram:* {saldo} moedas`
  ]

};
