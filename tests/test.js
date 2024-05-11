const axios = require('axios');
const { ObjectId } = require('mongodb');
const userId = new ObjectId().toHexString();
const API_URL = 'http://localhost:8000';

let businessId;
let photoId;
let reviewId;

describe('Business Endpoint Tests', () => {

    const business = {
        ownerid: userId,
        name: "Test Business Name",
        address: "Business Address",
        city: "Redmond",
        state: "Oregon",
        zip: 97756,
        phone: "5411234567",
        category: "School",
        subcategory: "College",
        website: "me.com",
    };

    test('POST /businesses', async () => {
        const response = await axios.post(`${API_URL}/businesses`, business);
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty("id");
        expect(response.data).toHaveProperty("links");
        businessId = response.data.id;
    });

    test('GET /businesses', async () => {
        const response = await axios.get(`${API_URL}/businesses`);
        expect(response.status).toBe(200);
    });

    test('GET /businesses/:businessid', async () => {
        const response = await axios.get(`${API_URL}/businesses/${businessId}`);
        expect(response.status).toBe(200);
    });

    test('PUT /businesses/:businessid', async () => {
        business.name = "Updated Business Name";
        const response = await axios.put(`${API_URL}/businesses/${businessId}`, business);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("links");
    })

    test('DELETE /businesses/:businessid', async () => {
        business.name = "Updated Business Name";
        const response = await axios.delete(`${API_URL}/businesses/${businessId}`);
        expect(response.status).toBe(204);
    })
});


describe('Photo Endpoint Tests', () => {
    let businessId;
    let photo;

    const business = {
        ownerid: userId,
        name: "Test Business With Photo Name",
        address: "Business Address",
        city: "Redmond",
        state: "Oregon",
        zip: 97756,
        phone: "5411234567",
        category: "School",
        subcategory: "College",
        website: "me.com",
    };

    beforeAll(async () => {
        const response = await axios.post(`${API_URL}/businesses`, business);

        businessId = response.data.id;
        photo = {
            userid: userId,
            businessid: businessId,
            caption: "Test Review Caption"
        };
    });

    test('POST /photos', async () => {
        const response = await axios.post(`${API_URL}/photos`, photo);
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty("id");
        expect(response.data).toHaveProperty("links");
        photoId = response.data.id;
    });

    test('GET /photos/:photoid', async () => {
        const response = await axios.get(`${API_URL}/photos/${photoId}`);
        expect(response.status).toBe(200);
    });

    test('PUT /photos/:photoid', async () => {
        photo.caption = "Updated Photo Caption";
        const response = await axios.put(`${API_URL}/photos/${photoId}`, photo);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("links");
    })

    test('DELETE /photos/:photoid', async () => {
        const response = await axios.delete(`${API_URL}/photos/${photoId}`);
        expect(response.status).toBe(204);
    })
});

describe('Review Endpoint Tests', () => {

    let review;

    const business = {
        ownerid: userId,
        name: "Test Business With Photo Name",
        address: "Business Address",
        city: "Redmond",
        state: "Oregon",
        zip: 97756,
        phone: "5411234567",
        category: "School",
        subcategory: "College",
        website: "me.com",
    };

    beforeAll(async () => {
        const response = await axios.post(`${API_URL}/businesses`, business);

        businessId = response.data.id;
        review = {
            userid: userId,
            businessid: response.data.id,
            dollars: "5",
            stars: "1",
            review: "Test Review"
        };
    });

    test('POST /reviews', async () => {
        const response = await axios.post(`${API_URL}/reviews`, review);
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty("id");
        expect(response.data).toHaveProperty("links");
        reviewId = response.data.id;
    });

    test('GET /reviews/:reviewid', async () => {
        const response = await axios.get(`${API_URL}/reviews/${reviewId}`);
        expect(response.status).toBe(200);
    });

    test('PUT /reviews/:reviewid', async () => {
        review.dollars = "4";
        const response = await axios.put(`${API_URL}/reviews/${reviewId}`, review);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("links");
    })

    test('DELETE /reviews/:reviewid', async () => {
        const response = await axios.delete(`${API_URL}/reviews/${reviewId}`);
        expect(response.status).toBe(204);
    })
});


describe('User Endpoint Tests', () => {

    const user = {
        _id: userId,
        name: "Test User",
        email: "example@example.com",
        password: "testpass"
    }

    test('POST /users', async () => {
        const response = await axios.post(`${API_URL}/users`, user);
        expect(response.status).toBe(201);
    })

    test('GET /users/:userid/photos', async () => {
        const response = await axios.get(`${API_URL}/users/${userId}/photos`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("photos");
    });

    test('GET /users/:userid/reviews', async () => {
        const response = await axios.get(`${API_URL}/users/${userId}/reviews`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("reviews");
    });

    test('GET /users/:userid/businesses', async () => {
        const response = await axios.get(`${API_URL}/users/${userId}/businesses`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("businesses");
    });
});