import http from 'http';

// First login to get token
const loginData = {
  email: "test2@example.com", 
  password: "123456"
};

const loginPostData = JSON.stringify(loginData);

const loginOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginPostData)
  }
};

const loginReq = http.request(loginOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const loginResponse = JSON.parse(data);
      if (loginResponse.success) {
        const token = loginResponse.token;
        console.log('Login successful, token:', token);
        
        // Now test creating a note
        testCreateNote(token);
      }
    } catch (e) {
      console.log('Login failed:', e.message);
    }
  });
});

loginReq.on('error', (e) => {
  console.error(`Login request error: ${e.message}`);
});

loginReq.write(loginPostData);
loginReq.end();

function testCreateNote(token) {
  const noteData = {
    title: "Test Note",
    content: "This is a test note for user-specific functionality",
    date: new Date().toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  };

  const notePostData = JSON.stringify(noteData);

  const noteOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/notes',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Length': Buffer.byteLength(notePostData)
    }
  };

  const noteReq = http.request(noteOptions, (res) => {
    console.log(`\nCreate Note Status Code: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Create Note Response:', data);
      try {
        const noteResponse = JSON.parse(data);
        console.log('Parsed Note Response:', noteResponse);
        
        if (noteResponse._id) {
          // Now test getting user notes
          testGetNotes(token);
        }
      } catch (e) {
        console.log('Failed to parse note response:', e.message);
      }
    });
  });

  noteReq.on('error', (e) => {
    console.error(`Note request error: ${e.message}`);
  });

  noteReq.write(notePostData);
  noteReq.end();
}

function testGetNotes(token) {
  const getOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/notes',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const getReq = http.request(getOptions, (res) => {
    console.log(`\nGet Notes Status Code: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Get Notes Response:', data);
      try {
        const notesResponse = JSON.parse(data);
        console.log('User Notes:', notesResponse);
        console.log(`Found ${notesResponse.length} notes for this user`);
      } catch (e) {
        console.log('Failed to parse notes response:', e.message);
      }
    });
  });

  getReq.on('error', (e) => {
    console.error(`Get notes request error: ${e.message}`);
  });

  getReq.end();
}
