#!/usr/bin/env node

/**
 * Database Setup Script for GravityPlay
 * 
 * This script sets up the complete database schema and seeds initial data.
 * Run with: node scripts/setup-database.js
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

// Database connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING,
  ssl: {
    rejectUnauthorized: false
  }
})

async function runSQL(filename) {
  const sqlPath = path.join(__dirname, '..', 'supabase', filename)
  
  if (!fs.existsSync(sqlPath)) {
    console.log(`⚠️  SQL file not found: ${filename}`)
    return false
  }

  const sql = fs.readFileSync(sqlPath, 'utf8')
  
  try {
    console.log(`📝 Running ${filename}...`)
    await pool.query(sql)
    console.log(`✅ Successfully executed ${filename}`)
    return true
  } catch (error) {
    console.error(`❌ Error executing ${filename}:`, error.message)
    return false
  }
}

async function setupDatabase() {
  console.log('🚀 Setting up GravityPlay database...\n')

  try {
    // Test connection
    console.log('🔗 Testing database connection...')
    await pool.query('SELECT NOW()')
    console.log('✅ Database connection successful\n')

    // Run migrations in order
    const migrations = [
      'migrations/001_initial_schema.sql',
      'migrations/002_rls_policies.sql'
    ]

    for (const migration of migrations) {
      const success = await runSQL(migration)
      if (!success) {
        console.error('💥 Migration failed, stopping setup')
        process.exit(1)
      }
    }

    // Seed data
    console.log('\n📦 Seeding database with sample data...')
    const seedSuccess = await runSQL('seed.sql')
    
    if (seedSuccess) {
      console.log('\n🎉 Database setup complete!')
      console.log('📊 Sample data includes:')
      console.log('   • 5 marble run brands (GraviTrax, Marble Genius, etc.)')
      console.log('   • 11 different piece types with specifications') 
      console.log('   • 6 sample piece photos')
      console.log('   • 5 compatibility relationships')
      console.log('   • Complete database schema with RLS policies')
    }

  } catch (error) {
    console.error('💥 Setup failed:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Run setup
setupDatabase()