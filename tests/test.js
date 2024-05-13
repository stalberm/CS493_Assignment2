const axios = require('axios');
const API_URL = 'http://localhost:8000';

const adminEmail = "admin@example.com"
const adminPass = "hunter2"

const user = {
    name: "Test User",
    email: "example@example.com",
    password: "testpass"
}

describe('User Endpoint Tests', () => {

    let validAdminToken;
    beforeAll(async () => {
        const loginResponse = await axios.post(`${API_URL}/users/login`, { "email": adminEmail, "password": adminPass });
        validAdminToken = loginResponse.data.token;
    });

    let validUserToken;
    let userId;

    test('POST /users/login Admin Wrong Creds', async () => {
        try {
            await axios.post(`${API_URL}/users/login`, { "email": adminEmail, "password": "wrongpass" });
        } catch (error) {
            expect(error.response.status).toBe(401);
        }
    })

    test('POST /users Without Admin Status', async () => {
        try {
            await axios.post(`${API_URL}/users`, user);
        } catch (error) {
            expect(error.response.status).toBe(403);
        }
    })


    test('POST /users With Admin Status', async () => {
        const headers = {
            'Authorization': `Bearer ${validAdminToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.post(`${API_URL}/users`, user, config);
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty("id");
        userId = response.data.id;
    })

    test('POST /users/login Regular User', async () => {
        const response = await axios.post(`${API_URL}/users/login`, { "email": user.email, "password": user.password });
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("token");
        validUserToken = response.data.token;
    })

    test('POST /users/login Regular User Wrong Creds', async () => {
        try {
            await axios.post(`${API_URL}/users/login`, { "email": user.email, "password": "wrong" });
        } catch (error) {
            expect(error.response.status).toBe(401);
        }
    })

    test('GET /users/:userid As User', async () => {
        const headers = {
            'Authorization': `Bearer ${validUserToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.get(`${API_URL}/users/${userId}`, config);
        expect(response.status).toBe(200);
        expect(response.data.email).toEqual(user.email);
        expect(response.data.name).toEqual(user.name);

    })

    test('GET /users/:userid As Admin', async () => {
        const headers = {
            'Authorization': `Bearer ${validAdminToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.get(`${API_URL}/users/${userId}`, config);
        expect(response.status).toBe(200);
        expect(response.data.email).toEqual(user.email);
        expect(response.data.name).toEqual(user.name);
    })

    test('GET /users/:userid As Invalid Token', async () => {
        const headers = {
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }

        try {
            await axios.get(`${API_URL}/users/${userId}`, config);
        } catch (error) {
            expect(error.response.status).toBe(401);
        }
    })
    //businesses
    test('GET /users/:userid/businesses', async () => {
        const headers = {
            'Authorization': `Bearer ${validUserToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.get(`${API_URL}/users/${userId}/businesses`, config);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("businesses");
    })

    test('GET /users/:userid/businesses As Admin', async () => {
        const headers = {
            'Authorization': `Bearer ${validAdminToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.get(`${API_URL}/users/${userId}/businesses`, config);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("businesses");
    })

    test('GET /users/:userid/businesses As Invalid Token', async () => {
        const headers = {
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        try {
            await axios.get(`${API_URL}/users/${userId}/businesses`, config);
        } catch (error) {
            expect(error.response.status).toBe(401);
        }
    })
    //photos
    test('GET /users/:userid/photos', async () => {
        const headers = {
            'Authorization': `Bearer ${validUserToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.get(`${API_URL}/users/${userId}/photos`, config);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("photos");
    })

    test('GET /users/:userid/photos As Admin', async () => {
        const headers = {
            'Authorization': `Bearer ${validAdminToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.get(`${API_URL}/users/${userId}/photos`, config);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("photos");
    })

    test('GET /users/:userid/photos As Invalid Token', async () => {
        const headers = {
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        try {
            await axios.get(`${API_URL}/users/${userId}/photos`, config);
        } catch (error) {
            expect(error.response.status).toBe(401);
        }
    })
    //Reviews
    test('GET /users/:userid/reviews', async () => {
        const headers = {
            'Authorization': `Bearer ${validUserToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.get(`${API_URL}/users/${userId}/reviews`, config);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("reviews");
    })

    test('GET /users/:userid/reviews As Admin', async () => {
        const headers = {
            'Authorization': `Bearer ${validAdminToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.get(`${API_URL}/users/${userId}/reviews`, config);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("reviews");
    })

    test('GET /users/:userid/reviews As Invalid Token', async () => {
        const headers = {
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        try {
            await axios.get(`${API_URL}/users/${userId}/reviews`, config);
        } catch (error) {
            expect(error.response.status).toBe(401);
        }
    })
});

