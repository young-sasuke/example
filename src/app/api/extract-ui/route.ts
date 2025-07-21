// src/app/api/extract-ui/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Extract Tailor Images</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    .container { background: #f5f5f5; padding: 30px; border-radius: 10px; }
    h1 { color: #333; }
    button { 
      background: #4CAF50; 
      color: white; 
      padding: 15px 30px; 
      border: none; 
      border-radius: 5px; 
      font-size: 18px; 
      cursor: pointer; 
      margin: 10px 0;
    }
    button:hover { background: #45a049; }
    button:disabled { background: #ccc; cursor: not-allowed; }
    .results { 
      margin-top: 20px; 
      padding: 20px; 
      background: white; 
      border-radius: 5px; 
      white-space: pre-wrap;
      font-family: monospace;
      display: none;
    }
    .success { color: green; font-weight: bold; }
    .error { color: red; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🖼️ Extract Images from Tailors</h1>
    <p>This will extract all images from the boutique_items field in your tailors collection.</p>
    
    <button id="extractBtn" onclick="extractImages()">
      Extract All Images
    </button>
    
    <div id="results" class="results"></div>
    
    <hr style="margin: 30px 0;">
    
    <h2>📊 Current Status</h2>
    <button onclick="checkStatus()">Check Images Collection</button>
    
    <div id="status" class="results"></div>
  </div>

  <script>
    async function extractImages() {
      const btn = document.getElementById('extractBtn');
      const results = document.getElementById('results');
      
      btn.disabled = true;
      btn.textContent = 'Extracting... (this may take a while)';
      results.style.display = 'block';
      results.innerHTML = 'Starting extraction...\\n\\n';
      
      try {
        const response = await fetch('/api/extract-visible-images', {
          method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
          results.innerHTML += '<span class="success">✅ Extraction completed!</span>\\n\\n';
          results.innerHTML += 'Results:\\n' + JSON.stringify(data.results, null, 2) + '\\n\\n';
          results.innerHTML += 'Tailor Report:\\n' + JSON.stringify(data.tailorReport, null, 2);
        } else {
          results.innerHTML += '<span class="error">❌ Extraction failed!</span>\\n\\n';
          results.innerHTML += JSON.stringify(data, null, 2);
        }
      } catch (error) {
        results.innerHTML += '<span class="error">❌ Error: ' + error.message + '</span>';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Extract All Images';
      }
    }
    
    async function checkStatus() {
      const status = document.getElementById('status');
      status.style.display = 'block';
      status.innerHTML = 'Checking...\\n\\n';
      
      try {
        const response = await fetch('/api/images?limit=10');
        const data = await response.json();
        
        status.innerHTML = 'Images Collection Status:\\n\\n';
        status.innerHTML += 'Total Images: ' + data.totalDocs + '\\n\\n';
        
        if (data.docs && data.docs.length > 0) {
          status.innerHTML += 'Recent Images:\\n';
          data.docs.forEach((img, i) => {
            status.innerHTML += '\\n' + (i + 1) + '. ' + img.alt;
            status.innerHTML += '\\n   Source: ' + (img.sourceUrl || 'N/A');
            status.innerHTML += '\\n   From: ' + (img.tailorName || 'Unknown');
            status.innerHTML += '\\n';
          });
        }
      } catch (error) {
        status.innerHTML = '<span class="error">Error checking status: ' + error.message + '</span>';
      }
    }
  </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    },
  });
}