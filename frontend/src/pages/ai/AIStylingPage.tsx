import { useState, useEffect } from 'react';
import axios from 'axios';

interface Material {
  material_id: string;
  name: string;
  series: string;
  positive_prompt: string;
}

const AIStylingPage = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [originalImage, setOriginalImage] = useState<string>('');
  const [resultImage, setResultImage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await axios.get('http://localhost:3001/materials');
        setMaterials(response.data);
        if (response.data.length > 0) {
          setSelectedMaterial(response.data[0].material_id);
        }
      } catch (err) {
        setError('Failed to load materials from MCP server');
        console.error(err);
      }
    };

    fetchMaterials();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setOriginalImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!selectedMaterial || !originalImage) {
      setError('Please select material and upload image');
      return;
    }

    setLoading(true);
    setError('');
    setResultImage('');

    try {
      const cleanImage = originalImage.includes(',')
        ? originalImage.split(',')[1]
        : originalImage;

      const response = await axios.post('/webhook/style-building', {
        material_id: selectedMaterial,
        image_base64: cleanImage
      });

      console.log('API Response:', response.data);

      if (response.data?.success) {
        const imageData = response.data.image_base64;
        if (imageData) {
          setResultImage(`data:image/png;base64,${imageData}`);
        } else {
          setError('No image returned from API');
        }
      } else {
        setError(response.data?.error || 'Unknown error');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to generate');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Phomistone SaaS - AI Styling</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>NanoBanana Pro (Gemini 3 Pro Image Preview)</p>

      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#fee',
          color: '#c00',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #fcc'
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ marginBottom: '10px' }}>1. Select Material</h3>
        <select
          value={selectedMaterial}
          onChange={(e) => setSelectedMaterial(e.target.value)}
          style={{
            padding: '12px',
            fontSize: '16px',
            width: '100%',
            border: '2px solid #ddd',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          {materials.map((mat) => (
            <option key={mat.material_id} value={mat.material_id}>
              {mat.name} - {mat.series}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ marginBottom: '10px' }}>2. Upload Building Image</h3>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{
            padding: '10px',
            fontSize: '16px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        />
        {originalImage && (
          <div style={{ marginTop: '15px' }}>
            <img
              src={originalImage}
              alt="Original"
              style={{
                maxWidth: '500px',
                maxHeight: '400px',
                border: '3px solid #ddd',
                borderRadius: '8px'
              }}
            />
          </div>
        )}
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !selectedMaterial || !originalImage}
        style={{
          padding: '16px 40px',
          fontSize: '18px',
          fontWeight: 'bold',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '30px'
        }}
      >
        {loading ? 'NanoBanana Pro is generating...' : 'Generate AI Styling'}
      </button>

      {resultImage && (
        <div>
          <h3 style={{ marginBottom: '15px' }}>Result</h3>
          <img
            src={resultImage}
            alt="Result"
            style={{
              maxWidth: '100%',
              border: '3px solid #007bff',
              borderRadius: '8px'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AIStylingPage;
