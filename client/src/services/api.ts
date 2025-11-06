const API_BASE_URL = 'http://localhost:3001';

export interface GuessResponse {
  success: boolean;
  guess: string;
  confidence: number;
}

export interface GuessRequest {
  image: string; // base64 encoded image
}

export const sendImageForGuess = async (imageData: string): Promise<GuessResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/guess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageData }),
    });

    if (!response.ok) {
      // 尝试解析错误响应
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // 如果不能解析JSON，则使用默认消息
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Validate response format
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid response format from server');
    }
    
    // Ensure required fields exist
    const validData: GuessResponse = {
      success: typeof data.success === 'boolean' ? data.success : false,
      guess: typeof data.guess === 'string' ? data.guess : '未知结果',
      confidence: typeof data.confidence === 'number' ? data.confidence : 0
    };
    
    return validData;
  } catch (error: any) {
    console.error('Error sending image for guess:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('网络连接失败，请检查后端服务是否正常运行');
    }
    
    if (error.message) {
      throw new Error(error.message);
    }
    
    throw new Error('未知错误，请稍后重试');
  }
};