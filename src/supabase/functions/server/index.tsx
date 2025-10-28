import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Signup route
app.post('/make-server-dad2c3ab/signup', async (c) => {
  try {
    const { email, password, name, userType } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, userType },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Error creating user during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Create user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      userType,
      createdAt: new Date().toISOString()
    });

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log(`Error in signup route: ${error}`);
    return c.json({ error: 'Signup failed' }, 500);
  }
});

// Get user profile
app.get('/make-server-dad2c3ab/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    return c.json({ profile });
  } catch (error) {
    console.log(`Error fetching profile: ${error}`);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Save tax record
app.post('/make-server-dad2c3ab/tax-records', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const record = await c.req.json();
    const recordId = `tax-record:${user.id}:${Date.now()}`;
    
    await kv.set(recordId, {
      ...record,
      userId: user.id,
      createdAt: new Date().toISOString()
    });

    return c.json({ success: true, recordId });
  } catch (error) {
    console.log(`Error saving tax record: ${error}`);
    return c.json({ error: 'Failed to save record' }, 500);
  }
});

// Get tax records
app.get('/make-server-dad2c3ab/tax-records', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const records = await kv.getByPrefix(`tax-record:${user.id}:`);
    return c.json({ records });
  } catch (error) {
    console.log(`Error fetching tax records: ${error}`);
    return c.json({ error: 'Failed to fetch records' }, 500);
  }
});

// Save deadline
app.post('/make-server-dad2c3ab/deadlines', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const deadline = await c.req.json();
    const deadlineId = `deadline:${user.id}:${Date.now()}`;
    
    await kv.set(deadlineId, {
      ...deadline,
      userId: user.id,
      createdAt: new Date().toISOString()
    });

    return c.json({ success: true, deadlineId });
  } catch (error) {
    console.log(`Error saving deadline: ${error}`);
    return c.json({ error: 'Failed to save deadline' }, 500);
  }
});

// Get deadlines
app.get('/make-server-dad2c3ab/deadlines', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const deadlines = await kv.getByPrefix(`deadline:${user.id}:`);
    return c.json({ deadlines });
  } catch (error) {
    console.log(`Error fetching deadlines: ${error}`);
    return c.json({ error: 'Failed to fetch deadlines' }, 500);
  }
});

// Submit complaint
app.post('/make-server-dad2c3ab/complaints', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const complaint = await c.req.json();
    const complaintId = `complaint:${user.id}:${Date.now()}`;
    
    await kv.set(complaintId, {
      ...complaint,
      userId: user.id,
      status: 'Pending',
      createdAt: new Date().toISOString()
    });

    return c.json({ success: true, complaintId });
  } catch (error) {
    console.log(`Error submitting complaint: ${error}`);
    return c.json({ error: 'Failed to submit complaint' }, 500);
  }
});

// Get complaints
app.get('/make-server-dad2c3ab/complaints', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const complaints = await kv.getByPrefix(`complaint:${user.id}:`);
    return c.json({ complaints });
  } catch (error) {
    console.log(`Error fetching complaints: ${error}`);
    return c.json({ error: 'Failed to fetch complaints' }, 500);
  }
});

Deno.serve(app.fetch);
