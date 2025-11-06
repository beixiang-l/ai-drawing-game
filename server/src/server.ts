import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize DashScope API Key
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY || process.env.OPENAI_API_KEY;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// API endpoint for AI image recognition
app.post('/api/guess', async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }
    
    // Convert base64 image to data URI
    const dataUri = `data:image/png;base64,${image}`;
    
    // Log the image size for debugging
    console.log(`Received image data length: ${image.length} characters`);
    
    // Send image to DashScope Qwen-VL API
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
      {
        model: 'qwen3-vl-plus',
        input: {
          messages: [
            {
              role: 'user',
              content: [
                {
                  image: dataUri,
                },
                {
                  text: '图中描绘的是什么物体或场景?请用中文简短回答。',
                }
              ],
            },
          ],
        },
        parameters: {
          max_tokens: 300,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'disable',
        },
        timeout: 30000, // 30 seconds timeout
      }
    );
    
    // Log the full response for debugging
    console.log('DashScope API Response:', JSON.stringify(response.data, null, 2));
    
    // Handle different response formats from DashScope
    let guess = '无法识别';
    
    if (response.data && response.data.output) {
      if (response.data.output.choices && response.data.output.choices.length > 0) {
        // New format
        const content = response.data.output.choices[0].message.content;
        // Handle case where content might be an array of objects
        if (Array.isArray(content)) {
          guess = content.map(item => item.text || item).join(', ');
        } else {
          guess = content;
        }
      } else if (response.data.output.text) {
        // Old format
        guess = response.data.output.text;
      }
    }
    
    res.status(200).json({ 
      success: true, 
      guess: guess || '无法识别',
      confidence: 0.95 
    });
  } catch (error: any) {
    console.error('Error processing image with DashScope:', error);
    
    // Log the full error for debugging
    console.error('Full error details:', JSON.stringify(error, null, 2));
    
    // Handle timeout errors specifically
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return res.status(408).json({ 
        error: 'Request timeout', 
        message: '请求超时，请稍后重试或检查网络连接' 
      });
    }
    
    // Handle API errors
    if (error.response && error.response.data) {
      console.error('API Error Response:', error.response.data);
      // 特别处理图像尺寸问题
      if (error.response.data.message && error.response.data.message.includes('image length and width')) {
        return res.status(400).json({
          error: 'Image size error',
          message: '图像尺寸太小，请绘制更大的图像（至少10x10像素）'
        });
      }
      return res.status(error.response.status).json({ 
        error: 'API Error', 
        message: error.response.data.message || '阿里云百炼API调用失败' 
      });
    }
    
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});