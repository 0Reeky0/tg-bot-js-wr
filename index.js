const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const menuText = `👋 Привет!

Выбери одну из опций:`;

const buttons = Markup.inlineKeyboard([
  [Markup.button.callback('🏆 Награда', 'awards')],
  [Markup.button.callback('🔮 Хрустальный шар', 'shar')],
  [Markup.button.callback('📜 Правила', 'rules')],
]);

const rulesMenu = Markup.inlineKeyboard([
  [Markup.button.callback('1️⃣ Что такое фирлес', 'rules_1')],
  [Markup.button.callback('2️⃣ Драфт игроков', 'rules_2')],
  [Markup.button.callback('3️⃣ Проведение матчей', 'rules_3')],
  [Markup.button.callback('4️⃣ Призовые', 'rules_4')],
  [Markup.button.callback('⬅️ Назад', 'back_to_main')],
]);

const backButtons = Markup.inlineKeyboard([
  [Markup.button.callback('🔙 Назад', 'back_to_rules')]
]);

// Вопросы для "Хрустального шара"
const questions = [
  {
    id: 1,
    text: 'Назови чемпиона с наибольшими блокировками (за правильный ответ – 10 баллов)',
    type: 'text'
  },
  {
    id: 2,
    text: 'Назови чемпиона с наибольшими пиками (за правильный ответ – 10 баллов)',
    type: 'text'
  },
  {
    id: 3,
    text: 'Назови чемпиона с наивысшим присутствием в драфтах (пики + баны) (за правильный ответ – 10 баллов)',
    type: 'text'
  },
  {
    id: 4,
    text: 'Cколько будет краж Элементальных драконов и Герольдов? (за правильный ответ – 5 баллов)',
    type: 'options',
    options: ['0-8', '9-16', '17-24', '25+']
  },
  {
    id: 5,
    text: 'Сколько будет квадракиллов? (за правильный ответ – 5 баллов)',
    type: 'options',
    options: ['0-5', '6-10', '11-15', '16+']
  },
  {
    id: 6,
    text: 'Сколько будет краж Нашора/Старшего дракона? (за правильный ответ – 5 баллов)',
    type: 'options',
    options: ['0-4', '5-7', '8-11', '12+']
  },
  {
    id: 7,
    text: 'Сколько будет пентакилов за турнир? (за правильный ответ – 5 баллов)',
    type: 'options',
    options: ['0', '1-2', '3-5', '6+']
  },
  {
    id: 8,
    text: 'Сколько будет матчей на турнире, в которых победит команда, не имея трех сторон? (за правильный ответ – 5 баллов)',
    type: 'options',
    options: ['0', '1', '2', '3+']
  },
  {
    id: 9,
    text: 'Какое элементальное ущелье будет наиболее часто встречаться? (за правильный ответ – 5 баллов)',
    type: 'options',
    options: ['Горное', 'Ледяное', 'Инферальное', 'Морское']
  },
  {
    id: 10,
    text: 'Какой игрок получит MVP турнира? (за правильный ответ – 15 баллов)',
    type: 'text'
  },
  {
    id: 11,
    text: 'Какая команда займет первое место на турнире? (за правильный ответ – 15 баллов)',
    type: 'text'
  }
];

// Хранилище текущего вопроса и состояния для каждого пользователя
const userState = {};

// Функция для загрузки предсказаний из JSON
function loadPredictions() {
  try {
    if (fs.existsSync('predictions.json')) {
      const data = fs.readFileSync('predictions.json', 'utf8');
      return JSON.parse(data);
    }
    return {};
  } catch (err) {
    console.error('Ошибка загрузки predictions.json:', err);
    return {};
  }
}

// Функция для сохранения предсказаний в JSON
function savePredictions(predictions) {
  try {
    fs.writeFileSync('predictions.json', JSON.stringify(predictions, null, 2));
  } catch (err) {
    console.error('Ошибка сохранения predictions.json:', err);
  }
}

// === /start
bot.start((ctx) => {
  ctx.reply(menuText, buttons);
});

// === Обработка нажатий
bot.action('awards', async (ctx) => {
  await ctx.editMessageText(
    `🏆 Чтобы получить награду за розыгрыш, отправь скрин своего Twitch-аккаунта сюда:\nhttps://t.me/qq_npp`,
    backButtons
  );
});

bot.action('shar', async (ctx) => {
  const userId = ctx.from.id;
  userState[userId] = { currentQuestion: 1, context: 'shar' };
  
  const question = questions.find(q => q.id === 1);
  let replyText = `🔮 ${question.text}`;
  let replyMarkup = backButtons;

  if (question.type === 'options') {
    replyMarkup = Markup.inlineKeyboard(
      question.options.map(opt => [Markup.button.callback(opt, `answer_${question.id}_${opt}`)])
    );
  }

  // Заменить editMessageText на reply:
  await ctx.reply(replyText, replyMarkup);
});

bot.action('rules', async (ctx) => {
  const userId = ctx.from.id;
  userState[userId] = { context: 'rules' };
  await ctx.editMessageText(
    `📜 Регламент турнира:\n\nВыбери интересующий раздел:`,
    rulesMenu
  );
});

bot.action('rules_1', async (ctx) => {
  const userId = ctx.from.id;
  userState[userId] = { context: 'rules' };
  await ctx.editMessageText(
    `❕ ОСНОВНЫЕ ИЗМЕНЕНИЯ РЕГЛАМЕНТА В СВЯЗИ С ФИРЛЕСОМ ❕

📌 ЧТО ТАКОЕ ФИРЛЕС?

Фирлес — это система драфта, в которой герой может быть взят только ОДИН раз за серию. Если команда А взяла себе Рамбла, то он уходит в бан до конца BO5/BO3.

✅ При этом стандартные 5 банов у каждой команды сохраняются. На 5-й карте будет: 40 фирлес-банов + 10 обычных = **50** заблокированных чемпионов. 

👉 Значит, у вас должен быть пул **от 7-8 чемпионов**, а лучше — **10**, чтобы комфортно участвовать!`,
    backButtons
  );
});

bot.action('rules_2', async (ctx) => {
  const userId = ctx.from.id;
  userState[userId] = { context: 'rules' };
  await ctx.editMessageText(
    `📌 ДРАФТ ИГРОКОВ

Роли по-прежнему указываются, но только **ЛЕСНИК** и **САППОРТ** имеют "жёсткую" привязку:
— Лесник обязан брать **смайт**
— Саппорт — **саппорт-предмет**

Топер, мидер и адк могут играть кем угодно и идти на любую линию.

📌 Особенности:
— 4 круга драфта
— Без шестых игроков
— Замены — только через капитана и из приоритетного пула

🧠 Если замена нужна — капитан пишет организатору.`,
    backButtons
  );
});

bot.action('rules_3', async (ctx) => {
  const userId = ctx.from.id;
  userState[userId] = { context: 'rules' };
  await ctx.editMessageText(
    `📌 ПРОВЕДЕНИЕ МАТЧЕЙ И КАПИТАН

Драфт будет проходить на **специальном сайте** (45 секунд на пик).

❗ Плейсхолдеров и редрафтов — НЕТ. Ссылку на драфт получает **капитан команды**.

👉 Обязанности капитана:
— Быть ответственным
— Иметь **ПК/ноутбук**
— Уметь быстро координироваться

❗ Плохое поведение капитана = исключение из этой роли на следующих турнирах.

🎓 Инструктаж для капитанов — в начале мая.

⛔ Ротации разрешены. Единственное правило:
— Саппорт → саппорт предмет
— Лесник → смайт`,
    backButtons
  );
});

bot.action('rules_4', async (ctx) => {
  const userId = ctx.from.id;
  userState[userId] = { context: 'rules' };
  await ctx.editMessageText(
    `📌 ПРИЗОВЫЕ

Призовой фонд БМТ: **181 400 WC**:

🥇 1 место — 100 000 WC  
🥈 2 место — 50 000 WC  
🥉 3 место — 24 000 WC  
🏅 4 место — 7 400 WC

📢 Все изменения будут добавлены в канал *"Регламент"*

❗ Незнание правил не освобождает от ответственности. Если вы не читали — любые нарушения на вашей совести 🌸`,
    backButtons
  );
});

bot.action('back_to_rules', async (ctx) => {
  const userId = ctx.from.id;
  userState[userId] = { context: 'rules' };
  await ctx.editMessageText(
    `📜 Регламент турнира:\n\nВыбери интересующий раздел:`,
    rulesMenu
  );
});

bot.action('back_to_main', async (ctx) => {
  const userId = ctx.from.id;
  delete userState[userId]; // Сбрасываем состояние
  await ctx.editMessageText(menuText, buttons);
});

// Обработка ответов на вопросы с опциями
questions.forEach(question => {
  if (question.type === 'options') {
    question.options.forEach(option => {
      bot.action(`answer_${question.id}_${option}`, async (ctx) => {
        const userId = ctx.from.id;
        const predictions = loadPredictions();
        
        if (!predictions[userId]) predictions[userId] = {};
        predictions[userId][`q${question.id}`] = option;
        savePredictions(predictions);

        const nextQuestion = questions.find(q => q.id === question.id + 1);
        if (nextQuestion) {
          userState[userId] = { currentQuestion: nextQuestion.id, context: 'shar' };
          let replyText = `🔮 ${nextQuestion.text}`;
          let replyMarkup = backButtons;

          if (nextQuestion.type === 'options') {
            replyMarkup = Markup.inlineKeyboard(
              nextQuestion.options.map(opt => [Markup.button.callback(opt, `answer_${nextQuestion.id}_${opt}`)])
            );
          }

          await ctx.editMessageText(replyText, replyMarkup);
        } else {
          delete userState[userId];
          await ctx.editMessageText('✅ Все ответы сохранены! Спасибо за участие!', backButtons);
        }
      });
    });
  }
});

// Обработка текстовых ответов
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const state = userState[userId];

  if (state && state.context === 'shar' && state.currentQuestion) {
    const question = questions.find(q => q.id === state.currentQuestion);
    if (question && question.type === 'text') {
      const predictions = loadPredictions();
      if (!predictions[userId]) predictions[userId] = {};
      predictions[userId][`q${question.id}`] = ctx.message.text;
      savePredictions(predictions);

      const nextQuestion = questions.find(q => q.id === question.id + 1);
      if (nextQuestion) {
        userState[userId].currentQuestion = nextQuestion.id;
        let replyText = `🔮 ${nextQuestion.text}`;
        let replyMarkup = backButtons;

        if (nextQuestion.type === 'options') {
          replyMarkup = Markup.inlineKeyboard(
            nextQuestion.options.map(opt => [Markup.button.callback(opt, `answer_${nextQuestion.id}_${opt}`)])
          );
        }

        await ctx.reply(replyText, replyMarkup);
      } else {
        delete userState[userId];
        await ctx.reply('✅ Все ответы сохранены! Спасибо за участие!', backButtons);
      }
    }
  }
});

// === Запуск
bot.launch();
console.log('🤖 Бот с инлайн-меню запущен!');