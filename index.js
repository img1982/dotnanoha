const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
require('dotenv').config(); // .envファイルの読み込み

// Discord botのトークン
const DISCORD_TOKEN = process.env.DISCORD_TOKEN; // .envファイルから取得

// Hugging FaceのAPIトークン
const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN; // .envファイルから取得

// Qwen-2.5モデルのエンドポイント
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/Qwen/Qwen2.5-1.5B';

// Discordクライアントの設定
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Discordボットが準備完了した時の処理
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // アクティビティの設定
  client.user.setActivity('質問を受け付け中...', { type: 'PLAYING' }); // アクティビティを「質問を受け付け中...」に変更
});

// メッセージを受け取ったときの処理
client.on('messageCreate', async (message) => {
  // ボット自身のメッセージには応答しない
  if (message.author.bot) return;

  // メッセージが「!ask」で始まる場合、質問応答処理を行う
  if (message.content.startsWith('!ask')) {
    // 質問を抽出
    const question = message.content.slice(5).trim();
    if (!question) {
      message.channel.send('質問を入力してください。例: `!ask 太陽はどのように輝いているの？`');
      return;
    }

    try {
      // Hugging Face APIに質問を送信して応答を取得
      const response = await axios.post(
        HUGGINGFACE_API_URL,
        { inputs: question }, // 修正後のデータ構造
        {
          headers: {
            Authorization: `Bearer ${HUGGINGFACE_TOKEN}`,
          },
        }
      );

      // 応答のメッセージを送信
      const answer = response.data[0]?.generated_text || '回答を生成できませんでした。';
      message.channel.send(answer + " || このメッセージはQwen2.5によって生成されました");
    } catch (error) {
      console.error('Error fetching response from Hugging Face API:', error.response?.data || error.message);
      message.channel.send('エラーが発生しました。もう一度試してください。');
    }
  }
});

// ボットの起動
client.login(DISCORD_TOKEN);
