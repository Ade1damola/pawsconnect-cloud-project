// Import required packages
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

// Create an Express app (this is our web server)
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - these help process requests
app.use(cors()); // Allows frontend to make requests
app.use(bodyParser.json()); // Helps read JSON data

// Database connection setup
// These values come from environment variables (set in Docker/Terraform)
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'pawsconnect',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password123',
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err.stack);
  } else {
    console.log('✅ Connected to database successfully!');
    release();
  }
});

// Initialize database tables when server starts
async function initDatabase() {
  try {
    // Create pets table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        species VARCHAR(50) NOT NULL,
        breed VARCHAR(100),
        age INTEGER,
        description TEXT,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create adoption_requests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS adoption_requests (
        id SERIAL PRIMARY KEY,
        pet_id INTEGER REFERENCES pets(id),
        adopter_name VARCHAR(100) NOT NULL,
        adopter_email VARCHAR(100) NOT NULL,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if we have any pets, if not, add some sample data
    const result = await pool.query('SELECT COUNT(*) FROM pets');
    if (result.rows[0].count === '0') {
      await pool.query(`
        INSERT INTO pets (name, species, breed, age, description, image_url) VALUES
        ('Luna', 'Dog', 'Golden Retriever', 2, 'Friendly and loves to play fetch!', 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400'),
        ('Mittens', 'Cat', 'Tabby', 3, 'Calm and loves cuddles', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400'),
        ('Max', 'Dog', 'Beagle', 4, 'Energetic and great with kids', 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400'),
        ('Whiskers', 'Cat', 'Persian', 1, 'Playful kitten looking for a home', 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400')
      `);
      console.log('✅ Sample pets added to database');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// API Routes (Endpoints)

// Health check endpoint - confirms the API is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', message: 'Backend is running!' });
});

// GET all pets
app.get('/api/pets', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pets ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).json({ error: 'Failed to fetch pets' });
  }
});

// GET single pet by ID
app.get('/api/pets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM pets WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching pet:', error);
    res.status(500).json({ error: 'Failed to fetch pet' });
  }
});

// POST new adoption request
app.post('/api/adoptions', async (req, res) => {
  try {
    const { pet_id, adopter_name, adopter_email, message } = req.body;
    
    // Basic validation
    if (!pet_id || !adopter_name || !adopter_email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      'INSERT INTO adoption_requests (pet_id, adopter_name, adopter_email, message) VALUES ($1, $2, $3, $4) RETURNING *',
      [pet_id, adopter_name, adopter_email, message]
    );
    
    res.status(201).json({ 
      message: 'Adoption request submitted successfully!',
      request: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating adoption request:', error);
    res.status(500).json({ error: 'Failed to submit adoption request' });
  }
});

// GET all adoption requests (for admin view)
app.get('/api/adoptions', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ar.*, p.name as pet_name 
      FROM adoption_requests ar 
      JOIN pets p ON ar.pet_id = p.id 
      ORDER BY ar.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching adoptions:', error);
    res.status(500).json({ error: 'Failed to fetch adoption requests' });
  }
});

// Start the server
app.listen(PORT, async () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  await initDatabase();
});