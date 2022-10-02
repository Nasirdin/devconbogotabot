
# Bacelonabot

npm i

## npm install

create .env file with BOT_TOKEN

-----------------------------------------------
## Creaste a bot in telegram

1. Send message to https://t.me/BotFather 
![alt text](https://www.spcdn.org/images/Ru-knowledge_base/chatbots/telegram/create-bot/scr1-min.png)

2. Clich start
3.  /newbot.
4. choose bot name
5. you will recieve t.me/<nicknamebot>, 
![alt text](https://www.spcdn.org/images/Ru-knowledge_base/chatbots/telegram/create-bot/scr5-min.png)

Copy (API) and paste to .env file (BOT_TOKEN).
![alt text](https://www.spcdn.org/images/Ru-knowledge_base/chatbots/telegram/create-bot/scr6-min.png)
![image](https://user-images.githubusercontent.com/65252165/171461241-4572cd90-dbe1-4047-af02-62ef0ba8a232.png)

Run 

``` npm run dev```

To enable autoload
```
pm2 start "npm run dev"
pm2 save
pm2 startup
```

  success
