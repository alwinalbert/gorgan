import os
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for your frontend

# --- CONFIGURATION ---
# Replace this with your actual key if not using environment variables
API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyDeNDiT2ax1fawv2q-cPVUO6h-xPvA8Xh4")

# Initialize the Client
client = genai.Client(api_key=API_KEY)

@app.route('/generate-image', methods=['POST'])
def generate_smart_image():
    try:
        # Get data from frontend
        data = request.json
        user_input = data.get('keywords')

        if not user_input:
            return jsonify({"error": "No keywords provided"}), 400

        print(f"\n--- New Request ---")
        print(f"1. Received User Input: {user_input}")

        # --- STEP 1: THE ENHANCER (Gemini 2.0 Flash) ---
        # We ask Gemini to act as a prompt engineer
        print("2. Agent is enhancing the prompt...")
        
        enhancement_prompt = f"""
        You are an expert AI image prompt engineer. 
        Rewrite the following user description into a single, highly detailed, photorealistic image generation prompt. 
        Focus on lighting, texture, camera angle, and artistic style.
        Do not explain your reasoning. Just output the final prompt text.
        
        User Input: "{user_input}"
        """

        enhancement_response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=enhancement_prompt
        )
        
        # This is the "Smart" prompt created by the AI
        final_prompt = enhancement_response.text.strip()
        print(f"   -> Enhanced Prompt: {final_prompt}")

        # --- STEP 2: THE GENERATOR (Imagen 3) ---
        # We send the SMART prompt to the image model
        print("3. Agent is generating image with Imagen 3...")
        
        image_response = client.models.generate_images(
            model='imagen-3.0-generate-001',
            prompt=final_prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio="1:1",  # Options: "1:1", "16:9", "4:3", etc.
                include_rai_reason=True # Helps debug if image is blocked
            )
        )

        # --- STEP 3: PROCESSING ---
        # Extract the image bytes and convert to base64 for the browser
        generated_image = image_response.generated_images[0]
        base64_img = base64.b64encode(generated_image.image.image_bytes).decode('utf-8')
        
        print("4. Success! Sending to frontend.")

        return jsonify({
            "status": "success",
            # We return the enhanced prompt too, in case you want to display it on your site!
            "enhanced_prompt_text": final_prompt,
            "image_data_url": f"data:image/jpeg;base64,{base64_img}"
        })

    except Exception as e:
        print(f"ERROR: {e}")
        return jsonify({"error": str(e), "status": "failed"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)