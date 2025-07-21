// src/app/api/test-page/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Image Extraction Test</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 1200px; margin: 0 auto; }
    .section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
    button { padding: 10px 20px; margin: 10px; cursor: pointer; border-radius: 4px; border: none; }
    .primary { background: #007bff; color: white; }
    .success { background: #28a745; color: white; }
    .danger { background: #dc3545; color: white; }
    .results { margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 4px; }
    pre { white-space: pre-wrap; word-wrap: break-word; }
    .loading { opacity: 0.5; }
  </style>
</head>
<body>
  <h1>Image Extraction Test Dashboard</h1>
  
  <div class="section">
    <h2>Step 1: Debug - Check What's in Your Tailors</h2>
    <button class="primary" onclick="debugImages()">Debug Tailors Data</button>
    <div id="debugResults" class="results" style="display:none;"></div>
  </div>

  <div class="section">
    <h2>Step 2: Force Extract Images</h2>
    <p>This will extract images from the first 10 tailors</p>
    <button class="success" onclick="forceExtract()">Force Extract Images</button>
    <div id="extractResults" class="results" style="display:none;"></div>
  </div>

  <div class="section">
    <h2>Step 3: Check Images Collection</h2>
    <button class="primary" onclick="checkImages()">Check Images Collection</button>
    <div id="imagesResults" class="results" style="display:none;"></div>
  </div>

  <script>
    async function debugImages() {
      const btn = event.target;
      const resultsDiv = document.getElementById('debugResults');
      
      btn.disabled = true;
      btn.textContent = 'Loading...';
      resultsDiv.style.display = 'block';
      resultsDiv.innerHTML = 'Fetching tailor data...';
      
      try {
        const response = await fetch('/api/debug-images');
        const data = await response.json();
        
        resultsDiv.innerHTML = '<h3>Debug Results:</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
        
        if (data.totalImagesFound === 0) {
          resultsDiv.innerHTML += '<p style="color: red; font-weight: bold;">⚠️ No images found in tailors data!</p>';
        } else {
          resultsDiv.innerHTML += '<p style="color: green; font-weight: bold;">✅ Found ' + data.totalImagesFound + ' images!</p>';
        }
      } catch (error) {
        resultsDiv.innerHTML = '<p style="color: red;">Error: ' + error.message + '</p>';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Debug Tailors Data';
      }
    }

    async function forceExtract() {
      const btn = event.target;
      const resultsDiv = document.getElementById('extractResults');
      
      btn.disabled = true;
      btn.textContent = 'Extracting...';
      resultsDiv.style.display = 'block';
      resultsDiv.innerHTML = 'Starting extraction process...';
      
      try {
        const response = await fetch('/api/force-extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ limit: 10 })
        });
        const data = await response.json();
        
        resultsDiv.innerHTML = '<h3>Extraction Results:</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
        
        if (data.results && data.results.imagesCreated > 0) {
          resultsDiv.innerHTML += '<p style="color: green; font-weight: bold;">✅ Successfully created ' + data.results.imagesCreated + ' images!</p>';
        }
      } catch (error) {
        resultsDiv.innerHTML = '<p style="color: red;">Error: ' + error.message + '</p>';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Force Extract Images';
      }
    }

    async function checkImages() {
      const btn = event.target;
      const resultsDiv = document.getElementById('imagesResults');
      
      btn.disabled = true;
      btn.textContent = 'Checking...';
      resultsDiv.style.display = 'block';
      resultsDiv.innerHTML = 'Fetching images...';
      
      try {
        const response = await fetch('/api/images?limit=20');
        const data = await response.json();
        
        resultsDiv.innerHTML = '<h3>Images in Collection:</h3>';
        resultsDiv.innerHTML += '<p>Total images: ' + data.totalDocs + '</p>';
        
        if (data.docs && data.docs.length > 0) {
          resultsDiv.innerHTML += '<h4>Recent Images:</h4>';
          data.docs.forEach(img => {
            resultsDiv.innerHTML += '<div style="margin: 10px 0; padding: 10px; border: 1px solid #ddd;">';
            resultsDiv.innerHTML += '<p><strong>ID:</strong> ' + img.id + '</p>';
            resultsDiv.innerHTML += '<p><strong>Alt:</strong> ' + img.alt + '</p>';
            resultsDiv.innerHTML += '<p><strong>Source URL:</strong> ' + (img.sourceUrl || 'N/A') + '</p>';
            resultsDiv.innerHTML += '<p><strong>From Collection:</strong> ' + (img.sourceCollection || 'N/A') + '</p>';
            if (img.url) {
              resultsDiv.innerHTML += '<img src="' + img.url + '" style="max-width: 200px; max-height: 150px;" />';
            }
            resultsDiv.innerHTML += '</div>';
          });
        } else {
          resultsDiv.innerHTML += '<p style="color: orange;">No images found in the collection.</p>';
        }
      } catch (error) {
        resultsDiv.innerHTML = '<p style="color: red;">Error: ' + error.message + '</p>';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Check Images Collection';
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