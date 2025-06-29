const { Telegraf } = require('telegraf');
const fs = require('fs');
const { code } = require('telegraf/format');

require('dotenv').config();
console.log('✅ BOT_TOKEN:', process.env.BOT_TOKEN);
const bot = new Telegraf(process.env.BOT_TOKEN); // ← обязательно с нижним подчёркиванием




 // Замени на свой токен
const userStates = {}; // Для хрустального шара

const commands = JSON.parse(fs.readFileSync('./commands.json', 'utf-8'));

// Обработка команд
commands.forEach(cmd => {
  bot.command(cmd.name, (ctx) => {
    if (cmd.response === 'RANDOM_NUMBER') {
      const num = Math.floor(Math.random() * 100) + 1;
      ctx.reply(`🎲 Твое число: ${num}`);
    } else {
      ctx.reply(cmd.response);
    }
  });
});

// === Команда /start
bot.start((ctx) => {
  const name = ctx.from.first_name || 'друг';
  let message = `👋 Привет, ${name}!\n\nВот что я умею:\n\n`;

  message += `/start — показать это сообщение\n`;
  commands.forEach(cmd => {
    message += `/${cmd.name} — ${cmd.description}\n`;
  });
  message += `/shar — Хрустальный шар предсказаний\n`;

  ctx.reply(message);
});

// === /шар — предсказание пентакилов
bot.command('shar', (ctx) => {
  const userId = ctx.from.id.toString();
  const predictions = loadPredictions();

  if (predictions[userId]) {
    ctx.reply(`❗ Ты уже сделал предсказание: ${predictions[userId]}`);
  } else {
    userStates[userId] = 'awaiting_prediction';
    ctx.reply('🔮 Сколько будет пентакилов на турнире? Введи число:');
  }
});

// === Обработка ответа для /шар
bot.on('text', (ctx) => {
  const userId = ctx.from.id.toString();

  if (userStates[userId] === 'awaiting_prediction') {
    const answer = ctx.message.text.trim();

    if (!/^\d+$/.test(answer)) {
      return ctx.reply('❌ Введи, пожалуйста, **целое число**.');
    }

    const predictions = loadPredictions();
    predictions[userId] = answer;
    savePredictions(predictions);
    delete userStates[userId];

    ctx.reply(`✅ Записал: ${answer}. Удачи!`);
  }
});

// === Работа с predictions.json
function loadPredictions() {
  try {
    const data = fs.readFileSync('predictions.json', 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

function savePredictions(data) {
  fs.writeFileSync('predictions.json', JSON.stringify(data, null, 2));
}

// === Запуск
bot.launch();
console.log('🤖 Бот запущен!');
