#!/usr/bin/env node

/**
 * Supabase Setup Script for GravityPlay
 * 
 * This script sets up the database schema using Supabase client.
 * Run with: node scripts/setup-supabase.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runSQL(filename) {
  const sqlPath = path.join(__dirname, '..', 'supabase', filename)
  
  if (!fs.existsSync(sqlPath)) {
    console.log(`⚠️  SQL file not found: ${filename}`)
    return false
  }

  const sql = fs.readFileSync(sqlPath, 'utf8')
  
  try {
    console.log(`📝 Running ${filename}...`)
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      throw error
    }
    
    console.log(`✅ Successfully executed ${filename}`)
    return true
  } catch (error) {
    console.error(`❌ Error executing ${filename}:`, error.message)
    return false
  }
}

async function createExecSQLFunction() {
  console.log('🔧 Creating exec_sql helper function...')
  
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
    RETURNS text
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql_query;
      RETURN 'Success';
    EXCEPTION
      WHEN OTHERS THEN
        RETURN 'Error: ' || SQLERRM;
    END;
    $$;
  `
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: createFunctionSQL })
    if (error && !error.message.includes('function "exec_sql" does not exist')) {
      throw error
    }
    console.log('✅ Helper function ready')
    return true
  } catch (error) {
    console.log('⚠️  Creating function manually via individual queries')
    return false
  }
}

async function setupDatabaseDirect() {
  console.log('🚀 Setting up GravityPlay database directly...\n')

  try {
    // Test connection
    console.log('🔗 Testing Supabase connection...')
    const { data, error } = await supabase.from('pg_tables').select('*').limit(1)
    if (error) throw error
    console.log('✅ Supabase connection successful\n')

    // Create brands table
    console.log('📝 Creating brands table...')
    const { error: brandsError } = await supabase.sql`
      CREATE TABLE IF NOT EXISTS brands (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR NOT NULL UNIQUE,
        slug VARCHAR NOT NULL UNIQUE,
        description TEXT,
        logo_url TEXT,
        website_url TEXT,
        country VARCHAR(2),
        founded_year INTEGER,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
    if (brandsError) {
      console.error('Error creating brands table:', brandsError)
    } else {
      console.log('✅ Brands table created')
    }

    // Insert sample brand data
    console.log('📦 Inserting sample brands...')
    const { error: insertError } = await supabase
      .from('brands')
      .upsert([
        {
          name: 'GraviTrax',
          slug: 'gravitrax',
          description: 'The interactive track system by Ravensburger that combines creativity, engineering, and gravity.',
          website_url: 'https://www.gravitrax.com',
          country: 'DE',
          founded_year: 2017
        },
        {
          name: 'Marble Genius',
          slug: 'marble-genius',
          description: 'Premium wooden marble run sets designed for both children and adults.',
          website_url: 'https://www.marblegenius.com',
          country: 'US',
          founded_year: 2015
        }
      ], { 
        onConflict: 'slug' 
      })

    if (insertError) {
      console.error('Error inserting brands:', insertError)
    } else {
      console.log('✅ Sample brands inserted')
    }

    console.log('\n🎉 Basic database setup complete!')
    console.log('📊 You can now:')
    console.log('   • Test the application locally with npm run dev')
    console.log('   • Continue building the remaining schema in Supabase dashboard')
    console.log('   • Deploy to production with the environment variables')

  } catch (error) {
    console.error('💥 Setup failed:', error.message)
    process.exit(1)
  }
}

// Run setup
setupDatabaseDirect()