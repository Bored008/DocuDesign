const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for image data
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Multer for file upload
const upload = multer({ storage: multer.memoryStorage() });

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// MongoDB Connection (Optional for AI features)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.log('NOTE: MongoDB not connected. Saving/Templates will be disabled, but Magic AI will still work.');
    // console.log(err); // Suppress detailed error for cleaner logs
  });

// Schema
const DesignSchema = new mongoose.Schema({
  elements: Array,
  theme: String,
  updatedAt: { type: Date, default: Date.now }
});

const TemplateSchema = new mongoose.Schema({
  name: String,
  elements: Array,
  category: String,
  preview: String // Image data URL
});

const Design = mongoose.model('Design', DesignSchema);
const Template = mongoose.model('Template', TemplateSchema);

app.get('/', (req, res) => {
  res.send('MERN Server is running');
});

// AI Scan Endpoint
app.post('/api/ai-scan', upload.single('image'), async (req, res) => {
  try {
    const apiKey = req.body.apiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'The Magic Replicator requires a Gemini API Key to "read" the image. Please add GEMINI_API_KEY to your server\'s .env file to enable this feature.'
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }

    // Convert buffer to base64
    const imageBase64 = req.file.buffer.toString('base64');
    const genAI = new GoogleGenerativeAI(apiKey);
    const mode = req.body.mode || 'reconstruct';
    const imageWidth = parseInt(req.body.imageWidth) || 794;
    const imageHeight = parseInt(req.body.imageHeight) || 1123;

    console.log(`Processing image: ${imageWidth}x${imageHeight} in ${mode} mode`);

    // Using stable aliases discovered from the key's allowed list
    const modelsToTry = [
      "gemini-flash-latest",
      "gemini-pro-latest",
      "gemini-2.0-flash"
    ];
    let lastError = null;
    let success = false;
    let elements = [];

    for (const modelName of modelsToTry) {
      try {
        console.log(`Trying model: ${modelName} in ${mode} mode...`);
        const model = genAI.getGenerativeModel({ model: modelName });

        // Create a sophisticated, high-instruction prompt
        let prompt = "";

        if (mode === 'overlay') {
          prompt = `You are a pixel-perfect Document Masking Expert. 
          IMAGE DIMENSIONS: ${imageWidth}px wide x ${imageHeight}px tall.
          TASK: Extract EVERY text element from this image to be used for masking.

          For EACH piece of text, measure its EXACT bounding box in PIXELS:
          - x, y: Top-left corner (relative to 0,0 top-left of image).
          - width, height: Precise dimensions.
          - content: ALL characters exactly as they appear.

          JSON Schema:
          [{
            "type": "text",
            "content": "string",
            "x": number, "y": number, "width": number, "height": number,
            "styles": {
              "fontSize": number,
              "fontWeight": "bold" or "normal",
              "textAlign": "left" or "center" or "right",
              "color": "hex (text color)",
              "backgroundColor": "hex (the EXACT color of the paper behind this text)"
            }
          }]

          CRITICAL RULES:
          1. Extract EVERYTHING: headers, body, footers, labels, numbers.
          2. The "backgroundColor" must match the background of the image exactly to act as an eraser.
          3. Coordinates MUST be in absolute pixels relative to ${imageWidth}x${imageHeight}.
          4. Ensure height is at least 1.4x the fontSize to cover the text fully.`;
        } else {
          prompt = `You are a high-end Document Reconstruction Specialist. Your task is to extract all elements from the image to recreate it pixel-perfectly on an A4 canvas (794px wide by 1123px tall) in JSON format.

          CRITICAL RULES FOR ACCURACY:

          1. PERFECT SIZING & POSITIONING:
             - Every element must have precise 'x' and 'y' coordinates, and accurate 'width' and 'height' for a 794x1123 canvas.
             - Measure exactly where text is vertically (Y coordinate) to avoid overlapping.
             - Ensure text isn't cramped; assign bounding boxes large enough to fit the text comfortably.

          2. FONT SIZES (CRUCIAL):
             - Do NOT use tiny fonts unless the text is actually tiny. Analyze the visual hierarchy carefully.
             - Main Titles (e.g., University Names): 24px - 32px.
             - Subtitles / Headings (e.g., "Practical File of", "FULL STACK DEVELOPMENT"): 18px - 26px.
             - Normal Body Text (e.g., "Submitted To", Names, Roll numbers): 14px - 18px.
             - Fine Print (e.g., Bottom address formatting): 11px - 13px.
             - If a font looks large and prominent in the image, it MUST have a large fontSize (e.g., 24px+) in the JSON.

          3. AVOIDING THICK BLACK BARS (CRUCIAL):
             - You MUST NEVER create thick solid black boxes to represent thin horizontal lines.
             - If you see a horizontal dividing line, it must be a "box" with a VERY SMALL height: "height": 1 or "height": 2, and "backgroundColor": "#000000", "width": 600 (or visually matching).
             - NEVER make the height of a horizontal line larger than 2px.
             - For text elements, ALWAYS use "backgroundColor": "transparent" and "color": "#000000". DO NOT give text elements a black background unless the source image explicitly has white text on a black background block.

          4. ALIGNMENT & CENTERING:
             - For text that appears centered, you MUST use "textAlign": "center" and ensure the box takes up most of the page width (e.g., width: 650, x: 72) so the centering applies correctly relative to the page.
             - For left/right aligned blocks placed side-by-side (e.g., "Submitted To:" vs "Submitted By:"):
               Left block: x roughly 100, width: 300, textAlign: "left".
               Right block: x roughly 400, width: 300, textAlign: "left".

          5. LOGO / IMAGES:
             - Central logos should have type: "image", width: approx 180, height: 180, and x positioned to perfectly center it (e.g., x: 307).

          6. BORDERS & SHAPES:
             - If there is an outer page border, use type: "box", x: 20, y: 20, width: 754, height: 1083, "backgroundColor": "transparent", "borderWidth": 2, "borderColor": "#000000".

          JSON Schema:
          [{
            "type": "text" | "box" | "image",
            "content": "string" (for image use a placeholder text if needed),
            "x": number, "y": number, "width": number, "height": number,
            "styles": {
              "fontSize": number,
              "fontWeight": "bold" | "normal",
              "textAlign": "left" | "center" | "right",
              "fontFamily": "Times New Roman, serif",
              "color": "hex",
              "backgroundColor": "hex or transparent",
              "borderColor": "hex",
              "borderWidth": number
            }
          }]

          CRITICAL: 
          - Return ONLY valid JSON array.
          - DO NOT ADD ANY MARKDOWN (NO \`\`\`json). JUST THE RAW ARRAY.
          - Map everything accurately to 794 x 1123 coordinates.`;
        }

        prompt += "\n\nReturn ONLY valid JSON. No conversational text.";

        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: imageBase64,
              mimeType: req.file.mimetype
            }
          }
        ]);

        const response = await result.response;
        let text = response.text();
        console.log(`Raw AI response (first 500 chars): ${text.substring(0, 500)}`);

        // Robust cleaning: Extract only the JSON array part
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']');

        if (start !== -1 && end !== -1) {
          text = text.substring(start, end + 1);
        } else {
          // Fallback cleanup if brackets aren't clear (though they should be)
          text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        }

        try {
          elements = JSON.parse(text);
        } catch (parseError) {
          console.error("JSON Parse Error:", parseError);
          console.error("Failed text:", text);
          throw new Error(`Failed to parse AI response: ${parseError.message}`);
        }

        if (!Array.isArray(elements) || elements.length === 0) {
          console.warn('AI returned empty or invalid array, retrying with next model...');
          continue;
        }

        console.log(`Successfully scanned ${elements.length} elements using ${modelName} in ${mode} mode.`);
        console.log(`First element:`, JSON.stringify(elements[0], null, 2));
        success = true;
        break;
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} failed:`, err.message);
        // If it's a 404, try next. If it's a 429 (rate limit), try next model 
        // as different models have different quotas. 
        if (err.message.includes('404') || err.message.includes('429')) continue;
        else break;
      }
    }

    if (success) {
      res.json({ success: true, elements });
    } else {
      if (lastError?.message?.includes('429')) {
        return res.status(429).json({
          success: false,
          error: "Free Quota Exceeded! Google limits the number of free scans per minute. Please wait 60 seconds and try again."
        });
      }
      throw lastError;
    }

  } catch (err) {
    console.error("AI Scan Error:", err);
    res.status(500).json({ success: false, error: err.message || 'AI processing failed' });
  }
});

// Templates API
app.get('/api/templates', async (req, res) => {
  try {
    const templates = await Template.find();
    res.json({ success: true, data: templates });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/templates', async (req, res) => {
  try {
    const { name, elements, category, preview } = req.body;
    const template = new Template({ name, elements, category, preview });
    await template.save();
    res.json({ success: true, data: template });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Save Design
app.post('/api/save', async (req, res) => {
  try {
    const { elements, theme, id } = req.body;
    let design;

    if (id) {
      design = await Design.findByIdAndUpdate(id, { elements, theme, updatedAt: Date.now() }, { new: true });
    } else {
      design = new Design({ elements, theme });
      await design.save();
    }

    res.json({ success: true, id: design._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Load Design
app.get('/api/load/:id', async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: design });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Load Latest (simplified for single user)
app.get('/api/latest', async (req, res) => {
  try {
    const design = await Design.findOne().sort({ updatedAt: -1 });
    res.json({ success: true, data: design });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    console.log(`Gemini API Key detected: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const listModels = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy
      // There isn't a direct 'list' in the simple genAI object usually, 
      // but we can try to find what's wrong by checking the model naming.
      console.log("Attempting to verify model access...");
    } catch (e) {
      console.error("Model verification error:", e.message);
    }
  } else {
    console.warn('WARNING: Gemini API Key NOT detected in process.env');
  }
});
