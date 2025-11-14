const axios = require('axios');
const Groq = require('groq-sdk');

// In-memory storage (will reset on each deploy, but that's OK for Vercel)
let memeHistory = [];

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const MEMEGEN_TEMPLATES = [
  { id: 'drake', name: 'Drake Hotline Bling', boxes: 2 },
  { id: 'distracted', name: 'Distracted Boyfriend', boxes: 3 },
  { id: 'two-buttons', name: 'Two Buttons', boxes: 2 },
  { id: 'cmm', name: 'Change My Mind', boxes: 1 },
  { id: 'woman-cat', name: 'Woman Yelling at Cat', boxes: 2 },
  { id: 'exit', name: 'Left Exit 12', boxes: 3 },
  { id: 'brain', name: 'Expanding Brain', boxes: 4 },
  { id: 'pigeon', name: 'Is This A Pigeon', boxes: 2 },
  { id: 'buttons', name: 'Daily Struggle', boxes: 2 },
  { id: 'waiting', name: 'Waiting Skeleton', boxes: 1 },
  { id: 'success', name: 'Success Kid', boxes: 2 },
  { id: 'ancient-aliens', name: 'Ancient Aliens', boxes: 1 },
  { id: 'fine', name: 'This Is Fine', boxes: 1 },
  { id: 'buzz', name: 'X X Everywhere', boxes: 2 },
  { id: 'surprised-pikachu', name: 'Surprised Pikachu', boxes: 1 },
  { id: 'first-time', name: 'First Time?', boxes: 1 },
  { id: 'trade', name: 'Trade Offer', boxes: 3 },
  { id: 'shut-up', name: 'Shut Up And Take My Money', boxes: 1 },
  { id: 'scroll', name: 'Scroll of Truth', boxes: 2 },
  { id: 'patrick', name: 'Patrick Not My Wallet', boxes: 1 },
  { id: 'spiderman', name: 'Spiderman Pointing', boxes: 2 },
  { id: 'kermit', name: 'Kermit Tea', boxes: 1 },
  { id: 'batman', name: 'Batman Slapping Robin', boxes: 2 },
  { id: 'harold', name: 'Hide the Pain Harold', boxes: 2 },
  { id: 'doge', name: 'Doge', boxes: 2 },
  { id: 'rollsafe', name: 'Roll Safe', boxes: 1 },
  { id: 'morpheus', name: 'What If I Told You', boxes: 2 },
  { id: 'wonka', name: 'Condescending Wonka', boxes: 2 },
  { id: 'fry', name: 'Futurama Fry', boxes: 2 },
  { id: 'picard', name: 'Picard Facepalm', boxes: 2 },
  { id: 'awkward', name: 'Awkward Moment Seal', boxes: 1 },
  { id: 'imagination', name: 'Imagination Spongebob', boxes: 1 },
  { id: 'simply', name: 'One Does Not Simply', boxes: 2 },
  { id: 'oficespace', name: 'That Would Be Great', boxes: 2 },
  { id: 'oprah', name: 'Oprah You Get A', boxes: 2 },
  { id: 'skeptical', name: 'Third World Skeptical Kid', boxes: 2 },
  { id: 'ackbar', name: 'Admiral Ackbar', boxes: 2 },
  { id: 'spongebob', name: 'Mocking Spongebob', boxes: 2 },
  { id: 'yoda', name: 'Baby Yoda', boxes: 2 },
  { id: 'disaster', name: 'Disaster Girl', boxes: 1 },
  { id: 'bernie', name: 'Bernie Sanders', boxes: 1 },
  { id: 'always', name: 'Always Has Been', boxes: 2 },
  { id: 'tuxedo', name: 'Tuxedo Winnie', boxes: 2 },
  { id: 'am-i-joke', name: 'Am I A Joke To You', boxes: 1 },
  { id: 'bike', name: 'Bike Fall', boxes: 2 },
  { id: 'clown', name: 'Clown Applying Makeup', boxes: 4 },
  { id: 'handshake', name: 'Epic Handshake', boxes: 3 },
  { id: 'oof', name: 'Oof Size Large', boxes: 1 },
  { id: 'monkey', name: 'Monkey Puppet', boxes: 1 },
  { id: 'lisa', name: 'Lisa Simpson Presentation', boxes: 1 },
  { id: 'draw', name: 'UNO Draw 25', boxes: 2 },
  { id: 'tenguy', name: 'Ten Guy', boxes: 2 },
  { id: 'good-news', name: 'Good News Everyone', boxes: 2 },
  { id: 'bad-time', name: 'Youre Gonna Have A Bad Time', boxes: 2 },
  { id: 'milk', name: 'Spilled Milk', boxes: 2 }
];

async function generateMemeWithMemegen(topic, template, index) {
  try {
    console.log(`Generating ${template.boxes} captions with AI...`);
    
    const completion = await Promise.race([
      groq.chat.completions.create({
        messages: [{
          role: "user",
          content: `Generate ${template.boxes} SHORT funny meme captions about: "${topic}".

Context: Indian audience, be factual and balanced.
Rules:
- Each caption under 50 characters
- Make it relatable and funny
- Return ONLY the captions, one per line
- No quotes, no numbering

Topic: ${topic}`
        }],
        model: "llama-3.3-70b-versatile",
        temperature: 1.2,
        max_tokens: 150
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('AI timeout')), 10000))
    ]);

    const aiResponse = completion.choices[0]?.message?.content?.trim() || '';
    const captions = aiResponse.split('\n')
      .filter(c => c.trim())
      .map(c => c.replace(/^["'\-*\d.]+\s*|["']$/g, '').trim())
      .slice(0, template.boxes);
    
    while (captions.length < template.boxes) {
      captions.push(topic);
    }

    console.log(`Captions: ${captions.join(' | ')}`);

    const encodedCaptions = captions.map(text => {
      return encodeURIComponent(
        text
          .replace(/ /g, '_')
          .replace(/\?/g, '~q')
          .replace(/%/g, '~p')
          .replace(/\//g, '~s')
          .replace(/#/g, '~h')
          .substring(0, 100) 
      );
    });
    
    const memegenUrl = `https://api.memegen.link/images/${template.id}/${encodedCaptions.join('/')}.png`;

    let response;
    let retries = 2;
    
    while (retries >= 0) {
      try {
        response = await axios.get(memegenUrl, { 
          responseType: 'arraybuffer',
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        });
        break; 
      } catch (err) {
        retries--;
        if (retries < 0) throw err;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const imageBuffer = Buffer.from(response.data);
    const imageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;

    return {
      success: true,
      caption: captions.join(' / '),
      imageBase64: imageBase64,
      topic: topic,
      template: template.name,
      type: 'memegen',
      index: index
    };

  } catch (error) {
    console.error(`Error: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

async function generateFallbackMeme(topic, index) {
  console.log(`Generating fallback meme...`);
  
  try {
    const simpleTemplate = { id: 'buzz', name: 'Buzz Lightyear', boxes: 2 };
    const captions = [topic, 'Everywhere'];
    const encodedCaptions = captions.map(c => encodeURIComponent(c.replace(/ /g, '_')));
    const url = `https://api.memegen.link/images/${simpleTemplate.id}/${encodedCaptions.join('/')}.png`;
    
    const response = await axios.get(url, { 
      responseType: 'arraybuffer',
      timeout: 10000
    });
    
    const imageBuffer = Buffer.from(response.data);
    const imageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;
    
    return {
      success: true,
      caption: captions.join(' / '),
      imageBase64: imageBase64,
      topic: topic,
      template: simpleTemplate.name,
      type: 'fallback',
      index: index
    };
  } catch (error) {
    console.error(`Fallback failed, using SVG`);
    
    const svg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="600" fill="#667eea"/>
      <text x="400" y="300" font-family="Impact" font-size="48" font-weight="bold" text-anchor="middle" fill="white" stroke="black" stroke-width="3">
        ${topic.toUpperCase()}
      </text>
    </svg>`;
    
    const base64 = Buffer.from(svg).toString('base64');
    
    return {
      success: true,
      caption: topic,
      imageBase64: `data:image/svg+xml;base64,${base64}`,
      topic: topic,
      template: 'Simple',
      type: 'svg',
      index: index
    };
  }
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ success: false, error: 'Topic is required' });
    }

    const MEME_COUNT = 3;
    console.log(`Generating ${MEME_COUNT} memes for topic: "${topic}"`);

    const successfulMemes = [];
    const shuffled = [...MEMEGEN_TEMPLATES].sort(() => Math.random() - 0.5);
    let attempts = 0;
    const maxAttempts = 10;

    while (successfulMemes.length < MEME_COUNT && attempts < maxAttempts) {
      const template = shuffled[attempts % shuffled.length];
      
      try {
        const meme = await generateMemeWithMemegen(topic, template, successfulMemes.length + 1);
        if (meme.success) {
          successfulMemes.push(meme);
          console.log(`Success! (${successfulMemes.length}/${MEME_COUNT})`);
        }
      } catch (error) {
        console.log(`Error: ${error.message}, trying next...`);
      }
      
      attempts++;
    }

    if (successfulMemes.length === 0) {
      throw new Error('Failed to generate any memes after multiple attempts.');
    }

    while (successfulMemes.length < MEME_COUNT) {
      successfulMemes.push(await generateFallbackMeme(topic, successfulMemes.length + 1));
    }

    const historyEntry = {
      id: Date.now().toString(),
      topic: topic,
      memes: successfulMemes.slice(0, MEME_COUNT),
      timestamp: new Date().toISOString(),
      count: MEME_COUNT
    };
    
    memeHistory.unshift(historyEntry);
    if (memeHistory.length > 50) memeHistory = memeHistory.slice(0, 50);

    return res.status(200).json({
      success: true,
      memes: successfulMemes.slice(0, MEME_COUNT),
      historyId: historyEntry.id
    });

  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};
