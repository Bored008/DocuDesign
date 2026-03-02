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
          prompt = `You are a high-end Document Reconstruction Specialist. Match this document EXACTLY.
          
          TASK: Create a clean, perfectly aligned editable version.
          
          CRITICAL: MAP ALL COORDINATES TO A STANDARD A4 CANVAS (794px x 1123px).
          - Ignore the actual resolution of the image.
          - Assume you are redrawing this on a 794x1123 pixel canvas.
          - Resize everything proportionally to fit this A4 size.

          IMPORTANT VISUAL RULES (For A4 Size):
          1. **NO THICK BLACK BARS**: Horizontal lines must be:
             - "height": 2, "backgroundColor": "#000000" (for solid lines) OR
             - "backgroundColor": "transparent", "borderBottomWidth": 1, "borderStyle": "dashed" (for dashed lines).
          
          2. **HEADER ALIGNMENT**: The main university title must be CENTERED on the 794px width.
             - "textAlign": "center"
             - Coordinate X should be approx (794 - width) / 2.
             - Ensure it doesn't drift to the right.

          3. **FONT SIZES (For A4 Canvas)**:
             - Main Titles: 24px - 32px (Bold).
             - Sub-Headings: 18px - 22px (Bold).
             - Body Text: 12px - 14px.
             - Footer/Labels: 10px - 11px.
             - NOTE: These are standard web sizes that look correct on A4. Do not use 48px unless it is HUGE.

          4. **LOGOS**:
             - Center the logo image.
             - Size: approx 150x150px to 200x200px.

          5. **PAGE BORDER**:
             - Create a page border box if visible.
             - x: 20, y: 20, width: 754, height: 1083.
             - "backgroundColor": "transparent", "borderWidth": 1, "borderColor": "#000000".

          JSON Schema:
          [{
            "type": "text" | "box" | "image",
            "content": "string",
            "x": number, "y": number, "width": number, "height": number,
            "styles": {
              "fontSize": number,
              "fontWeight": "bold" | "normal",
              "textAlign": "left" | "center" | "right",
              "fontFamily": "Inter, sans-serif",
              "color": "hex",
              "backgroundColor": "hex or transparent",
              "borderColor": "hex",
              "borderWidth": number,
              "borderBottomWidth": number,
              "borderStyle": "solid" | "dashed" | "dotted"
            }
          }]

          CRITICAL: 
          - Return ONLY valid JSON.
          - Ensure "backgroundColor" is "transparent" for text.
          - Map everything to 794 x 1123 coordinates.`;
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
